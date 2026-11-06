import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";

// Halaman publik boleh dicari; area guru, API, dan ringkasan orang tua tidak.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard", "/murid", "/jadwal", "/profil", "/akun", "/admin", "/auth/", "/wali"] }],
    sitemap: `${siteUrl()}/sitemap.xml`
  };
}
