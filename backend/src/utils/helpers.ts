export function parseJsonResponse(text: string): Record<string, any> {
  const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
  return JSON.parse(cleaned);
}

export function formatAmount(amount: number): string {
  return `${amount.toLocaleString()} MAD`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
