import { randomBytes } from "node:crypto";

// Log berupa satu baris JSON ke stdout/stderr (Vercel menangkapnya). PRD: log tidak memuat kata sandi,
// token tautan, isi pesan, atau nomor telepon lengkap, jadi semua isi disaring sebelum dicetak.
const HIDDEN = "[disembunyikan]";
const HIDDEN_KEY = /pass(word)?|token|secret|authorization|cookie|api[-_]?key|phone|telepon|address|alamat|notes|catatan/i;
const JWT = /eyJ[\w-]{5,}\.[\w-]{5,}\.[\w-]*/g;
const OPAQUE = /[A-Za-z0-9_-]{40,}/g;
const EMAIL = /[\w.+-]+@[\w-]+(\.[\w-]+)+/g;
const MAX_DEPTH = 6;

export function maskEmail(email: string): string {
  const at = email.indexOf("@");
  return at < 1 ? HIDDEN : `${email[0]}***${email.slice(at)}`;
}

function scrub(text: string): string {
  return text.replace(JWT, "[token]").replace(OPAQUE, "[token]").replace(EMAIL, match => maskEmail(match));
}

export function redact(value: unknown, depth = 0): unknown {
  if (typeof value === "string") return scrub(value);
  if (value === null || typeof value !== "object") return value;
  if (depth >= MAX_DEPTH) return "[terlalu dalam]";
  if (value instanceof Error) return { name: value.name, message: scrub(value.message), stack: value.stack ? scrub(value.stack) : undefined };
  if (Array.isArray(value)) return value.map(item => redact(item, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (HIDDEN_KEY.test(key)) out[key] = HIDDEN;
    else if (/^e-?mail$/i.test(key) && typeof item === "string") out[key] = maskEmail(item);
    else out[key] = redact(item, depth + 1);
  }
  return out;
}

export type LogLevel = "info" | "warn" | "error";

export function logEvent(level: LogLevel, event: string, fields: Record<string, unknown> = {}): void {
  const line = JSON.stringify({ time: new Date().toISOString(), level, event, ...(redact(fields) as Record<string, unknown>) });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export function newErrorId(): string { return randomBytes(4).toString("hex"); }
