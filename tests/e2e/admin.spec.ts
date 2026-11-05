import { test,expect,request,type APIRequestContext } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomInt,randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { resilientFetch } from "../../src/lib/supabase/resilient-fetch";

process.loadEnvFile(".env.local");
const url=process.env.NEXT_PUBLIC_SUPABASE_URL!;
if(url!=="http://127.0.0.1:55321")throw new Error("Pengujian hanya boleh memakai Supabase lokal.");
const admin=createClient(url,process.env.SUPABASE_SECRET_KEY!,{global:{fetch:resilientFetch()},auth:{persistSession:false,autoRefreshToken:false}});
const password="KataSandiUjiLokal!2026";
const users:string[]=[];
const fakeIp=()=>`10.${randomInt(1,255)}.${randomInt(1,255)}.${randomInt(1,255)}`;
async function signup(role:"teacher"|"admin"){
  const email=`${role}-${randomUUID()}@example.test`;
  const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{display_name:role==="admin"?"Pengelola uji":"Guru uji"}});
  if(error||!data.user)throw new Error("Fixture akun lokal tidak dapat dibuat.");
  users.push(data.user.id);
  if(role==="admin")sql(`update public.accounts set role = 'admin' where id = '${data.user.id}'::uuid;`);
  return {id:data.user.id,email};
}
// Pengelola hanya bisa dijadikan lewat SQL (metadata dari browser tidak boleh memberi hak admin); service_role tidak punya hak tabel.
function sql(statement:string){const result=spawnSync("docker",["exec","-i","supabase_db_les-privat-local","psql","-X","-qAt","-v","ON_ERROR_STOP=1","-U","postgres","-d","postgres"],{input:statement,encoding:"utf8",windowsHide:true,timeout:20000});if(result.status!==0)throw new Error(result.stderr||"SQL tes gagal.");return result.stdout.trim();}
async function session(email:string){
  const context=await request.newContext({baseURL:"http://127.0.0.1:3000",extraHTTPHeaders:{Origin:"http://127.0.0.1:3000","x-forwarded-for":fakeIp()}});
  let response=await context.post("/api/auth",{data:{mode:"login",email,password}});
  for(let i=0;i<3&&response.status()===503;i++){await new Promise(r=>setTimeout(r,3000));response=await context.post("/api/auth",{data:{mode:"login",email,password}});}   // macet Docker: ulangi
  expect(response.status()).toBe(200);
  return context;
}
const command=(context:APIRequestContext,action:string,payload:unknown)=>context.post("/api/commands",{data:{action,payload,requestId:randomUUID()}});
const moderate=(context:APIRequestContext,id:string,decision:string,reason="")=>context.post("/api/admin/moderate",{data:{id,decision,reason}});
// Kotak pencarian memantulkan kembali nilai q, jadi yang diperiksa adalah jumlah hasil, bukan keberadaan teks nama.
async function listedCount(name:string){const anonymous=await request.newContext({baseURL:"http://127.0.0.1:3000"});const html=await (await anonymous.get(`/cari?q=${encodeURIComponent(name)}`)).text();await anonymous.dispose();const match=/(\d+)(?:<!-- -->)? guru ditemukan/.exec(html);if(!match)throw new Error("Jumlah hasil pencarian tidak ditemukan di halaman.");return Number(match[1]);}
test.afterAll(async()=>{for(const id of users)await admin.auth.admin.deleteUser(id);});

