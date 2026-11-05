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
function sql(statement:string){const result=spawnSync("docker",["exec","-i","supabase_db_les-privat-local","psql","-X","-qAt","-v","ON_ERROR_STOP=1","-U","postgres","-d","postgres"],{input:statement,encoding:"utf8",windowsHide:true,timeout:20000});if(result.status!==0)throw new Error(result.stderr||"SQL tes gagal.");return result.stdout.trim();}
async function signup(role:"teacher"|"admin"){
  const email=`ads-${role}-${randomUUID()}@example.test`;
  const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{display_name:role==="admin"?"Pengelola uji":"Guru iklan"}});
  if(error||!data.user)throw new Error("Fixture akun lokal tidak dapat dibuat.");
  users.push(data.user.id);
  if(role==="admin")sql(`update public.accounts set role = 'admin' where id = '${data.user.id}'::uuid;`);
  return {id:data.user.id,email};
}
async function session(email:string){
  const context=await request.newContext({baseURL:"http://127.0.0.1:3000",extraHTTPHeaders:{Origin:"http://127.0.0.1:3000","x-forwarded-for":fakeIp()}});
  let response=await context.post("/api/auth",{data:{mode:"login",email,password}});
  for(let i=0;i<3&&response.status()===503;i++){await new Promise(r=>setTimeout(r,3000));response=await context.post("/api/auth",{data:{mode:"login",email,password}});}
  expect(response.status()).toBe(200);
  return context;
}
const command=(context:APIRequestContext,action:string,payload:unknown)=>context.post("/api/commands",{data:{action,payload,requestId:randomUUID()}});
const event=(context:APIRequestContext,profile:string,kind:string)=>context.post("/api/ad-event",{data:{profile,kind}});
// Baca teks yang terlihat (tanpa skrip data RSC): kalimat ringkasan 30 hari memuat kedua angka.
const visible=(html:string)=>html.replace(/<script[\s\S]*?<\/script>/g," ").replace(/<!--.*?-->/g,"").replace(/<[^>]+>/g," ").replace(/\s+/g," ");
const stats=(html:string)=>{const m=/30 hari terakhir: (\d+) dilihat, (\d+) klik WhatsApp/.exec(visible(html));return m?{views:Number(m[1]),wa:Number(m[2])}:null;};
test.afterAll(async()=>{for(const id of users)await admin.auth.admin.deleteUser(id);});

test("Beranda guru mengutamakan iklan: status berubah dari belum dibuat, diperiksa, sampai tayang dengan statistik",async()=>{
  const teacher=await signup("teacher"),boss=await signup("admin");
  const t=await session(teacher.email),a=await session(boss.email);

  const first=await (await t.get("/dashboard")).text();
  expect(first).toContain("Iklan Anda belum dibuat");
  expect(first).toContain("Catatan les");                       // kartu opsional tetap ada, tetapi sebagai undangan
  expect(first).toContain("Boleh juga tidak dipakai");
  expect(first).toContain("Belum ada angka");
  expect(first).not.toContain("Bagikan iklan Anda");
  expect(first).toContain("Catatan les (opsional)");            // menu kedua di sidebar

  const editor=await (await t.get("/profil")).text();
  for(const text of ["Iklan saya","Pratinjau di pencarian","Pilih provinsi","Tambah penawaran"])expect(editor,text).toContain(text);

  const name=`Guru-${randomUUID().slice(0,8)}`;
  const submitted=await command(t,"profile.submit",{document:{name,about:"Mengajar matematika dengan sabar.",phone:"6281234567890",province:"Jawa Barat",regency:"Kota Bekasi",areas:[],offers:[{subject:"Matematika",level:"SD",mode:"online",duration:60,price:"75000"}]}});
  expect(submitted.status(),await submitted.text()).toBe(200);
  const pending=await (await t.get("/dashboard")).text();
  expect(pending).toContain("Iklan sedang diperiksa");
  expect(pending).toContain("80%");                             // deskripsi masih di bawah 100 karakter

  const profileId=sql(`select p.id from public.teacher_profiles p join public.workspaces w on w.id = p.workspace_id where w.owner_id = '${teacher.id}'::uuid;`);
  expect((await a.post("/api/admin/moderate",{data:{id:profileId,decision:"approve",reason:"ok"}})).status()).toBe(200);
  const live=await (await t.get("/dashboard")).text();
  expect(live).toContain("Iklan Anda tayang");
  expect(live).toContain("Bagikan iklan Anda");
  expect(live).toContain(`/guru/${profileId}`);
  expect(stats(live)).toEqual({views:0,wa:0});

  // Pengunjung anonim (alamat berbeda) membuka profil dan menekan WhatsApp.
  const visitor=await request.newContext({baseURL:"http://127.0.0.1:3000",extraHTTPHeaders:{Origin:"http://127.0.0.1:3000","x-forwarded-for":fakeIp()}});
  expect((await event(visitor,profileId,"view")).status()).toBe(200);
  expect((await event(visitor,profileId,"view")).status()).toBe(200);
  expect((await event(visitor,profileId,"wa_click")).status()).toBe(200);
  const counted=await (await t.get("/dashboard")).text();
  expect(stats(counted)).toEqual({views:2,wa:1});

  // Peristiwa untuk profil yang tidak ada menjawab sama (tidak membocorkan), isian ngawur ditolak, asal asing ditolak.
  const unknown=await event(visitor,randomUUID(),"view");
  expect(unknown.status()).toBe(200);expect(await unknown.json()).toEqual({ok:true});
  expect((await event(visitor,profileId,"bukan-jenis")).status()).toBe(400);
  expect((await event(visitor,"bukan-uuid","view")).status()).toBe(400);
  expect((await visitor.post("/api/ad-event",{headers:{Origin:"https://other.example"},data:{profile:profileId,kind:"view"}})).status()).toBe(403);
  expect(stats(await (await t.get("/dashboard")).text())).toEqual({views:2,wa:1});   // tidak berubah oleh yang ditolak
  await visitor.dispose();await t.dispose();await a.dispose();
});

test("guru yang punya murid melihat ringkasan catatan les, tetapi iklan tetap di atas",async()=>{
  const teacher=await signup("teacher");const t=await session(teacher.email);
  expect((await command(t,"student.create",{name:"Murid Ringkas",level:"SD",source:"existing"})).status()).toBe(200);
  const html=await (await t.get("/dashboard")).text();
  expect(html).toContain("Murid aktif");
  expect(html.indexOf("Iklan Anda belum dibuat")).toBeLessThan(html.indexOf("Murid aktif"));
  expect(html).not.toContain("Boleh juga tidak dipakai");
  await t.dispose();
});

test("halaman depan mengutamakan iklan guru",async()=>{
  const anonymous=await request.newContext({baseURL:"http://127.0.0.1:3000"});
  const html=await (await anonymous.get("/")).text();
  expect(html).toContain("Pasang iklan les Anda");
  expect(html).toContain("Buat profil guru");
  expect(html).toContain("Contoh tampilan");
  await anonymous.dispose();
});
