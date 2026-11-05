import { test,expect,request,type APIRequestContext } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { resilientFetch } from "../../src/lib/supabase/resilient-fetch";

process.loadEnvFile(".env.local");
const url=process.env.NEXT_PUBLIC_SUPABASE_URL!;
if(url!=="http://127.0.0.1:55321")throw new Error("Pengujian hanya boleh memakai Supabase lokal.");
const admin=createClient(url,process.env.SUPABASE_SECRET_KEY!,{global:{fetch:resilientFetch()},auth:{persistSession:false,autoRefreshToken:false}});
const password="KataSandiUjiLokal!2026";
const origin={Origin:"http://127.0.0.1:3000"};
const users:{id:string;email:string}[]=[];
async function signup(){const email=`test-${randomUUID()}@example.test`;const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{display_name:"Guru pengujian"}});if(error||!data.user)throw new Error("Fixture akun lokal tidak dapat dibuat.");const user={id:data.user.id,email};users.push(user);return user;}
async function login(user:{email:string}){const context=await request.newContext({baseURL:"http://127.0.0.1:3000",extraHTTPHeaders:origin});const response=await context.post("/api/auth",{data:{mode:"login",email:user.email,password}});expect(response.status()).toBe(200);return context;}
async function command(context:APIRequestContext,action:string,payload:unknown,requestId=randomUUID()){return context.post("/api/commands",{data:{action,payload,requestId}});}
test.afterAll(async()=>{for(const user of users)await admin.auth.admin.deleteUser(user.id);});

test("sesi browser hanya cookie acak HttpOnly; origin asing ditolak",async()=>{
  const user=await signup();const context=await login(user);
  const state=await context.storageState();const cookie=state.cookies.find(cookie=>cookie.name==="les_session");
  expect(cookie?.httpOnly).toBe(true);expect(cookie?.value).toMatch(/^[a-f0-9]{64}$/);
  expect(state.cookies.some(cookie=>cookie.name.includes("auth-token"))).toBe(false);
  const denied=await context.post("/api/commands",{headers:{Origin:"https://other.example"},data:{action:"student.create",payload:{name:"Ditolak",level:"SD"},requestId:randomUUID()}});
  expect(denied.status()).toBe(403);
  await context.dispose();
});

test("akses lewat aplikasi menjaga isolasi dan menolak pemilik dari formulir",async()=>{
  const alice=await signup(),bob=await signup();const a=await login(alice),b=await login(bob);
  const secretName=`Murid-${randomUUID().slice(0,8)}`,secretNote=`Catatan-${randomUUID().slice(0,8)}`;
  const response=await command(a,"student.create",{name:secretName,level:"SD",notes:secretNote});expect(response.status()).toBe(200);const id=(await response.json()).result.id;
  const denied=await command(b,"student.update",{id,name:"Dicoba Bob",level:"SD"});expect(denied.status()).toBe(400);
  const spoof=await command(a,"student.create",{name:"Pemilik palsu",level:"SD",workspace_id:randomUUID()});expect(spoof.status()).toBe(400);
  const ownPage=await a.get("/dashboard");expect(ownPage.status()).toBe(200);
  // Kontrol positif: pemilik melihat datanya. Tanpa ini, asersi "tidak bocor" bisa lolos karena halaman salah.
  const ownDetail=await (await a.get(`/murid/${id}`)).text();expect(ownDetail).toContain(secretName);expect(ownDetail).toContain(secretNote);
  // Invarian yang penting adalah data tidak terbuka. Kode status bukan jaminan: Next.js mengalirkan halaman
  // (loading.tsx) sehingga notFound() dapat tetap berstatus 200.
  const otherDetail=await (await b.get(`/murid/${id}`)).text();expect(otherDetail).not.toContain(secretName);expect(otherDetail).not.toContain(secretNote);
  await a.dispose();await b.dispose();
});

test("keluar semua perangkat menghentikan dua sesi aplikasi",async()=>{
  const user=await signup();const first=await login(user),second=await login(user);
  expect((await second.get("/dashboard")).status()).toBe(200);
  const response=await first.post("/api/auth",{data:{mode:"logout-all"}});expect(response.status()).toBe(200);
  const closed=await second.get("/dashboard",{maxRedirects:0});expect(closed.status()).toBe(307);expect(closed.headers().location).toContain("/masuk");
  await first.dispose();await second.dispose();
});
