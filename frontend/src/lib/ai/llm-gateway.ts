import { z } from "zod";

export type LLMProviderMode = "live_gemini" | "live_openai" | "deterministic";

export interface LLMGenerationRequest<T> {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodSchema<T>;
  fallback: () => T;
  preferredModel?: string;
}

export interface LLMGenerationResponse<T> {
  output: T;
  mode: LLMProviderMode;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  tokensUsed: number;
  costEstimatedUsd: number;
  durationMs: number;
}

export function sanitizeUntrustedPromptText(input: string, maxLen = 1500): string {
  return input
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/<\/?(system|assistant|developer|tool_call)>/gi, "[redacted-tag]")
    .trim()
    .slice(0, maxLen);
}

export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

function stripJsonFence(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function isConfiguredKey(key?: string): key is string {
  return Boolean(key && key.trim().length > 10 && !key.includes("placeholder") && !key.includes("your_"));
}

async function callGeminiJson(systemPrompt: string, userPrompt: string, model = "gemini-2.0-flash") {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!isConfiguredKey(apiKey)) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
    });
    if (!res.ok) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof rawText !== "string") return null;

    const usage = data?.usageMetadata || {};
    const promptTokens = Number(usage.promptTokenCount ?? estimateTokenCount(systemPrompt + userPrompt));
    const completionTokens = Number(usage.candidatesTokenCount ?? estimateTokenCount(rawText));
    const totalTokens = Number(usage.totalTokenCount ?? promptTokens + completionTokens);
    // Gemini 2.0 Flash pricing approximation (~$0.10/1M input, $0.40/1M output)
    const costEstimatedUsd = Number(
      ((promptTokens / 1_000_000) * 0.1 + (completionTokens / 1_000_000) * 0.4).toFixed(6)
    );

    return {
      rawText: stripJsonFence(rawText),
      provider: "Google Gemini",
      model,
      promptTokens,
      completionTokens,
      tokensUsed: totalTokens,
      costEstimatedUsd,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function callOpenAIJson(systemPrompt: string, userPrompt: string, model = "gpt-4o-mini") {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!isConfiguredKey(apiKey)) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    if (!res.ok) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    const rawText = data?.choices?.[0]?.message?.content;
    if (typeof rawText !== "string") return null;

    const usage = data?.usage || {};
    const promptTokens = Number(usage.prompt_tokens ?? estimateTokenCount(systemPrompt + userPrompt));
    const completionTokens = Number(usage.completion_tokens ?? estimateTokenCount(rawText));
    const totalTokens = Number(usage.total_tokens ?? promptTokens + completionTokens);
    // gpt-4o-mini pricing (~$0.15/1M input, $0.60/1M output)
    const costEstimatedUsd = Number(
      ((promptTokens / 1_000_000) * 0.15 + (completionTokens / 1_000_000) * 0.6).toFixed(6)
    );

    return {
      rawText: stripJsonFence(rawText),
      provider: "OpenAI",
      model,
      promptTokens,
      completionTokens,
      tokensUsed: totalTokens,
      costEstimatedUsd,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Generates Zod-validated structured JSON via Gemini/OpenAI when configured,
 * or falls back transparently to deterministic execution with $0 actual spend.
 */
export async function generateStructuredWithGateway<T>(
  request: LLMGenerationRequest<T>
): Promise<LLMGenerationResponse<T>> {
  const startTime = Date.now();
  const geminiModel =
    request.preferredModel?.includes("gemini") ? request.preferredModel : "gemini-2.0-flash";
  const openaiModel =
    request.preferredModel?.includes("gpt") ? request.preferredModel : "gpt-4o-mini";

  const geminiResult = await callGeminiJson(request.systemPrompt, request.userPrompt, geminiModel);
  if (geminiResult) {
    try {
      const parsed = request.schema.parse(JSON.parse(geminiResult.rawText));
      return {
        output: parsed,
        mode: "live_gemini",
        provider: geminiResult.provider,
        model: geminiResult.model,
        promptTokens: geminiResult.promptTokens,
        completionTokens: geminiResult.completionTokens,
        tokensUsed: geminiResult.tokensUsed,
        costEstimatedUsd: geminiResult.costEstimatedUsd,
        durationMs: Date.now() - startTime,
      };
    } catch {
      // Schema validation failed; try fallback provider below
    }
  }

  const openaiResult = await callOpenAIJson(request.systemPrompt, request.userPrompt, openaiModel);
  if (openaiResult) {
    try {
      const parsed = request.schema.parse(JSON.parse(openaiResult.rawText));
      return {
        output: parsed,
        mode: "live_openai",
        provider: openaiResult.provider,
        model: openaiResult.model,
        promptTokens: openaiResult.promptTokens,
        completionTokens: openaiResult.completionTokens,
        tokensUsed: openaiResult.tokensUsed,
        costEstimatedUsd: openaiResult.costEstimatedUsd,
        durationMs: Date.now() - startTime,
      };
    } catch {
      // Schema validation failed; fall through to deterministic fallback
    }
  }

  const output = request.schema.parse(request.fallback());
  const promptTokens = estimateTokenCount(`${request.systemPrompt}\n${request.userPrompt}`);
  const completionTokens = estimateTokenCount(JSON.stringify(output));
  return {
    output,
    mode: "deterministic",
    provider: "Local Deterministic Engine (No External LLM Key Configured)",
    model: "deterministic-rules-v1",
    promptTokens,
    completionTokens,
    tokensUsed: promptTokens + completionTokens,
    costEstimatedUsd: 0,
    durationMs: Date.now() - startTime,
  };
}
