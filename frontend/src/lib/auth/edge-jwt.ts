export const COOKIE_NAME = "agencyos_token";

export interface SessionUser {
  userId: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
  exp?: number;
}

const DEV_JWT_FALLBACK = "agencyos-dev-jwt-super-secret-key-min-32-chars-long";

export function getJwtSecret(): string | null {
  const configured = process.env.JWT_SECRET?.trim();
  if (configured && configured.length >= 16) {
    return configured;
  }
  if (process.env.NODE_ENV === "production") {
    return null;
  }
  return DEV_JWT_FALLBACK;
}

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLen);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Verifies an HS256 JWT token using Web Crypto API (Edge & Cloudflare Workers safe).
 */
export async function verifyTokenEdge(token: string): Promise<SessionUser | null> {
  try {
    const secret = getJwtSecret();
    if (!secret) return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const enc = new TextEncoder();

    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureBytes = base64UrlToUint8Array(signatureB64);
    const dataBytes = enc.encode(`${headerB64}.${payloadB64}`);

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as unknown as BufferSource,
      dataBytes as unknown as BufferSource
    );
    if (!valid) return null;

    const payloadJson = new TextDecoder().decode(base64UrlToUint8Array(payloadB64));
    const decoded = JSON.parse(payloadJson) as SessionUser;

    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null;
    }

    if (!decoded.userId || !decoded.organizationId) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}
