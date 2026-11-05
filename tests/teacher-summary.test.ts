import { describe,expect,it } from "vitest";
import { teacherSummary } from "@/lib/teacher-summary";
import type { ProfileDocument } from "@/lib/domain/types";

const doc=(over:Partial<ProfileDocument>={}):ProfileDocument=>({name:"Rina",about:"",phone:"6281",province:"Jawa Barat",regency:"Kota Bekasi",
  areas:[{province:"Jawa Barat",regency:"Kota Depok",district:"Beji"},{province:"Jawa Barat",regency:"Kota Bogor",district:""}],
  offers:[{subject:"Matematika",level:"SD",mode:"offline",duration:60,price:"90000"},{subject:"Matematika",level:"SMP",mode:"online",duration:60,price:"75000"},{subject:"Fisika",level:"SMA",mode:"online",duration:90,price:"120000"}],...over});

describe("teacherSummary",()=>{
  it("harga mulai dari penawaran termurah dan tag pelajaran tanpa duplikat",()=>{
    const s=teacherSummary(doc(),{});
    expect(s.fromPrice).toBe("75000");
    expect(s.subjects).toEqual(["Matematika","Fisika"]);
    expect(s.levels).toEqual(["SD","SMP","SMA"]);
  });
  it("tanpa penawaran: tidak ada harga",()=>{
    expect(teacherSummary(doc({offers:[]}),{}).fromPrice).toBeNull();
  });
  it("harga dibandingkan sebagai angka, bukan teks (9000 < 75000)",()=>{
    const s=teacherSummary(doc({offers:[{subject:"A",level:"SD",mode:"online",duration:60,price:"9000"},{subject:"B",level:"SD",mode:"online",duration:60,price:"75000"}]}),{});
    expect(s.fromPrice).toBe("9000");
  });
  it("mode yang ditawarkan",()=>{
    expect(teacherSummary(doc(),{}).modes).toEqual(["online","offline"]);
    expect(teacherSummary(doc({offers:[{subject:"A",level:"SD",mode:"online",duration:60,price:"1"}]}),{}).modes).toEqual(["online"]);
  });
  it("daerah mengajar tatap muka: tanpa filter menampilkan semua daerah layanan",()=>{
    const s=teacherSummary(doc(),{});
    expect(s.matchedArea).toBeNull();
    expect(s.areas).toEqual(["Beji, Kota Depok","Kota Bogor"]);
  });
  it("dengan filter kabupaten/kota: daerah yang cocok disorot, bukan tempat tinggal guru",()=>{
    const s=teacherSummary(doc(),{regency:"Kota Depok"});
    expect(s.matchedArea).toBe("Beji, Kota Depok");
    expect(s.home).toBe("Kota Bekasi");
  });
  it("filter menyebut 'depok' tanpa awalan tetap cocok (pencarian memakai 'mengandung')",()=>{
    expect(teacherSummary(doc(),{regency:"depok"}).matchedArea).toBe("Beji, Kota Depok");
  });
  it("filter yang tidak cocok daerah mana pun: tidak ada sorotan",()=>{
    expect(teacherSummary(doc(),{regency:"Kota Medan"}).matchedArea).toBeNull();
  });
  it("mode online saja: tidak menampilkan daerah mengajar sama sekali",()=>{
    const onlineOnly=doc({offers:[{subject:"A",level:"SD",mode:"online",duration:60,price:"1"}]});
    expect(teacherSummary(onlineOnly,{}).areas).toEqual([]);
  });
});
