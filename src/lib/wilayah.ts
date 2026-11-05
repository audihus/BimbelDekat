import index from "@/data/wilayah.json";
import type { ProfileDocument } from "@/lib/domain/types";

// Yang disimpan di profil adalah NAMA wilayah (bukan kode), sama seperti sebelumnya; kode hanya dipakai untuk mencari kecamatan.
interface Province { code: string; name: string; regencies: { code: string; name: string }[] }
const provinces = index.provinces as Province[];

export const provinceNames = () => provinces.map(p => p.name);
export const regencyNames = (province: string) => provinces.find(p => p.name === province)?.regencies.map(r => r.name) ?? [];

export type DistrictLoader = (provinceCode: string) => Promise<Record<string, string[]>>;
// Impor dinamis per provinsi: bundel hanya memuat berkas yang diminta, bukan ketujuh ribu kecamatan sekaligus.
const defaultLoader: DistrictLoader = async code => (await import(`@/data/kecamatan/${code}.json`)).default;

export async function districtNames(province: string, regency: string, load: DistrictLoader = defaultLoader): Promise<string[]> {
  const prov = provinces.find(p => p.name === province);
  const reg = prov?.regencies.find(r => r.name === regency);
  if (!prov || !reg) return [];
  return (await load(prov.code))[reg.code] ?? [];
}

type Region = { province: string; regency: string; district?: string };

// Mengembalikan pesan kesalahan untuk pengguna, atau null bila wilayah sah. Isian kosong dibolehkan (draf belum lengkap).
async function regionProblem(region: Region, label: string, load: DistrictLoader): Promise<string | null> {
  const { province, regency, district = "" } = region;
  if (!province && !regency && !district) return null;
  if (!provinceNames().includes(province)) return `${label}: pilih Provinsi dari daftar.`;
  if (regency && !regencyNames(province).includes(regency)) return `${label}: pilih Kabupaten / kota dari daftar sesuai provinsinya.`;
  if (district) {
    if (!regency) return `${label}: pilih Kabupaten / kota sebelum kecamatan.`;
    if (!(await districtNames(province, regency, load)).includes(district)) return `${label}: pilih Kecamatan dari daftar sesuai kabupaten / kotanya.`;
  }
  return null;
}

// Dipakai HANYA saat menulis (profile.save / profile.submit). Skema baca (profileSchema) sengaja tidak memeriksa ini,
// supaya profil lama dengan teks bebas tidak hilang dari direktori.
export async function profileRegionProblem(doc: Pick<ProfileDocument, "province" | "regency" | "areas">, load: DistrictLoader = defaultLoader): Promise<string | null> {
  const home = await regionProblem(doc, "Tempat tinggal", load);
  if (home) return home;
  for (const [i, area] of doc.areas.entries()) {
    const problem = await regionProblem(area, `Daerah layanan ${i + 1}`, load);
    if (problem) return problem;
  }
  return null;
}

// Untuk rute /wilayah/[prov]: null bila kode bukan provinsi yang dikenal.
export async function loadProvinceDistricts(provinceCode: string, load: DistrictLoader = defaultLoader): Promise<Record<string, string[]> | null> {
  return provinces.some(p => p.code === provinceCode) ? load(provinceCode) : null;
}
