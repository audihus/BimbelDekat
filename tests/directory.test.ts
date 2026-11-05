import { expect,it } from "vitest";
import { matchesTeacher } from "@/lib/directory";
import type { PublicTeacher } from "@/lib/domain/types";

const teacher:PublicTeacher={id:"example",accepting:false,document:{name:"Rina",about:"",phone:"6280000000000",province:"Jawa Barat",regency:"Kota Bekasi",areas:[{province:"Jawa Barat",regency:"Kota Depok",district:"Beji"}],offers:[{subject:"Matematika",level:"SD",mode:"offline",duration:60,price:"75000"},{subject:"Bahasa Inggris",level:"SMA",mode:"online",duration:60,price:"100000"}]}};
it("pencarian tatap muka mengikuti area layanan, bukan tempat tinggal",()=>{
  expect(matchesTeacher(teacher,{mode:"offline",regency:"Depok",district:"Beji"})).toBe(true);
  expect(matchesTeacher(teacher,{mode:"offline",regency:"Bekasi"})).toBe(false);
});
it("guru penuh tetap ditemukan dan online dapat dicari lintas Indonesia",()=>{
  expect(matchesTeacher(teacher,{mode:"online",q:"Inggris"})).toBe(true);
  expect(matchesTeacher(teacher,{mode:"offline",q:"Matematika"})).toBe(true);
});
it("pelajaran, jenjang, dan mode harus cocok pada penawaran yang sama",()=>{
  expect(matchesTeacher(teacher,{q:"Matematika",level:"SMA"})).toBe(false);
  expect(matchesTeacher(teacher,{q:"Matematika",level:"SD",mode:"online"})).toBe(false);
});
