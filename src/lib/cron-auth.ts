import { createHash,timingSafeEqual } from "node:crypto";

// Vercel Cron mengirim "Authorization: Bearer <CRON_SECRET>". Rahasia kosong atau pendek ditolak:
// salah konfigurasi harus membuat rute tertutup, bukan terbuka.
const MIN_SECRET_LENGTH = 16;
const digest = (value: string) => createHash("sha256").update(value).digest();

export function cronAuthorized(header: string | null, secret: string | undefined): boolean {
  if (!secret || secret.length < MIN_SECRET_LENGTH || !header) return false;
  return timingSafeEqual(digest(header), digest(`Bearer ${secret}`));
}
