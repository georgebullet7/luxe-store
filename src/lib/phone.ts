/**
 * Lebanese mobile number validation + normalization.
 *
 * Accepts common ways people type numbers:
 *   03 123 456 · 70-123-456 · 71123456 · +961 3 123456 · 009613123456
 * Normalizes everything to international format: +9613123456
 *
 * Valid mobile prefixes in Lebanon: 3 (old 03), 70, 71, 76, 78, 79, 81.
 */
const MOBILE_PREFIXES = ["3", "70", "71", "76", "78", "79", "81"];

export function normalizeLebanesePhone(raw: string): string | null {
  // strip spaces, dashes, dots, parentheses
  let d = raw.replace(/[\s\-.()]/g, "");

  // convert 00961 / +961 to bare local form
  if (d.startsWith("+961")) d = d.slice(4);
  else if (d.startsWith("00961")) d = d.slice(5);
  else if (d.startsWith("961") && d.length >= 10) d = d.slice(3);

  // drop a single leading zero (03 → 3, 070 → 70)
  if (d.startsWith("0")) d = d.slice(1);

  if (!/^\d+$/.test(d)) return null;

  // match prefix + exactly 6 digits after it
  for (const p of MOBILE_PREFIXES) {
    if (d.startsWith(p) && d.length === p.length + 6) {
      return `+961${d}`;
    }
  }
  return null;
}

export function isValidLebanesePhone(raw: string): boolean {
  return normalizeLebanesePhone(raw) !== null;
}