test("moderasi profil: dari pengajuan guru sampai tampil, disembunyikan, dan dikembalikan di direktori publik",async()=>{
  const teacher=await signup("teacher"),boss=await signup("admin");
  const t=await session(teacher.email),a=await session(boss.email);
  const name=`Guru-${randomUUID().slice(0,8)}`;
  const submitted=await command(t,"profile.submit",{document:{name,about:"Mengajar matematika dengan sabar.",phone:"6281234567890",province:"Jawa Barat",regency:"Kota Bekasi",areas:[],offers:[{subject:"Matematika",level:"SD",mode:"online",duration:60,price:"75000"}]}});
  expect(submitted.status(),await submitted.text()).toBe(200);
  const profileId=sql(`select p.id from public.teacher_profiles p join public.workspaces w on w.id = p.workspace_id where w.owner_id = '${teacher.id}'::uuid;`);

  // Belum disetujui: tidak tampil di publik. Pengelola melihat pengajuan; guru tidak bisa membuka halaman admin.
  expect(await listedCount(name)).toBe(0);
  const queue=await (await a.get("/admin")).text();
  expect(queue).toContain("Moderasi profil");expect(queue).toContain(name);expect(queue).toContain("Menunggu pemeriksaan");
  const teacherView=await (await t.get("/admin")).text();
  expect(teacherView).not.toContain("Moderasi profil");expect(teacherView).not.toContain(name);

  // Hanya pengelola yang boleh memutuskan.
  expect((await moderate(t,profileId,"approve")).status()).toBe(403);
  const anonymous=await request.newContext({baseURL:"http://127.0.0.1:3000",extraHTTPHeaders:{Origin:"http://127.0.0.1:3000"}});
  expect((await moderate(anonymous,profileId,"approve")).status()).toBe(401);
  expect((await a.post("/api/admin/moderate",{headers:{Origin:"https://other.example"},data:{id:profileId,decision:"approve",reason:""}})).status()).toBe(403);
  expect((await moderate(a,"bukan-uuid","approve")).status()).toBe(400);
  expect((await moderate(a,profileId,"tak-dikenal")).status()).toBe(400);

  // Tolak dan sembunyikan wajib beralasan.
  expect((await moderate(a,profileId,"reject","")).status()).toBe(400);
  expect((await moderate(a,profileId,"unhide","Tidak perlu")).status()).toBe(400);   // belum disembunyikan

  const approved=await moderate(a,profileId,"approve","Profil lengkap");expect(approved.status(),await approved.text()).toBe(200);
  expect(await listedCount(name)).toBe(1);
  expect((await moderate(a,profileId,"approve")).status()).toBe(400);                 // tidak ada pengajuan yang menunggu

  expect((await moderate(a,profileId,"hide","")).status()).toBe(400);
  expect((await moderate(a,profileId,"hide","Nomor WhatsApp tidak aktif")).status()).toBe(200);
  expect(await listedCount(name)).toBe(0);
  expect((await command(t,"profile.visibility",{visible:true})).status()).toBe(400);  // guru tidak bisa membukanya sendiri
  expect(await (await a.get("/admin")).text()).toContain("Disembunyikan pengelola");

  expect((await moderate(a,profileId,"unhide","")).status()).toBe(400);
  expect((await moderate(a,profileId,"unhide","Sudah diperbaiki")).status()).toBe(200);
  expect(await listedCount(name)).toBe(1);

  // Pengelola tidak punya akses ke catatan privat guru, termasuk lewat jalur perintah.
  expect((await command(a,"student.create",{name:"Tidak boleh",level:"SD"})).status()).toBe(403);
  await t.dispose();await a.dispose();await anonymous.dispose();
});

test("pengajuan baru ditolak dengan alasan yang terlihat oleh guru, dan tidak pernah tampil di publik",async()=>{
  const teacher=await signup("teacher"),boss=await signup("admin");
  const t=await session(teacher.email),a=await session(boss.email);
  const name=`Guru-${randomUUID().slice(0,8)}`;
  expect((await command(t,"profile.submit",{document:{name,about:"x",phone:"6281234567890",province:"Jawa Barat",regency:"Kota Depok",areas:[],offers:[{subject:"IPA",level:"SMP",mode:"online",duration:60,price:"60000"}]}})).status()).toBe(200);
  const profileId=sql(`select p.id from public.teacher_profiles p join public.workspaces w on w.id = p.workspace_id where w.owner_id = '${teacher.id}'::uuid;`);
  expect((await moderate(a,profileId,"reject","Deskripsi terlalu singkat")).status()).toBe(200);
  expect(await (await t.get("/profil")).text()).toContain("Deskripsi terlalu singkat");
  expect(await listedCount(name)).toBe(0);
  await t.dispose();await a.dispose();
});
