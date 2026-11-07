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
  const email=`buy-${role}-${randomUUID()}@example.test`;
  const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{display_name:role==="admin"?"Pengelola uji":"Guru uji"}});
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
// Teks yang terlihat: tanpa skrip data RSC, komentar pemisah React, tag, dan spasi tak terputus dari format rupiah.
const visible=(html:string)=>html.replace(/<script[\s\S]*?<\/script>/g," ").replace(/<!--.*?-->/g,"").replace(/<[^>]+>/g," ").replace(/ /g," ").replace(/\s+/g," ");
test.afterAll(async()=>{for(const id of users)await admin.auth.admin.deleteUser(id);});

test("pencari melihat daerah mengajar yang cocok (bukan tempat tinggal), harga mulai, dan tag pelajaran",async()=>{
  const teacher=await signup("teacher"),boss=await signup("admin");
  const t=await session(teacher.email),a=await session(boss.email);
  const name=`Guru-${randomUUID().slice(0,8)}`;
  const submitted=await command(t,"profile.submit",{document:{name,about:"Mengajar dengan sabar.",phone:"6281234567890",province:"Jawa Barat",regency:"Kota Bekasi",
    areas:[{province:"Jawa Barat",regency:"Kota Depok",district:"Beji"}],
    offers:[{subject:"Matematika",level:"SD",mode:"offline",duration:60,price:"90000"},{subject:"Fisika",level:"SMA",mode:"online",duration:60,price:"60000"}]}});
  expect(submitted.status(),await submitted.text()).toBe(200);
  const profileId=sql(`select p.id from public.teacher_profiles p join public.workspaces w on w.id = p.workspace_id where w.owner_id = '${teacher.id}'::uuid;`);
  expect((await a.post("/api/admin/moderate",{data:{id:profileId,decision:"approve",reason:"ok"}})).status()).toBe(200);

  const visitor=await request.newContext({baseURL:"http://127.0.0.1:3000"});
  const plain=visible(await (await visitor.get(`/cari?q=${name}`)).text());
  expect(plain).toContain("Tinggal di Kota Bekasi");
  expect(plain).toContain("Bisa datang ke Beji, Kota Depok");
  expect(plain).toContain("Mulai Rp 60.000 / pertemuan");        // termurah dari dua penawaran, bukan yang pertama
  expect(plain).toContain("Matematika");expect(plain).toContain("Fisika");
  expect(plain).toContain("Online");expect(plain).toContain("Tatap muka");

  const depok=visible(await (await visitor.get(`/cari?q=${name}&mode=offline&regency=Kota%20Depok`)).text());
  expect(depok).toContain("Mengajar di Beji, Kota Depok");       // sorotan daerah yang cocok dengan pencarian
  expect(depok).toContain("Tinggal di Kota Bekasi");            // tempat tinggal tetap jujur ditampilkan terpisah
  await visitor.dispose();await t.dispose();await a.dispose();
});

test("halaman cari: filter lengkap dilipat secara bawaan dan terbuka bila filter lanjutan dipakai",async()=>{
  const visitor=await request.newContext({baseURL:"http://127.0.0.1:3000"});
  const closed=await (await visitor.get("/cari")).text();
  expect(closed).toContain("Filter lainnya");
  expect(closed).not.toMatch(/<details[^>]*\sopen/);
  expect(await (await visitor.get("/cari?mode=online")).text()).toMatch(/<details[^>]*\sopen/);
  // Tautan dengan kabupaten/kota tanpa provinsi: provinsi disimpulkan, tidak muncul label "tidak dikenali".
  const shared=await (await visitor.get("/cari?regency=Kota%20Depok")).text();
  expect(shared).not.toContain("tidak dikenali");
  expect(shared).toMatch(/<option value="Jawa Barat"[^>]*selected/);
  // Jenjang, cara belajar, dan kecamatan tetap ada di formulir walau dilipat, sehingga ikut terkirim.
  for(const field of ['name="level"','name="mode"','name="district"','name="q"','name="province"','name="regency"'])expect(closed,field).toContain(field);
  await visitor.dispose();
});

const headerOf=(html:string)=>html.match(/<header class="public-header">[\s\S]*?<\/header>/)?.[0]??"";

test("halaman depan: navbar hanya menuju bagian di halaman itu sendiri",async()=>{
  const visitor=await request.newContext({baseURL:"http://127.0.0.1:3000"});
  const html=await (await visitor.get("/")).text();
  const header=headerOf(html);
  for(const id of ["cara","faq"]){
    expect(header).toContain(`href="#${id}"`);
    expect(html,id).toContain(`id="${id}"`);                       // setiap tautan punya sasaran
  }
  expect(header).not.toContain('href="/cari"');
  expect(header).not.toContain('href="/untuk-guru"');
  expect(header).not.toContain('href="/masuk"');
  await visitor.dispose();
});

test("dua tampilan terpisah: header memuat Cari bimbel dan Untuk guru, tanpa Masuk atau Daftar",async()=>{
  const visitor=await request.newContext({baseURL:"http://127.0.0.1:3000"});
  for(const path of ["/untuk-guru","/cari"]){
    const header=headerOf(await (await visitor.get(path)).text());
    expect(header,path).toContain(">Beranda<");                     // permintaan: opsi Beranda di navbar
    expect(header,path).toContain('href="/cari"');
    expect(header,path).toContain('href="/untuk-guru"');
    expect(header,path).not.toContain('href="/masuk"');             // arahan: bilah navigasi tanpa Masuk
    expect(header,path).not.toContain('href="/daftar"');            // dan tanpa Buat profil guru
    expect(header,path).toContain("BimbelDekat");
  }
  await visitor.dispose();
});

