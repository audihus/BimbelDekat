// Pintasan pencarian di halaman depan orang tua. Nama kota harus sama persis dengan data wilayah (dijaga tests/popular.test.ts).
export const popularSubjects = ["Matematika", "Bahasa Inggris", "IPA", "Calistung", "Mengaji", "Fisika", "Kimia", "Biologi"];

export interface CityLink { province: string; regency: string }
export const popularCities: CityLink[] = [
  { province: "Daerah Khusus Ibukota Jakarta", regency: "Kota Administrasi Jakarta Selatan" },
  { province: "Jawa Barat", regency: "Kota Depok" },
  { province: "Jawa Barat", regency: "Kota Bekasi" },
  { province: "Jawa Barat", regency: "Kota Bandung" },
  { province: "Banten", regency: "Kota Tangerang" },
  { province: "Jawa Timur", regency: "Kota Surabaya" },
  { province: "Jawa Tengah", regency: "Kota Semarang" },
  { province: "Daerah Istimewa Yogyakarta", regency: "Kota Yogyakarta" },
  { province: "Sumatera Utara", regency: "Kota Medan" },
  { province: "Sulawesi Selatan", regency: "Kota Makassar" }
];

export const cityHref = (c: CityLink) => `/cari?province=${encodeURIComponent(c.province)}&regency=${encodeURIComponent(c.regency)}`;
