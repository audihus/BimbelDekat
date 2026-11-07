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
const base="http://127.0.0.1:3000";
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
function sql(statement:string){const result=spawnSync("docker",["exec","-i","supabase_db_les-privat-local","psql","-X","-qAt","-v","ON_ERROR_STOP=1","-U","postgres","-d","postgres"],{input:statement,encoding:"utf8",windowsHide:true,timeout:20000});if(result.status!==0)throw new Error(result.stderr||"SQL tes gagal.");return result.stdout.trim();}
async function login(email:string){
  const context=await request.newContext({baseURL:base,extraHTTPHeaders:{Origin:base,"x-forwarded-for":fakeIp()}});
  let response=await context.post("/api/auth",{data:{mode:"login",email,password}});
  for(let i=0;i<3&&response.status()===503;i++){await new Promise(r=>setTimeout(r,3000));response=await context.post("/api/auth",{data:{mode:"login",email,password}});}
  expect(response.status()).toBe(200);
  return {context,cookie:/les_session=([a-f0-9]+)/.exec(response.headers()["set-cookie"]??"")![1]};
}
const command=(context:APIRequestContext,action:string,payload:unknown)=>context.post("/api/commands",{data:{action,payload,requestId:randomUUID()}});
const upload=(context:APIRequestContext,body:Buffer|Uint8Array,type="image/jpeg")=>context.post("/api/profil/foto",{headers:{"Content-Type":type},data:Buffer.from(body)});
// PNG 1x1 yang sah; browser memperbesarnya jadi JPEG persegi 480 px sebelum diunggah.
const PNG=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==","base64");
const doc=(name:string)=>({name,about:"Mengajar matematika dengan sabar.",phone:"6281234567890",province:"Jawa Barat",regency:"Kota Bekasi",areas:[],offers:[{subject:"Matematika",level:"SD",mode:"online",duration:60,price:"75000"}]});
test.afterAll(async()=>{for(const id of users)await admin.auth.admin.deleteUser(id);});