test("halaman depan untuk ORANG TUA: cari bimbel, langkah di dalam kartu, tanya jawab, dan jalan ke halaman guru",async()=>{
  const visitor=await request.newContext({baseURL:"http://127.0.0.1:3000"});
  const html=await (await visitor.get("/")).text();
  const text=visible(html);
  expect(text).toContain("Cari bimbel privat di dekat rumah Anda.");
  expect(html).toContain('role="search"');
  expect(html).toContain('action="/cari"');
  expect(html).toContain("/cari?q=Matematika");
  expect(html).toContain("/cari?province=Jawa%20Barat&amp;regency=Kota%20Depok");   // pintasan kota (& ditulis &amp; di HTML)
  // Tiga langkah: nomor DI DALAM kartu (bukan menggantung di tepinya), tiap kartu punya gambar.
  const steps=[...html.matchAll(/<article class="card step">([\s\S]*?)<\/article>/g)].map(m=>m[1]);
  expect(steps).toHaveLength(3);
  steps.forEach((card,i)=>{expect(card).toContain('class="step-num"');expect(card).toContain('class="step-art"');expect(visible(card)).toContain(String(i+1));});
  expect(html).toMatch(/class="hero-art" aria-hidden="true"/);
  // Tanya jawab jujur: tidak menjanjikan verifikasi guru.
  expect(text).toContain("Apakah guru sudah diverifikasi?");
  expect(text).toContain("belum kami periksa");
  // Ini halaman orang tua: tidak ada ajakan daftar untuk guru selain tautan ke halaman guru.
  expect(text).not.toContain("Daftarkan diri Anda");
  expect(html).toContain('href="/untuk-guru"');
  expect(text).toContain("Anda guru bimbel privat?");
  await visitor.dispose();
});

test("halaman untuk GURU: judul baru, tombol daftar, tanpa kotak cari, dan jalan ke halaman orang tua",async()=>{
  const visitor=await request.newContext({baseURL:"http://127.0.0.1:3000"});
  const html=await (await visitor.get("/untuk-guru")).text();
  const text=visible(html);
  expect(text).toContain("Dapatkan murid baru untuk bimbel privat Anda.");
  expect(text).toContain("Pasang iklan bimbel Anda. Orang tua di daerah Anda menghubungi lewat WhatsApp.");
  expect(text).toContain("Ingin mendaftarkan diri? Langsung saja.");
  expect(text).toContain("Daftarkan diri Anda");
  expect(html).toContain('href="/daftar"');
  expect(text).toContain("Sudah punya akun?");                    // guru lama tetap punya jalan masuk
  expect(html).toContain('href="/masuk"');
  expect(html).not.toContain('role="search"');                   // pencarian ada di halaman orang tua
  expect(text).not.toContain("Cari bimbel privat di dekat rumah Anda.");
  expect(text).toContain("Siapa yang menentukan tarif?");
  expect(text).not.toMatch(/gratis|tanpa biaya|bebas biaya/i);   // model bisnis belum diputuskan
  expect(html).toContain('href="/cari"');                         // jalan ke halaman orang tua
  const steps=[...html.matchAll(/<article class="card step">([\s\S]*?)<\/article>/g)].map(m=>m[1]);
  expect(steps).toHaveLength(3);
  await visitor.dispose();
});

test("halaman kesiapan produksi: privasi, kontak, robots, sitemap, dan cron yang tertutup",async()=>{
  const visitor=await request.newContext({baseURL:"http://127.0.0.1:3000"});
  const privacy=visible(await (await visitor.get("/privasi")).text());
  for(const text of ["Kebijakan Privasi","Data yang kami simpan","Layanan pihak lain","Hak guru atas data"])expect(privacy,text).toContain(text);
  const contact=visible(await (await visitor.get("/kontak")).text());
  expect(contact).toContain("Butuh bantuan?");
  expect(contact).toContain("Melaporkan profil guru");
  // Footer di halaman publik menautkan keduanya.
  const home=await (await visitor.get("/")).text();
  expect(home).toContain('href="/privasi"');expect(home).toContain('href="/kontak"');
  // robots menutup area guru dan API, membuka halaman publik; sitemap memuat halaman tetap.
  const robots=await (await visitor.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /dashboard");expect(robots).toContain("Disallow: /api/");expect(robots).toContain("Sitemap:");
  const sitemap=await (await visitor.get("/sitemap.xml")).text();
  for(const path of ["/cari","/untuk-guru","/privasi","/kontak"])expect(sitemap,path).toContain(`${path}</loc>`);
  expect(sitemap).not.toContain("/dashboard");
  // Rute cron tertutup tanpa rahasia yang benar (tidak menyentuh basis data).
  expect((await visitor.get("/api/cron/process-deletions")).status()).toBe(401);
  expect((await visitor.get("/api/cron/process-deletions",{headers:{authorization:"Bearer salah"}})).status()).toBe(401);
  await visitor.dispose();
});
