"use client";
import { useEffect, useRef, useState } from "react";
import index from "@/data/wilayah.json";

export interface Region { province: string; regency: string; district: string }
const provinces = index.provinces as { code: string; name: string; regencies: { code: string; name: string }[] }[];
// Satu permintaan per provinsi selama halaman terbuka; hasilnya (janji) dipakai bersama oleh semua pilihan.
const loaded = new Map<string, Promise<Record<string, string[]>>>();
function fetchDistricts(code: string) {
  if (!loaded.has(code)) loaded.set(code, fetch(`/wilayah/${code}`).then(r => { if (!r.ok) throw new Error("gagal"); return r.json(); }).catch(() => { loaded.delete(code); return {}; }));
  return loaded.get(code)!;
}

// Daftar pilihan; nilai lama yang tidak dikenal tetap tampil (diberi tanda) supaya pengguna tahu harus memilih ulang.
function Options({ names, value, placeholder }: { names: string[]; value: string; placeholder: string }) {
  return <><option value="">{placeholder}</option>{value && !names.includes(value) && <option value={value}>{value} (tidak dikenali, pilih ulang)</option>}{names.map(n => <option key={n} value={n}>{n}</option>)}</>;
}

// Pilihan bertingkat provinsi -> kabupaten/kota -> kecamatan. Terkendali: induk menyimpan nilainya.
// `names` dipakai agar bisa ikut terkirim dalam formulir GET biasa (pencarian).
// `part` memungkinkan provinsi+kabupaten ("area") dan kecamatan ("district") ditaruh di tempat berbeda pada satu formulir.
export function RegionSelect({ value, onChange, names, withDistrict = true, districtDisabled = false, districtLabel = "Kecamatan (opsional)", filter = false, part = "all" }: {
  value: Region; onChange: (next: Region) => void; names?: { province: string; regency: string; district: string };
  withDistrict?: boolean; districtDisabled?: boolean; districtLabel?: string; filter?: boolean; part?: "all" | "area" | "district";
}) {
  const province = provinces.find(p => p.name === value.province);
  const regency = province?.regencies.find(r => r.name === value.regency);
  const [districts, setDistricts] = useState<{ code: string; list: string[] }>({ code: "", list: [] });
  useEffect(() => {
    if (!province || !regency) return;
    let current = true;
    fetchDistricts(province.code).then(all => { if (current) setDistricts({ code: regency.code, list: all[regency.code] ?? [] }); });
    return () => { current = false; };
  }, [province, regency]);
  const districtList = regency && districts.code === regency.code ? districts.list : [];
  return <>
    {part !== "district" && <><label className="field"><span className="field-label">Provinsi</span>
      <select name={names?.province} value={value.province} onChange={e => onChange({ province: e.target.value, regency: "", district: "" })}>
        <Options names={provinces.map(p => p.name)} value={value.province} placeholder={filter ? "Semua provinsi" : "Pilih provinsi"} />
      </select></label>
    <label className="field"><span className="field-label">Kabupaten / kota</span>
      <select name={names?.regency} value={value.regency} disabled={!value.province} onChange={e => onChange({ ...value, regency: e.target.value, district: "" })}>
        <Options names={province?.regencies.map(r => r.name) ?? []} value={value.regency} placeholder={filter ? "Semua kabupaten / kota" : "Pilih kabupaten / kota"} />
      </select></label></>}
    {withDistrict && part !== "area" && <label className="field"><span className="field-label">{districtLabel}</span>
      <select name={names?.district} value={value.district} disabled={!value.regency || districtDisabled} onChange={e => onChange({ ...value, district: e.target.value })}>
        <Options names={districtList} value={value.district} placeholder={filter ? "Semua kecamatan" : "Pilih kecamatan"} />
      </select></label>}
  </>;
}

// Versi untuk formulir pencarian (GET): menyimpan pilihannya sendiri dan mengirimnya lewat atribut name.
// Tata letak ringkas: `lead` (kolom pelajaran) + provinsi + kabupaten/kota terlihat; `extra` (jenjang, cara belajar) dan
// kecamatan dilipat di "Filter lainnya" agar di ponsel hasil pencarian cepat terlihat. Di layar lebar lipatan dibuka otomatis.
export function RegionFilter({ initial, districtDisabled, lead, extra, extraActive }: { initial: Region; districtDisabled: boolean; lead: React.ReactNode; extra: React.ReactNode; extraActive: boolean }) {
  // Tautan lama/dibagikan bisa memuat kabupaten/kota tanpa provinsi; nama kabupaten/kota unik, jadi provinsinya dapat disimpulkan.
  const [value, setValue] = useState<Region>(() => initial.province || !initial.regency ? initial : { ...initial, province: provinces.find(p => p.regencies.some(r => r.name === initial.regency))?.name ?? "" });
  const more = useRef<HTMLDetailsElement>(null);
  useEffect(() => { if (window.matchMedia("(min-width: 801px)").matches && more.current) more.current.open = true; }, []);
  const names = { province: "province", regency: "regency", district: "district" };
  return <>
    <div className="filter-main">{lead}<RegionSelect filter part="area" value={value} onChange={setValue} names={names} /></div>
    <details ref={more} open={extraActive} className="filter-more">
      <summary>Filter lainnya (jenjang, cara belajar, kecamatan)</summary>
      <div className="form-grid">{extra}<RegionSelect filter part="district" value={value} onChange={setValue} names={names} districtDisabled={districtDisabled} districtLabel="Kecamatan untuk tatap muka (opsional)" /></div>
    </details>
  </>;
}

// Provinsi + kabupaten/kota untuk kotak cari di halaman depan (formulir GET ke /cari).
export function RegionAreaFilter() {
  const [value, setValue] = useState<Region>({ province: "", regency: "", district: "" });
  return <RegionSelect filter part="area" value={value} onChange={setValue} names={{ province: "province", regency: "regency", district: "district" }} />;
}
