import { describe,expect,it } from "vitest";
import { popularSubjects,popularCities,cityHref } from "@/lib/popular";
import { provinceNames,regencyNames } from "@/lib/wilayah";

describe("pelajaran dan kota populer di halaman depan",()=>{
  it("setiap kota benar-benar ada di data wilayah dan milik provinsinya",()=>{
    expect(popularCities.length).toBeGreaterThanOrEqual(6);
    for(const c of popularCities){
      expect(provinceNames(),c.regency).toContain(c.province);
      expect(regencyNames(c.province),c.regency).toContain(c.regency);
    }
  });
  it("tidak ada kota ganda dan pelajaran tidak kosong",()=>{
    expect(new Set(popularCities.map(c=>c.regency)).size).toBe(popularCities.length);
    expect(popularSubjects.length).toBeGreaterThanOrEqual(5);
    for(const s of popularSubjects)expect(s.trim()).toBe(s);
  });
  it("tautan kota memuat provinsi dan kabupaten/kota yang di-encode",()=>{
    expect(cityHref({province:"Jawa Barat",regency:"Kota Depok"})).toBe("/cari?province=Jawa%20Barat&regency=Kota%20Depok");
  });
});
