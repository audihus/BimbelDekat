import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cache } from "react";
import { randomBytes } from "node:crypto";
import type { Session } from "@supabase/supabase-js";
import { supabaseConfig } from "@/lib/config";
import { siteUrl } from "@/lib/config";
import { tokenHash } from "@/lib/security";
import { openTokens,sealTokens } from "@/lib/session-crypto";
import { isLoopbackUrl,resilientFetch } from "./resilient-fetch";

// Hanya Supabase lokal yang memakai percobaan ulang; produksi memakai fetch bawaan.
const transport=(url:string)=>isLoopbackUrl(url)?{global:{fetch:resilientFetch()}}:{};

export async function authFlowSupabase() {
  const jar = await cookies();
  const { url, key } = supabaseConfig();
  return createServerClient(url,key,{
    ...transport(url),
    cookies: {
      getAll: () => jar.getAll(),
      setAll(values) {
        // Only the PKCE verifier enters the browser; provider session JWTs never do.
        values.filter(item=>item.name.includes("code-verifier")).forEach(({name,value,options})=>jar.set(name,value,{...options,httpOnly:true,sameSite:"lax",secure:new URL(siteUrl()).protocol==="https:",maxAge:options.maxAge===0?0:600}));
      }
    }
  });
}

const sessionCookie="les_session";
export const serverSupabase=cache(async()=>{
  const client=isolatedSupabase();const jar=await cookies();const cookie=jar.get(sessionCookie)?.value;
  if(!cookie||!/^[a-f0-9]{64}$/i.test(cookie))return client;
  const hash=tokenHash(cookie);const admin=adminSupabase();
  const stored=await admin.rpc("get_server_session",{p_hash:hash});
  if(stored.error||!stored.data)return client;
  try{
    const tokens=openTokens(stored.data.sealed_tokens,process.env.SESSION_ENCRYPTION_KEY??"");
    const {data,error}=await client.auth.setSession(tokens);
    if(error||!data.session)return isolatedSupabase();
    if(data.session.access_token!==tokens.access_token||data.session.refresh_token!==tokens.refresh_token){
      await admin.rpc("rotate_server_session",{p_hash:hash,p_version:stored.data.version,p_sealed:sealTokens({access_token:data.session.access_token,refresh_token:data.session.refresh_token},process.env.SESSION_ENCRYPTION_KEY??"")});
    }
    return client;
  }catch{return isolatedSupabase();}
});

export async function rememberSession(session:Session){
  const claims=JSON.parse(Buffer.from(session.access_token.split(".")[1],"base64url").toString("utf8"));
  if(!/^[0-9a-f-]{36}$/i.test(claims.session_id??""))throw new Error("Sesi penyedia tidak sah.");
  const cookie=randomBytes(32).toString("hex");
  const stored=await adminSupabase().rpc("put_server_session",{p_hash:tokenHash(cookie),p_user:session.user.id,p_auth_session:claims.session_id,p_sealed:sealTokens({access_token:session.access_token,refresh_token:session.refresh_token},process.env.SESSION_ENCRYPTION_KEY??"")});
  if(stored.error||!stored.data)throw new Error("Sesi belum dapat disimpan.");
  (await cookies()).set(sessionCookie,cookie,{httpOnly:true,sameSite:"lax",secure:new URL(siteUrl()).protocol==="https:",path:"/",expires:new Date(stored.data.expires_at)});
}

export async function forgetSession(all=false){
  const jar=await cookies();const cookie=jar.get(sessionCookie)?.value;
  if(cookie){const result=await adminSupabase().rpc("clear_server_session",{p_hash:tokenHash(cookie),p_all:all});if(result.error)throw new Error("Sesi belum dapat dicabut.");}
  jar.delete(sessionCookie);
}

export function isolatedSupabase() {
  const {url,key}=supabaseConfig();
  return createClient(url,key,{...transport(url),auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
}

export function adminSupabase() {
  const {url}=supabaseConfig();
  const key=process.env.SUPABASE_SECRET_KEY;
  if(!key) throw new Error("Konfigurasi server Supabase belum tersedia.");
  return createClient(url,key,{...transport(url),auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
}
