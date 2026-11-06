import { test,expect,request } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomInt,randomUUID } from "node:crypto";
import { resilientFetch } from "../../src/lib/supabase/resilient-fetch";

process.loadEnvFile(".env.local");
const url=process.env.NEXT_PUBLIC_SUPABASE_URL!;
if(url!=="http://127.0.0.1:55321")throw new Error("Pengujian hanya boleh memakai Supabase lokal.");
const admin=createClient(url,process.env.SUPABASE_SECRET_KEY!,{global:{fetch:resilientFetch()},auth:{persistSession:false,autoRefreshToken:false}});
const password="KataSandiUjiLokal!2026";
const base="http://127.0.0.1:3000";
const users:string[]=[];
const fakeIp=()=>`10.${randomInt(1,255)}.${randomInt(1,255)}.${randomInt(1,255)}`;
test.afterAll(async()=>{for(const id of users)await admin.auth.admin.deleteUser(id);});

// Uji lewat browser sungguhan: formulir singkat harus benar-benar bisa diisi dan disimpan oleh guru.
test("guru menambah murid, paket, pertemuan lewat tengah malam, dan pembayaran hanya dengan formulir singkat",async({browser})=>{
  const email=`ui-${randomUUID()}@example.test`;
  const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{display_name:"Guru uji"}});
  if(error||!data.user)throw new Error("Fixture akun lokal tidak dapat dibuat.");
  users.push(data.user.id);
  const api=await request.newContext({baseURL:base,extraHTTPHeaders:{Origin:base,"x-forwarded-for":fakeIp()}});
  let login=await api.post("/api/auth",{data:{mode:"login",email,password}});
  for(let i=0;i<3&&login.status()===503;i++){await new Promise(r=>setTimeout(r,3000));login=await api.post("/api/auth",{data:{mode:"login",email,password}});}
  expect(login.status()).toBe(200);
  const cookie=/les_session=([a-f0-9]+)/.exec(login.headers()["set-cookie"]??"")![1];

  const context=await browser.newContext();
  await context.addCookies([{name:"les_session",value:cookie,url:base}]);
  const page=await context.newPage();
  const name=`Murid-${randomUUID().slice(0,6)}`;

  // 1. Tambah murid: hanya nama.
  await page.goto("/murid");
  await page.getByLabel("Nama murid").fill(name);
  await page.getByRole("button",{name:"Simpan murid"}).click();
  await expect(page.getByText("Perubahan tersimpan.").or(page.getByText(/tersimpan/i)).first()).toBeVisible();
  await page.goto("/murid");
  await page.getByRole("link",{name:new RegExp(name)}).click();

  // 2. Murid baru belum punya paket: formulir paket terbuka; isi pelajaran dan harga (jumlah pertemuan bawaan 8).
  await expect(page.getByText("Mulai dengan paket bimbel")).toBeVisible();
  await page.getByLabel("Pelajaran").fill("Matematika");
  await page.getByLabel("Harga paket (Rp)").fill("400000");
  await page.getByRole("button",{name:"Simpan paket"}).click();
  await expect(page.getByText("Sisa pertemuan").first()).toBeVisible();
  await expect(page.getByText(/dari 8 pertemuan tersisa/)).toBeVisible();

  // 3. Pertemuan 23.30 selama 60 menit: harus selesai 00.30 hari berikutnya dan tersimpan di tanggal yang benar.
  await page.getByLabel("Tanggal",{exact:true}).fill("2027-03-15");
  await page.getByLabel("Jam mulai",{exact:true}).fill("23:30");
  await page.locator("select[name=minutes]").selectOption("60");
  await page.getByRole("button",{name:"Simpan pertemuan"}).click();
  await expect(page.getByText("Pertemuan yang akan datang")).toBeVisible();
  await expect(page.getByText(/15 Mar 2027, 23\.30/)).toBeVisible();

  // 4. Pertemuan yang sama dua kali ditolak (jadwal bertabrakan).
  await page.getByLabel("Tanggal",{exact:true}).fill("2027-03-15");
  await page.getByLabel("Jam mulai",{exact:true}).fill("23:45");
  await page.getByRole("button",{name:"Simpan pertemuan"}).click();
  await expect(page.getByRole("alert").filter({hasText:/bertabrakan/i})).toBeVisible();

  // 5. Pembayaran: hanya jumlah uang.
  await page.getByLabel("Uang yang diterima (Rp)").fill("150000");
  await page.getByRole("button",{name:"Catat pembayaran"}).click();
  await expect(page.getByText(/Belum dibayar/).first()).toBeVisible();
  await expect.poll(async()=>await page.content(),{timeout:8000}).toMatch(/250\.000/);

  await context.close();await api.dispose();
});