test("foto profil: unggah di editor, tidak tampil sebelum disetujui, tayang di kartu dan profil sesudahnya, tanpa EXIF",async({browser})=>{
  const teacher=await signup("teacher"),boss=await signup("admin");
  const t=await login(teacher.email),a=await login(boss.email);
  const name=`Foto-${randomUUID().slice(0,6)}`;
  expect((await command(t.context,"profile.save",{document:doc(name)})).status()).toBe(200);

  // Unggah lewat editor sungguhan: dipotong dan diperkecil di browser, lalu disimpan sebagai draf.
  const context=await browser.newContext();
  await context.addCookies([{name:"les_session",value:t.cookie,url:base}]);
  const page=await context.newPage();
  await page.goto("/profil");
  await page.getByLabel("Pilih foto profil").setInputFiles({name:"saya.png",mimeType:"image/png",buffer:PNG});
  await expect(page.getByText("Foto terunggah.")).toBeVisible();
  await expect(page.locator("img.avatar.photo").first()).toBeVisible();          // pratinjau memakai foto draf milik guru
  await page.getByRole("button",{name:"Kirim untuk dicek"}).click();
  await expect(page.getByText("dikirim untuk dicek",{exact:false})).toBeVisible();

  const profileId=sql(`select p.id from public.teacher_profiles p join public.workspaces w on w.id = p.workspace_id where w.owner_id = '${teacher.id}'::uuid;`);
  const photoId=sql(`select draft->>'photo' from public.teacher_profiles where id = '${profileId}'::uuid;`);
  expect(photoId).toMatch(/^[0-9a-f-]{36}$/);

  // Belum disetujui: publik tidak bisa melihat fotonya. Pemilik dan pengelola bisa meninjaunya.
  const visitor=await request.newContext({baseURL:base});
  expect((await visitor.get(`/foto/${photoId}`)).status()).toBe(404);
  expect((await visitor.get(`/api/profil/foto/${photoId}`)).status()).toBe(404);
  const reviewed=await a.context.get(`/api/profil/foto/${photoId}`);
  expect(reviewed.status()).toBe(200);expect(reviewed.headers()["content-type"]).toBe("image/jpeg");
  expect(reviewed.headers()["cache-control"]).toContain("no-store");
  expect((await t.context.get(`/api/profil/foto/${photoId}`)).status()).toBe(200);
  const other=await signup("teacher");const o=await login(other.email);
  expect((await o.context.get(`/api/profil/foto/${photoId}`)).status()).toBe(404);   // guru lain tidak melihat foto yang belum tayang
  expect((await a.context.post("/api/admin/moderate",{data:{id:profileId,decision:"approve",reason:""}})).status()).toBe(200);

  // Tayang: kartu pencarian dan halaman profil memakai foto, berkas yang dilayani JPEG tanpa APP1/EXIF, boleh di-cache sebentar.
  const card=await (await visitor.get(`/cari?q=${encodeURIComponent(name)}`)).text();
  expect(card).toContain(`src="/foto/${photoId}"`);
  const profile=await (await visitor.get(`/guru/${profileId}`)).text();
  expect(profile).toContain(`src="/foto/${photoId}"`);
  const served=await visitor.get(`/foto/${photoId}`);
  expect(served.status()).toBe(200);expect(served.headers()["content-type"]).toBe("image/jpeg");
  expect(served.headers()["x-content-type-options"]).toBe("nosniff");
  expect(served.headers()["cache-control"]).toContain("public");
  const bytes=await served.body();
  expect([...bytes.subarray(0,2)]).toEqual([0xff,0xd8]);expect([...bytes.subarray(-2)]).toEqual([0xff,0xd9]);
  expect(bytes.includes(Buffer.from("Exif"))).toBe(false);
  expect((await visitor.get(`/foto/${randomUUID()}`)).status()).toBe(404);
  expect((await visitor.get("/foto/bukan-uuid")).status()).toBe(404);
  await context.close();
});

test("unggah foto menolak berkas palsu, ukuran berlebih, permintaan tanpa sesi, dan asal lain",async()=>{
  const teacher=await signup("teacher");
  const t=await login(teacher.email);
  const rejected=async(body:Buffer,message:RegExp,status=400,type="image/jpeg")=>{const response=await upload(t.context,body,type);expect(response.status(),await response.text()).toBe(status);expect(await response.text()).toMatch(message);};
  await rejected(PNG,/JPEG/);                                                   // PNG berlabel JPEG
  await rejected(Buffer.from("<script>alert(1)</script>"),/JPEG|dibaca/);       // HTML berlabel JPEG
  await rejected(Buffer.from([0xff,0xd8,0xff,0xd9]),/terpotong|dibaca/);        // tanpa gambar
  await rejected(Buffer.alloc(10,1),/dibaca|JPEG/);
  await rejected(PNG,/JPEG/,415,"image/png");                                   // jenis konten harus JPEG
  const huge=await t.context.post("/api/profil/foto",{headers:{"Content-Type":"image/jpeg"},data:Buffer.alloc(1_200_000,0xff)});
  expect(huge.status()).toBe(413);
  const anonymous=await request.newContext({baseURL:base,extraHTTPHeaders:{Origin:base}});
  expect((await upload(anonymous,PNG)).status()).toBe(401);
  expect((await t.context.post("/api/profil/foto",{headers:{"Content-Type":"image/jpeg",Origin:"https://other.example"},data:PNG})).status()).toBe(403);
  // Profil tidak boleh menunjuk foto yang bukan miliknya (juga lewat jalur perintah biasa).
  const stranger=randomUUID();
  const claim=await command(t.context,"profile.save",{document:{...doc("Klaim Foto"),photo:stranger}});
  expect(claim.status()).toBe(400);
  expect((await command(t.context,"profile.save",{document:{...doc("Klaim Foto"),photo:"bukan-uuid"}})).status()).toBe(400);
});
