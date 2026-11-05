"use client";
import { useEffect, useState } from "react";
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
export function RegionSelect({ value, onChange, names, withDistrict = true, districtDisabled = false, districtLabel = "Kecamatan (opsional)", filter = false }: {
  value: Region; onChange: (next: Region) => void; names?: { province: string; regency: string; district: string };
  withDistrict?: boolean; districtDisabled?: boolean; districtLabel?: string; filter?: boolean;
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
    <label className="field"><span className="field-label">Provinsi</span>
      <select name={names?.province} value={value.province} onChange={e => onChange({ province: e.target.value, regency: "", district: "" })}>
        <Options names={provinces.map(p => p.name)} value={value.province} placeholder={filter ? "Semua provinsi" : "Pilih provinsi"} />
      </select></label>
    <label className="field"><span className="field-label">Kabupaten / kota</span>
      <select name={names?.regency} value={value.regency} disabled={!value.province} onChange={e => onChange({ ...value, regency: e.target.value, district: "" })}>
        <Options names={province?.regencies.map(r => r.name) ?? []} value={value.regency} placeholder={filter ? "Semua kabupaten / kota" : "Pilih kabupaten / kota"} />
      </select></label>
    {withDistrict && <label className="field"><span className="field-label">{districtLabel}</span>
      <select name={names?.district} value={value.district} disabled={!value.regency || districtDisabled} onChange={e => onChange({ ...value, district: e.target.value })}>
        <Options names={districtList} value={value.district} placeholder={filter ? "Semua kecamatan" : "Pilih kecamatan"} />
      </select></label>}
  </>;
}

// Versi untuk formulir pencarian (GET): menyimpan pilihannya sendiri dan mengirimnya lewat atribut name.
export function RegionFilter({ initial, districtDisabled }: { initial: Region; districtDisabled: boolean }) {
  const [value, setValue] = useState(initial);
  return <RegionSelect filter value={value} onChange={setValue} names={{ province: "province", regency: "regency", district: "district" }} districtDisabled={districtDisabled} districtLabel="Kecamatan untuk tatap muka (opsional)" />;
}
