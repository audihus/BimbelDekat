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
  const email=`jdw-${randomUUID()}@example.test`;
  const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{display_name:"Guru jadwal"}});
  if(error||!data.user)throw new Error("Fixture akun lokal tidak dapat dibuat.");
  users.push(data.user.id);
  const context=await request.newContext({baseURL:"http://127.0.0.1:3000",extraHTTPHeaders:{Origin:"http://127.0.0.1:3000","x-forwarded-for":fakeIp()}});
  let response=await context.post("/api/auth",{data:{mode:"login",email,password}});
  for(let i=0;i<3&&response.status()===503;i++){await new Promise(r=>setTimeout(r,3000));response=await context.post("/api/auth",{data:{mode:"login",email,password}});}
  expect(response.status()).toBe(200);
  return context;
}
async function cmd(context:APIRequestContext,action:string,payload:unknown){
  const response=await context.post("/api/commands",{data:{action,payload,requestId:randomUUID()}});
  expect(response.status(),action).toBe(200);
  return (await response.json()).result;
}
test.afterAll(async()=>{for(const id of users)await admin.auth.admin.deleteUser(id);});

test("kalender menaruh pertemuan pada tanggal menurut zona waktu guru, bukan UTC",async()=>{
  const context=await teacherSession();
  const name=`Murid-${randomUUID().slice(0,8)}`;
  const student=await cmd(context,"student.create",{name,level:"SD",source:"existing"});
  const pack=await cmd(context,"package.create",{student_id:student.id,name:"Matematika",quota:8,opening_used:0,agreed_price:"400000"});
  // 16.30 UTC = 23.30 WIB pada 15 Maret 2027 (akun baru berzona WIB). Menurut UTC tanggalnya juga 15, jadi tambahkan kasus lintas hari:
  await cmd(context,"lesson.create",{package_id:pack.id,starts_at:"2027-03-15T16:30:00.000Z",ends_at:"2027-03-15T17:30:00.000Z",mode:"online"});
  await cmd(context,"lesson.create",{package_id:pack.id,starts_at:"2027-03-15T17:30:00.000Z",ends_at:"2027-03-15T18:30:00.000Z",mode:"online"});   // 00.30 WIB tanggal 16
  const page=await (await context.get("/jadwal?bulan=2027-03&tgl=2027-03-15")).text();
  expect(page).toContain("15 Maret 2027, 1 pertemuan");
  expect(page).toContain("16 Maret 2027, 1 pertemuan");
  expect(page).toContain("Senin, 15 Maret 2027");
  expect(page).toContain(name);
  expect(page).toContain("bulan=2027-02");
  expect(page).toContain("bulan=2027-04");
  const other=await (await context.get("/jadwal?bulan=2027-03&tgl=2027-03-20")).text();
  expect(other).toContain("Tidak ada pertemuan di hari ini");
  expect(other).toContain("20 Maret 2027, tidak ada pertemuan");
  await context.dispose();
});

test("parameter alamat yang ngawur tidak merusak halaman jadwal",async()=>{
  const context=await teacherSession();
  for(const query of ["?bulan=zzz","?tgl=2026-02-30","?bulan=2027-13&tgl=bukan-tanggal","?bulan=99999-01"]){
    const response=await context.get(`/jadwal${query}`);
    expect(response.status(),query).toBe(200);
    const html=await response.text();
    expect(html,query).toContain("Jadwal Anda");
    expect(html,query).toContain("Kalender ");
  }
  await context.dispose();
});
