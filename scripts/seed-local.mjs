import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { resilientFetch } from "../src/lib/supabase/resilient-fetch.ts";

process.loadEnvFile(".env.local");
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
if(url!=="http://127.0.0.1:55321") throw new Error("Data contoh hanya boleh ditambahkan ke Supabase lokal proyek ini.");
// Docker Desktop di Windows kadang menahan permintaan pertama ("fetch failed"); pembungkus ini mengulanginya.
const options={global:{fetch:resilientFetch()},auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
const admin=createClient(url,process.env.SUPABASE_SECRET_KEY,options);
const password="ContohLesPrivat!2026";
const samples=[{email:"rina@example.test",name:"Rina (contoh)",role:"teacher"},{email:"budi@example.test",name:"Budi (contoh)",role:"teacher"},{email:"admin@example.test",name:"Pengelola (contoh)",role:"admin"}];
const {data:list,error:listError}=await admin.auth.admin.listUsers();
if(listError)throw new Error(`Auth lokal belum dapat diakses: ${listError.message}`);
for(const sample of samples){
  let user=list.users.find(user=>user.email===sample.email);
  if(!user){const created=await admin.auth.admin.createUser({email:sample.email,password,email_confirm:true,user_metadata:{display_name:sample.name}});if(created.error)throw created.error;user=created.data.user;}
  if(sample.role==="admin"){
    if(!/^[0-9a-f-]{36}$/i.test(user.id))throw new Error("ID akun tidak sah.");
    const result=spawnSync("docker",["exec","-i","supabase_db_les-privat-local","psql","-X","-qAt","-v","ON_ERROR_STOP=1","-U","postgres","-d","postgres"],{input:`update public.accounts set role='admin' where id='${user.id}'::uuid;`,encoding:"utf8",windowsHide:true,timeout:15000});
    if(result.status!==0)throw new Error("Peran pengelola lokal belum dapat diatur.");
  }
}
const reviewer=createClient(url,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,options);
const adminLogin=await reviewer.auth.signInWithPassword({email:"admin@example.test",password});
if(adminLogin.error)throw adminLogin.error;
for(const sample of samples.filter(sample=>sample.role==="teacher")){
  const client=createClient(url,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,options);
  const login=await client.auth.signInWithPassword({email:sample.email,password});if(login.error)throw login.error;
  const cmd=async(action,payload)=>{const result=await client.rpc("app_command",{p_action:action,p_payload:payload,p_request:randomUUID()});if(result.error)throw new Error(`${action}: ${result.error.message}`);return result.data;};
  const current=await client.rpc("workspace_snapshot");if(current.error)throw current.error;
  if(!current.data.students.length){
    const student=await cmd("student.create",{name:sample.email.startsWith("rina")?"Arka (contoh)":"Dina (contoh)",level:"SD",source:"existing",notes:"Data contoh lokal untuk mencoba aplikasi."});
    const pack=await cmd("package.create",{student_id:student.id,name:"Matematika",quota:8,opening_used:2,agreed_price:"400000"});
    const past=new Date(Date.now()-2*86400000);past.setUTCHours(2,0,0,0);
    const lesson=await cmd("lesson.create",{package_id:pack.id,starts_at:past.toISOString(),ends_at:new Date(past.getTime()+3600000).toISOString(),mode:"online"});
    await cmd("lesson.finish",{id:lesson.id});
    await cmd("payment.record",{package_id:pack.id,amount:"250000",kind:"payment",reason:"Pembayaran contoh"});
    const future=new Date(Date.now()+86400000);future.setUTCHours(2,0,0,0);
    await cmd("lesson.create",{package_id:pack.id,starts_at:future.toISOString(),ends_at:new Date(future.getTime()+3600000).toISOString(),mode:"online"});
  }
  const state=await client.rpc("workspace_snapshot");
  if(!state.data.profile){
    await cmd("profile.submit",{document:{name:sample.name,about:"Profil contoh lokal untuk mencoba pencarian guru. Bukan penawaran les sungguhan.",phone:"6280000000000",province:"Jawa Barat",regency:"Kota Bekasi",areas:[{province:"Jawa Barat",regency:"Kota Depok",district:"Beji"}],offers:[{subject:"Matematika",level:"SD",mode:"online",duration:60,price:"75000"},{subject:"Matematika",level:"SD",mode:"offline",duration:60,price:"90000"}]}});
    const next=await client.rpc("workspace_snapshot");
    const reviewed=await reviewer.rpc("moderate_profile",{p_id:next.data.profile.id,p_decision:"approve",p_reason:"Persetujuan profil contoh lokal"});if(reviewed.error)throw reviewed.error;
    if(sample.email.startsWith("budi"))await cmd("profile.accepting",{accepting:false});
  }
  await client.auth.signOut({scope:"local"});
}
await reviewer.auth.signOut({scope:"local"});
console.log("Data contoh lokal siap: rina@example.test, budi@example.test, admin@example.test. Kata sandi contoh dijelaskan dalam README; tidak ada layanan produksi yang diubah.");
