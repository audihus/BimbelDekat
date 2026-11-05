import { test,expect,request,type APIRequestContext } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomInt,randomUUID } from "node:crypto";
import { resilientFetch } from "../../src/lib/supabase/resilient-fetch";

process.loadEnvFile(".env.local");
const url=process.env.NEXT_PUBLIC_SUPABASE_URL!;
if(url!=="http://127.0.0.1:55321")throw new Error("Pengujian hanya boleh memakai Supabase lokal.");
const admin=createClient(url,process.env.SUPABASE_SECRET_KEY!,{global:{fetch:resilientFetch()},auth:{persistSession:false,autoRefreshToken:false}});
const password="KataSandiUjiLokal!2026";
const users:string[]=[];
const fakeIp=()=>`10.${randomInt(1,255)}.${randomInt(1,255)}.${randomInt(1,255)}`;
async function teacherSession(){
  const email=`wil-${randomUUID()}@example.test`;
  const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{display_name:"Guru wilayah"}});
  if(error||!data.user)throw new Error("Fixture akun lokal tidak dapat dibuat.");
  users.push(data.user.id);
  const context=await request.newContext({baseURL:"http://127.0.0.1:3000",extraHTTPHeaders:{Origin:"http://127.0.0.1:3000","x-forwarded-for":fakeIp()}});
  let response=await context.post("/api/auth",{data:{mode:"login",email,password}});
  for(let i=0;i<3&&response.status()===503;i++){await new Promise(r=>setTimeout(r,3000));response=await context.post("/api/auth",{data:{mode:"login",email,password}});}
  expect(response.status()).toBe(200);
  return context;
}
const save=(context:APIRequestContext,document:Record<string,unknown>)=>context.post("/api/commands",{data:{action:"profile.save",payload:{document},requestId:randomUUID()}});
const doc=(over:Record<string,unknown>={})=>({name:"Guru wilayah",about:"x",phone:"6281234567890",province:"Jawa Barat",regency:"Kota Depok",areas:[],offers:[],...over});
test.afterAll(async()=>{for(const id of users)await admin.auth.admin.deleteUser(id);});

test("simpan profil menolak wilayah yang tidak ada atau tidak sesuai hierarkinya, menerima yang kanonik",async()=>{
  const context=await teacherSession();
  const wrongRegency=await save(context,doc({province:"Jawa Timur",regency:"Kota Depok"}));
  expect(wrongRegency.status()).toBe(400);expect((await wrongRegency.json()).error).toContain("Kabupaten");
  const wrongDistrict=await save(context,doc({areas:[{province:"Jawa Barat",regency:"Kota Bekasi",district:"Beji"}]}));
  expect(wrongDistrict.status()).toBe(400);expect((await wrongDistrict.json()).error).toContain("Kecamatan");
  expect((await save(context,doc({province:"jabar",regency:"depok"}))).status()).toBe(400);   // teks bebas lama tidak boleh ditulis lagi
  expect((await save(context,doc({areas:[{province:"Jawa Barat",regency:"Kota Depok",district:"Beji"}]}))).status()).toBe(200);
  await context.dispose();
});

test("daftar kecamatan disajikan per provinsi, bisa di-cache, dan menolak kode ngawur",async()=>{
  const anonymous=await request.newContext({baseURL:"http://127.0.0.1:3000"});
  const ok=await anonymous.get("/wilayah/32");
  expect(ok.status()).toBe(200);
  expect(ok.headers()["cache-control"]).toContain("public");
  expect((await ok.json())["32.76"]).toContain("Beji");
  for(const bad of ["99","abc","3","..%2F32"])expect((await anonymous.get(`/wilayah/${bad}`)).status(),bad).toBe(404);
  await anonymous.dispose();
});

test("halaman pencarian memakai pilihan wilayah dan mempertahankan filter dari alamat",async()=>{
  const anonymous=await request.newContext({baseURL:"http://127.0.0.1:3000"});
  const html=await (await anonymous.get("/cari?province=Jawa%20Barat&regency=Kota%20Depok")).text();
  expect(html).toContain("Semua provinsi");
  expect(html).toContain('name="province"');
  expect(html).toContain("Kota Depok");
  expect(html).toContain("Papua Barat Daya");
  await anonymous.dispose();
});
