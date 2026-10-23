/**
 * Kenyan numbers become E.164 +254. Empty string means the value is not a usable KE number.
 * Accepts 07…, 7…, 254…, and +254…, including a stray 0 after 254.
 */
export function normalizeKenyanPhone(input: string | undefined | null): string {
  let digits = String(input || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("2540") && digits.length === 13) digits = `254${digits.slice(4)}`;
  else if (digits.startsWith("0") && digits.length >= 10) digits = `254${digits.slice(1)}`;
  else if (digits.length === 9) digits = `254${digits}`;
  if (!digits.startsWith("254") || digits.length < 12) return "";
  return `+${digits.slice(0, 12)}`;
}
