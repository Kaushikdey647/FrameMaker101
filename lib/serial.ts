/** Crockford base32 (no I, L, O, U). */
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export const SERIAL_RE = /^HH-GOA-[0-9A-HJKMNP-TV-Z]{5}$/;

export function mintSerial(): string {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  let body = "";
  for (let i = 0; i < 5; i++) {
    body += CROCKFORD[bytes[i]! % 32];
  }
  return `HH-GOA-${body}`;
}

export function isValidSerial(raw: string): boolean {
  return SERIAL_RE.test(raw.toUpperCase());
}

export function normalizeSerial(raw: string): string {
  return raw.trim().toUpperCase();
}
