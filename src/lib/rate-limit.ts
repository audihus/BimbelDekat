import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { HttpError } from "@/lib/http";
import { logEvent } from "@/lib/log";

export type RateBucket = "login.ip" | "login.account" | "recover.ip" | "recover.email" | "sensitive.account" | "export.account" | "guardian.ip" | "ad.ip";
export interface RatePolicy { limit: number; windowSeconds: number }
export type RateRpc = (call: { bucket: string; keyHash: string; limit: number; windowSeconds: number; record: boolean }) => Promise<{ allowed: boolean; retry_after: number }>;

// TODO(human): tetapkan batas tiap bucket (limit = jumlah percobaan, windowSeconds = lamanya jendela).
// Ini keputusan produk dan keamanan: terlalu longgar memudahkan tebak kata sandi, terlalu ketat mengunci guru
// yang sekadar lupa. Nilai di bawah hanya titik awal yang aman agar semuanya berjalan; ubah sesuai keputusan Anda.
const POLICY: Record<RateBucket, RatePolicy> = {
  "login.ip": { limit: 30, windowSeconds: 900 },          // percobaan login GAGAL per alamat IP
  "login.account": { limit: 5, windowSeconds: 900 },      // percobaan login GAGAL per email + IP
  "recover.ip": { limit: 5, windowSeconds: 3600 },        // daftar / lupa kata sandi / kirim ulang, per IP
  "recover.email": { limit: 3, windowSeconds: 3600 },     // daftar / lupa kata sandi / kirim ulang, per email
  "sensitive.account": { limit: 5, windowSeconds: 900 },  // pemeriksaan ulang kata sandi untuk aksi sensitif, per akun
  "export.account": { limit: 3, windowSeconds: 3600 },    // unduh data, per akun
  "guardian.ip": { limit: 60, windowSeconds: 60 },        // pembukaan tautan wali, per IP
  "ad.ip": { limit: 60, windowSeconds: 60 }               // penghitung tayangan/klik iklan, per IP (hanya menahan penggelembungan angka)
};

export function policyFor(bucket: RateBucket): RatePolicy { return POLICY[bucket]; }

// Hop pertama x-forwarded-for. Hanya dapat dipercaya di balik proxy yang menimpa header itu (Vercel); di lokal
// semua permintaan berbagi satu kunci "local" kecuali header diatur sendiri (dipakai tes).
export function clientIp(request: Request): string {
  const first = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  return isIP(first) ? first : "local";
}

function secretKey(secret: string): Buffer {
  if (!/^[a-f0-9]{64}$/i.test(secret)) throw new Error("Rahasia pembatas belum dikonfigurasi.");
  // Pemisahan domain: kunci sesi tidak dipakai langsung sebagai kunci pembatas.
  return createHmac("sha256", Buffer.from(secret, "hex")).update("rate-limit-v1").digest();
}

// Email dan IP tidak pernah disimpan mentah: yang masuk ke basis data hanya HMAC-nya.
export function rateKey(secret: string, bucket: RateBucket, subject: string): string {
  return createHmac("sha256", secretKey(secret)).update(`${bucket}\n${subject.trim().toLowerCase()}`).digest("hex");
}

const defaultRpc: RateRpc = async ({ bucket, keyHash, limit, windowSeconds, record }) => {
  const { adminSupabase } = await import("@/lib/supabase/server");
  const { data, error } = await adminSupabase().rpc("rate_check", { p_bucket: bucket, p_key_hash: keyHash, p_limit: limit, p_window_seconds: windowSeconds, p_record: record });
  if (error || !data) throw new Error(error?.message ?? "Pembatas tidak menjawab.");
  return data as { allowed: boolean; retry_after: number };
};

export async function enforce(bucket: RateBucket, subject: string, options: { record?: boolean; failOpen?: boolean } = {}, rpc: RateRpc = defaultRpc, secret: string = process.env.SESSION_ENCRYPTION_KEY ?? ""): Promise<void> {
  const { limit, windowSeconds } = policyFor(bucket);
  let result: { allowed: boolean; retry_after: number };
  try { result = await rpc({ bucket, keyHash: rateKey(secret, bucket, subject), limit, windowSeconds, record: options.record ?? true }); }
  catch (error) {
    logEvent("error", "rate_limit.unavailable", { bucket, error });
    if (options.failOpen) return;
    throw new HttpError("Layanan sedang sibuk. Coba lagi sebentar.", 503);
  }
  if (result.allowed) return;
  logEvent("warn", "rate_limit.blocked", { bucket, retryAfter: result.retry_after });
  throw new HttpError(`Terlalu banyak percobaan. Coba lagi dalam ${Math.max(1, Math.ceil(result.retry_after / 60))} menit.`, 429, result.retry_after);
}

// Mencatat satu kegagalan (mis. login salah). Kegagalan pencatatan tidak boleh mengubah jawaban ke pengguna.
export async function recordFailure(bucket: RateBucket, subject: string, rpc: RateRpc = defaultRpc, secret: string = process.env.SESSION_ENCRYPTION_KEY ?? ""): Promise<void> {
  const { limit, windowSeconds } = policyFor(bucket);
  try { await rpc({ bucket, keyHash: rateKey(secret, bucket, subject), limit, windowSeconds, record: true }); }
  catch (error) { logEvent("warn", "rate_limit.record_failed", { bucket, error }); }
}
