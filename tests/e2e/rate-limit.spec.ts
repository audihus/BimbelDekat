import { test,expect,request } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomInt,randomUUID } from "node:crypto";
import { resilientFetch } from "../../src/lib/supabase/resilient-fetch";

process.loadEnvFile(".env.local");
const url=process.env.NEXT_PUBLIC_SUPABASE_URL!;
if(url!=="http://127.0.0.1:55321")throw new Error("Pengujian hanya boleh memakai Supabase lokal.");
const admin=createClient(url,process.env.SUPABASE_SECRET_KEY!,{global:{fetch:resilientFetch()},auth:{persistSession:false,autoRefreshToken:false}});
const password="KataSandiUjiLokal!2026";
const users:string[]=[];
// Setiap tes memakai alamat IP buatan sendiri agar kuota tidak saling mengganggu antar tes maupun antar putaran.
const fakeIp=()=>`10.${randomInt(1,255)}.${randomInt(1,255)}.${randomInt(1,255)}`;
async function signup(){const email=`rl-${randomUUID()}@example.test`;const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{display_name:"Guru pembatas"}});if(error||!data.user)throw new Error("Fixture akun lokal tidak dapat dibuat.");users.push(data.user.id);return email;}
async function from(ip:string){return request.newContext({baseURL:"http://127.0.0.1:3000",extraHTTPHeaders:{Origin:"http://127.0.0.1:3000","x-forwarded-for":ip}});}
const login=(context:Awaited<ReturnType<typeof from>>,email:string,pass:string)=>context.post("/api/auth",{data:{mode:"login",email,password:pass}});
test.afterAll(async()=>{for(const id of users)await admin.auth.admin.deleteUser(id);});

test("lima kali salah memblokir email+IP itu, termasuk dengan kata sandi benar; lokasi lain tidak terdampak",async()=>{
  const email=await signup(),ip=fakeIp();const here=await from(ip);
  for(let i=1;i<=5;i++){const wrong=await login(here,email,"kata sandi salah sekali");expect(wrong.status(),`percobaan ${i}`).toBe(401);}
  const blocked=await login(here,email,"kata sandi salah lagi");
  expect(blocked.status()).toBe(429);
  expect(Number(blocked.headers()["retry-after"])).toBeGreaterThan(0);
  expect((await blocked.json()).error).toContain("Coba lagi dalam");
  // Kata sandi benar pun ditolak selama diblokir; tebakan beruntung tidak boleh lolos.
  expect((await login(here,email,password)).status()).toBe(429);
  // Orang lain dari IP berbeda dengan kata sandi benar tetap bisa masuk.
  const elsewhere=await from(fakeIp());
  expect((await login(elsewhere,email,password)).status()).toBe(200);
  await here.dispose();await elsewhere.dispose();
});

// Browser sungguhan tidak mengirim x-forwarded-for di lokal, jadi IP jatuh ke "local". Jalur itu harus ikut terkunci.
test("tanpa header IP (seperti browser lokal): percobaan ke-6 dengan kata sandi benar tetap diblokir",async()=>{
  const email=await signup();
  const bare=await request.newContext({baseURL:"http://127.0.0.1:3000",extraHTTPHeaders:{Origin:"http://127.0.0.1:3000"}});
  for(let i=1;i<=5;i++)expect((await login(bare,email,"kata sandi salah sekali")).status(),`percobaan ${i}`).toBe(401);
  expect((await login(bare,email,password)).status()).toBe(429);
  await bare.dispose();
});

test("login berhasil berulang tidak dihitung sebagai percobaan gagal",async()=>{
  const email=await signup(),ip=fakeIp();const here=await from(ip);
  for(let i=1;i<=7;i++)expect((await login(here,email,password)).status(),`masuk ke-${i}`).toBe(200);
  await here.dispose();
});

test("lupa kata sandi dibatasi per email dan jawabannya tidak membocorkan apakah email terdaftar",async()=>{
  const email=await signup(),ip=fakeIp();const here=await from(ip);
  const ask=(address:string)=>here.post("/api/auth",{data:{mode:"forgot",email:address}});
  const statuses:number[]=[];
  for(let i=0;i<4;i++)statuses.push((await ask(email)).status());
  expect(statuses.slice(0,3)).toEqual([200,200,200]);
  expect(statuses[3]).toBe(429);
  const unknown=await (await from(fakeIp())).post("/api/auth",{data:{mode:"forgot",email:`tidak-ada-${randomUUID()}@example.test`}});
  expect(unknown.status()).toBe(200);
  expect((await unknown.json()).message).toContain("Jika email tersebut terdaftar");
  await here.dispose();
});
