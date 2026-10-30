export function formatCurrencyINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export function calculateOpportunityScore(rating: number, reviewCount: number, hasWebsite: boolean): number {
  let score = 5.0;
  if (!hasWebsite) score += 3.0;
  if (reviewCount > 100) score += 1.0;
  if (rating >= 4.0 && rating <= 4.8) score += 1.0;
  return Math.min(10.0, Math.max(1.0, parseFloat(score.toFixed(1))));
}

export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return "••••••••";
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}

