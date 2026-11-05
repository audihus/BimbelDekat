import { describe,expect,it } from "vitest";
import { provinceNames,regencyNames,districtNames,profileRegionProblem } from "@/lib/wilayah";
import { profileSchema } from "@/lib/domain/commands";

const doc=(over:Record<string,unknown>={})=>({name:"Rina",about:"",phone:"6281",province:"Jawa Barat",regency:"Kota Depok",areas:[],offers:[],...over}) as Parameters<typeof profileRegionProblem>[0];

describe("data wilayah",()=>{
  it("memuat seluruh provinsi dan kabupaten/kota Indonesia (Kepmendagri 2025)",()=>{
    expect(provinceNames()).toHaveLength(38);
    expect(provinceNames()).toContain("Papua Barat Daya");
    expect(regencyNames("Jawa Barat")).toContain("Kota Depok");
    const total=provinceNames().reduce((n,p)=>n+regencyNames(p).length,0);
    expect(total).toBe(514);
  });
  it("kabupaten/kota milik provinsi lain tidak tercampur",()=>{
    expect(regencyNames("Jawa Timur")).not.toContain("Kota Depok");
    expect(regencyNames("Provinsi Fiktif")).toEqual([]);
  });
  it("kecamatan dimuat per kabupaten/kota; nama sama di kota lain tidak tercampur",async()=>{
    expect(await districtNames("Jawa Barat","Kota Depok")).toContain("Beji");
    expect(await districtNames("Jawa Barat","Kota Bekasi")).not.toContain("Beji");
    expect(await districtNames("Jawa Timur","Kota Depok")).toEqual([]);
  });
});

describe("profileRegionProblem (hanya dipakai saat menulis)",()=>{
  it("menerima nilai kanonik, termasuk daerah layanan dengan kecamatan",async()=>{
    expect(await profileRegionProblem(doc({areas:[{province:"Jawa Barat",regency:"Kota Depok",district:"Beji"}]}))).toBeNull();
  });
  it("menerima draf yang masih kosong",async()=>{
    expect(await profileRegionProblem(doc({province:"",regency:""}))).toBeNull();
  });
  it("menolak provinsi, kabupaten, dan kecamatan yang tidak ada atau tidak sesuai hierarkinya",async()=>{
    expect(await profileRegionProblem(doc({province:"Planet Mars"}))).toMatch(/Provinsi/);
    expect(await profileRegionProblem(doc({province:"Jawa Timur",regency:"Kota Depok"}))).toMatch(/Kabupaten/);
    expect(await profileRegionProblem(doc({areas:[{province:"Jawa Barat",regency:"Kota Bekasi",district:"Beji"}]}))).toMatch(/Kecamatan/);
    expect(await profileRegionProblem(doc({province:"",regency:"Kota Depok"}))).toMatch(/Provinsi/);
  });
  it("teks lama yang ditulis bebas tetap lolos skema BACA, supaya profil lama tidak hilang dari direktori",()=>{
    const legacy={name:"Rina",about:"",phone:"6281",province:"jabar",regency:"depok",areas:[],offers:[]};
    expect(profileSchema.safeParse(legacy).success).toBe(true);
  });
});
