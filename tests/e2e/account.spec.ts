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
const rf=resilientFetch();   // Mailpit dan tautan konfirmasi juga lewat Docker Desktop, jadi sama rentannya
const fakeIp=()=>`10.${randomInt(1,255)}.${randomInt(1,255)}.${randomInt(1,255)}`;
async function signup(){const email=`ak-${randomUUID()}@example.test`;const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{display_name:"Guru akun"}});if(error||!data.user)throw new Error("Fixture akun lokal tidak dapat dibuat.");users.push(data.user.id);return {id:data.user.id,email};}
// 503 berarti pembatas tidak dapat menghubungi basis data (macet Docker Desktop di Windows): ulangi seperti pengguna yang menekan tombol lagi.
async function login(email:string,pass=password,ip=fakeIp()){
  const context=await request.newContext({baseURL:"http://127.0.0.1:3000",extraHTTPHeaders:{Origin:"http://127.0.0.1:3000","x-forwarded-for":ip}});
  let response=await context.post("/api/auth",{data:{mode:"login",email,password:pass}});
  for(let i=0;i<3&&response.status()===503;i++){await new Promise(r=>setTimeout(r,3000));response=await context.post("/api/auth",{data:{mode:"login",email,password:pass}});}
  return {context,response};
}
// service_role sengaja tidak punya hak tabel; mengubah tanggal untuk tes dilakukan lewat psql, seperti skrip seed.
function sql(statement:string){const result=spawnSync("docker",["exec","-i","supabase_db_les-privat-local","psql","-X","-qAt","-v","ON_ERROR_STOP=1","-U","postgres","-d","postgres"],{input:statement,encoding:"utf8",windowsHide:true,timeout:20000});if(result.status!==0)throw new Error(result.stderr||"SQL tes gagal.");return result.stdout.trim();}
async function session(email:string){const {context,response}=await login(email);expect(response.status()).toBe(200);return context;}
const act=(context:APIRequestContext,data:Record<string,unknown>)=>context.post("/api/account",{data});
const exportData=(context:APIRequestContext,pass:string)=>context.post("/api/account/export",{data:{password:pass}});
const student=(context:APIRequestContext,name:string)=>context.post("/api/commands",{data:{action:"student.create",payload:{name,level:"SD"},requestId:randomUUID()}});
test.afterAll(async()=>{for(const id of users)await admin.auth.admin.deleteUser(id);});

