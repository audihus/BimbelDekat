export function siteUrl(): string { return process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000"; }
export function hasSupabase(): boolean { return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY); }
export function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Konfigurasi Supabase belum tersedia.");
  return { url, key };
}
