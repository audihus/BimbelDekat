// Di produksi alamat wajib diisi: bila kosong, tautan bagikan dan email pemulihan diam-diam mengarah ke localhost.
export function siteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (url) return url;
  if (process.env.NODE_ENV === "production") throw new Error("NEXT_PUBLIC_SITE_URL wajib diisi di produksi.");
  return "http://127.0.0.1:3000";
}
export function hasSupabase(): boolean { return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY); }
export function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Konfigurasi Supabase belum tersedia.");
  return { url, key };
}