async function mailTo(address:string,count:number){
  for(let i=0;i<40;i++){
    const found=await (await rf(`http://127.0.0.1:55324/api/v1/search?query=${encodeURIComponent(`to:${address}`)}`)).json();
    if((found.messages??[]).length>=count)return found.messages as {ID:string}[];
    await new Promise(r=>setTimeout(r,250));
  }
  throw new Error(`Email untuk ${address} tidak tiba.`);
}
async function confirmLink(id:string){
  const message=await (await rf(`http://127.0.0.1:55324/api/v1/message/${id}`)).json();
  const link=(message.Text as string).match(/https?:\/\/127\.0\.0\.1:55321\/auth\/v1\/verify\?[^\s)>"]+/)?.[0];
  if(!link)throw new Error(`Tautan konfirmasi tidak ditemukan: ${message.Text}`);
  return link;
}

test("aksi sensitif menolak kata sandi salah dan tidak mengubah apa pun",async()=>{
  const user=await signup();const context=await session(user.email);
  const bad="bukan kata sandi saya";
  expect((await act(context,{action:"email.change",password:bad,email:`baru-${randomUUID()}@example.test`})).status()).toBe(403);
  expect((await act(context,{action:"password.change",password:bad,newPassword:"kalimat panjang baru yang aman"})).status()).toBe(403);
  expect((await act(context,{action:"deletion.request",password:bad})).status()).toBe(403);
  expect((await exportData(context,bad)).status()).toBe(403);
  expect((await context.get("/dashboard")).status()).toBe(200);   // akun tetap aktif
  await context.dispose();
});

test("halaman Akun menampilkan semua fitur untuk akun aktif; halaman masuk menjelaskan alasan pengalihan",async()=>{
  const user=await signup();const context=await session(user.email);
  const page=await (await context.get("/akun")).text();
  for(const text of ["Ubah email","Ubah kata sandi","Unduh data Anda","Hapus akun","Minta penghapusan akun"])expect(page,text).toContain(text);
  expect(page).not.toContain("Akun menunggu penghapusan");
  const anonymous=await request.newContext({baseURL:"http://127.0.0.1:3000"});
  expect(await (await anonymous.get("/masuk?pesan=sandi")).text()).toContain("semua login dicabut");
  const hostile=await (await anonymous.get("/masuk?pesan=%3Cscript%3Ealert(1)%3C/script%3E")).text();
  // Pesan hanya dari daftar tetap. Teks URL boleh muncul ter-encode di data internal Next.js, tetapi tidak sebagai HTML mentah.
  expect(hostile).not.toContain("<script>alert");
  expect(hostile).not.toContain("<script>alert(1)</script>");
  await context.dispose();await anonymous.dispose();
});

test("batas akses: tanpa login 401, origin asing 403, isian tak lengkap 400",async()=>{
  const anonymous=await request.newContext({baseURL:"http://127.0.0.1:3000",extraHTTPHeaders:{Origin:"http://127.0.0.1:3000"}});
  expect((await exportData(anonymous,password)).status()).toBe(401);
  expect((await act(anonymous,{action:"deletion.cancel"})).status()).toBe(401);
  const user=await signup();const context=await session(user.email);
  expect((await context.post("/api/account",{headers:{Origin:"https://other.example"},data:{action:"deletion.cancel"}})).status()).toBe(403);
  expect((await act(context,{action:"tidak-ada"})).status()).toBe(400);
  expect((await act(context,{action:"email.change",password})).status()).toBe(400);
  await anonymous.dispose();await context.dispose();
});

test("ekspor berupa berkas unduhan yang hanya memuat data sendiri",async()=>{
  const alice=await signup(),bob=await signup();const a=await session(alice.email),b=await session(bob.email);
  const mine=`Murid-${randomUUID().slice(0,8)}`,theirs=`Murid-${randomUUID().slice(0,8)}`;
  expect((await student(a,mine)).status()).toBe(200);expect((await student(b,theirs)).status()).toBe(200);
  const response=await exportData(a,password);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-disposition"]).toMatch(/^attachment; filename="data-bimbeldekat-\d{4}-\d{2}-\d{2}\.html"$/);
  expect(response.headers()["content-type"]).toContain("text/html");
  expect(response.headers()["cache-control"]).toContain("no-store");
  const text=await response.text();
  expect(text).toContain(alice.email);
  expect(text).toContain(mine);
  expect(text).not.toContain(theirs);
  expect(text).not.toContain("token_hash");
  await a.dispose();await b.dispose();
});

test("ganti kata sandi: salah ditolak, terlalu pendek ditolak, berhasil mencabut semua login",async()=>{
  const user=await signup();const first=await session(user.email),second=await session(user.email);
  const fresh="kalimat panjang yang baru dan aman";
  expect((await act(first,{action:"password.change",password:"salah",newPassword:fresh})).status()).toBe(403);
  const short=await act(first,{action:"password.change",password,newPassword:"pendek"});expect(short.status()).toBe(400);expect((await short.json()).error).toContain("15 karakter");
  const same=await act(first,{action:"password.change",password,newPassword:password});expect(same.status()).toBe(400);
  const done=await act(first,{action:"password.change",password,newPassword:fresh});
  expect(done.status()).toBe(200);expect((await done.json()).redirect).toBe("/masuk?pesan=sandi");
  for(const context of [first,second]){const closed=await context.get("/dashboard",{maxRedirects:0});expect(closed.status()).toBe(307);expect(closed.headers().location).toContain("/masuk");}
  expect((await login(user.email,password)).response.status()).toBe(401);
  const again=await login(user.email,fresh);expect(again.response.status()).toBe(200);
  await again.context.dispose();await first.dispose();await second.dispose();
});

test("ganti email baru berlaku hanya setelah email lama dan baru sama-sama dikonfirmasi",async()=>{
  const user=await signup();const context=await session(user.email);
  const next=`baru-${randomUUID()}@example.test`;
  expect((await act(context,{action:"email.change",password,email:user.email.toUpperCase()})).status()).toBe(400);  // sama dengan yang sekarang
  const requested=await act(context,{action:"email.change",password,email:next});
  expect(requested.status(),await requested.text()).toBe(200);
  const [oldMail]=await mailTo(user.email,1);const [newMail]=await mailTo(next,1);   // masing-masing alamat menerima satu surat konfirmasi
  const emailNow=async()=>(await admin.auth.admin.getUserById(user.id)).data.user!.email;
  expect(await emailNow()).toBe(user.email);
  // Konfirmasi dari satu sisi saja belum mengubah apa pun.
  await rf(await confirmLink(newMail.ID),{redirect:"manual"});
  expect(await emailNow()).toBe(user.email);
  // Setelah sisi satunya dikonfirmasi, email berganti.
  await rf(await confirmLink(oldMail.ID),{redirect:"manual"});
  expect(await emailNow()).toBe(next);
  const viaNew=await login(next);expect(viaNew.response.status()).toBe(200);
  expect((await login(user.email)).response.status()).toBe(401);
  await viaNew.context.dispose();await context.dispose();
});

test("hapus akun: akses tertutup, hanya unduh dan batal yang boleh, batal memulihkan",async()=>{
  const user=await signup();const context=await session(user.email);
  const marker=`Murid-${randomUUID().slice(0,8)}`;
  expect((await student(context,marker)).status()).toBe(200);
  // Kontrol positif: sebelum meminta hapus, daftar murid memuat data. (Status halaman tidak bisa dipakai: Next.js
  // mengalirkan halaman sehingga redirect() dapat tetap berstatus 200; yang penting adalah datanya tidak disajikan.)
  expect(await (await context.get("/murid")).text()).toContain(marker);
  const requested=await act(context,{action:"deletion.request",password});expect(requested.status()).toBe(200);
  expect((await student(context,"Sesudah hapus")).status()).toBe(403);
  const pendingPage=await (await context.get("/akun")).text();
  expect(pendingPage).toContain("Akun menunggu penghapusan");
  expect(pendingPage).toContain("Batalkan penghapusan akun");
  expect(pendingPage).toContain("Unduh data Anda");
  expect(pendingPage).not.toContain("Minta penghapusan akun");
  expect(pendingPage).not.toContain("Ubah kata sandi");
  expect(await (await context.get("/murid")).text()).not.toContain(marker);
  expect(await (await context.get("/dashboard")).text()).not.toContain("Pertemuan mendatang");
  expect((await context.get("/akun")).status()).toBe(200);
  expect((await act(context,{action:"email.change",password,email:`x-${randomUUID()}@example.test`})).status()).toBe(403);
  expect((await act(context,{action:"password.change",password,newPassword:"kalimat panjang yang baru dan aman"})).status()).toBe(403);
  const exported=await exportData(context,password);expect(exported.status()).toBe(200);
  expect(await exported.text()).toContain("Murid (1)");
  expect((await act(context,{action:"deletion.cancel"})).status()).toBe(200);
  expect((await context.get("/dashboard")).status()).toBe(200);
  expect((await student(context,"Sesudah batal")).status()).toBe(200);
  await context.dispose();
});

test("penghapusan terjadwal menghapus akun yang lewat masa batal sehingga tidak bisa masuk lagi",async()=>{
  const user=await signup();const context=await session(user.email);
  expect((await act(context,{action:"deletion.request",password})).status()).toBe(200);
  sql(`update public.accounts set deletion_requested_at = now() - interval '6 days' where id = '${user.id}'::uuid;`);
  expect((await admin.rpc("process_account_deletions")).error).toBeNull();
  expect((await admin.auth.admin.getUserById(user.id)).data.user).not.toBeNull();     // 6 hari: belum
  sql(`update public.accounts set deletion_requested_at = now() - interval '8 days' where id = '${user.id}'::uuid;`);
  expect((await act(context,{action:"deletion.cancel"})).status()).toBe(400);          // masa batal habis
  const processed=await admin.rpc("process_account_deletions");expect(processed.error).toBeNull();expect(processed.data).toBeGreaterThanOrEqual(1);
  expect((await admin.auth.admin.getUserById(user.id)).data.user).toBeNull();
  expect((await login(user.email)).response.status()).toBe(401);
  await context.dispose();
});
