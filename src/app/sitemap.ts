import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";
import { publicTeachers } from "@/lib/public-data";

export const dynamic = "force-dynamic";

// Halaman tetap + profil guru yang sedang tayang. Bila daftar guru gagal dimuat, halaman tetap tetap disajikan.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const fixed = ["", "/cari", "/untuk-guru", "/privasi", "/kontak"].map(path => ({ url: `${base}${path}` }));
  const { teachers, unavailable } = await publicTeachers();
  return [...fixed, ...(unavailable ? [] : teachers.map(t => ({ url: `${base}/guru/${t.id}` })))];
}
