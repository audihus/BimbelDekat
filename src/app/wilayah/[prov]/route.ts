import { loadProvinceDistricts } from "@/lib/wilayah";

// Daftar kecamatan satu provinsi (kode dua digit). Data publik dan tidak berubah, jadi boleh di-cache.
// Sengaja di luar /api agar tidak ikut diberi "no-store" oleh proxy.
export async function GET(_request: Request, ctx: { params: Promise<{ prov: string }> }) {
  const { prov } = await ctx.params;
  const data = /^\d{2}$/.test(prov) ? await loadProvinceDistricts(prov) : null;
  if (!data) return Response.json({ error: "Provinsi tidak dikenal." }, { status: 404 });
  return Response.json(data, { headers: { "Cache-Control": "public, max-age=86400" } });
}
