import { z } from "zod";
import { serverSupabase,authFlowSupabase,rememberSession,forgetSession } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/config";
import { HttpError, sameOrigin, requestBody, json, errorResponse } from "@/lib/http";
import { clientIp, enforce, recordFailure } from "@/lib/rate-limit";
import { logEvent } from "@/lib/log";

const input=z.object({mode:z.enum(["login","signup","forgot","resend","logout","logout-all","reset"]),email:z.email().optional(),password:z.string().max(256).optional(),name:z.string().trim().min(2).max(100).optional()});

export async function POST(request:Request) {
  try {
    sameOrigin(request);
    const body=input.parse(await requestBody(request));
    const ip=clientIp(request);
    // Daftar, lupa kata sandi, kirim ulang, dan reset memicu email atau mengubah kredensial: setiap panggilan dihitung.
    if(body.mode==="signup"||body.mode==="forgot"||body.mode==="resend"||body.mode==="reset") {
      await enforce("recover.ip",ip);
      if(body.email) await enforce("recover.email",body.email);
    }
    const supabase=body.mode==="logout"||body.mode==="logout-all"||body.mode==="reset"?await serverSupabase():await authFlowSupabase();
    if(body.mode==="logout" || body.mode==="logout-all") {
      await supabase.auth.signOut({scope:body.mode==="logout-all"?"global":"local"});
      await forgetSession(body.mode==="logout-all");
      return json({redirect:"/masuk"});
    }
    if(body.mode==="reset") {
      if(!body.password || body.password.length<15) throw new HttpError("Gunakan kata sandi minimal 15 karakter.");
      const {data:{user}}=await supabase.auth.getUser();
      if(!user) throw new HttpError("Tautan pemulihan sudah tidak berlaku.",401);
      // A recovery session is established by Supabase's verified callback.
      const {data:claims}=await supabase.auth.getClaims();
      const methods=claims?.claims?.amr as {method:string}[] | undefined;
      if(!methods?.some(method=>method.method==="recovery")) throw new HttpError("Gunakan tautan lupa kata sandi yang masih berlaku.",403);
      const {error}=await supabase.auth.updateUser({password:body.password});
      if(error) throw new HttpError("Kata sandi belum berubah. Gunakan tautan pemulihan yang masih berlaku.");
      await supabase.auth.signOut({scope:"global"});
      await forgetSession(true);
      return json({redirect:"/masuk?pesan=pulih"});
    }
    if(!body.email) throw new HttpError("Masukkan alamat email.");
    if(body.mode==="forgot") {
      await supabase.auth.resetPasswordForEmail(body.email,{redirectTo:`${siteUrl()}/auth/callback?next=/akun/reset`});
      return json({message:"Jika email tersebut terdaftar, tautan pemulihan akan dikirim. Periksa juga folder spam."});
    }
    if(body.mode==="resend") {
      await supabase.auth.resend({type:"signup",email:body.email,options:{emailRedirectTo:`${siteUrl()}/auth/callback`}});
      return json({message:"Jika akun memerlukan verifikasi, email konfirmasi akan dikirim."});
    }
    if(!body.password) throw new HttpError("Masukkan kata sandi.");
    if(body.mode==="signup") {
      if(body.password.length<15 || !body.name) throw new HttpError("Lengkapi nama dan gunakan kata sandi minimal 15 karakter.");
      const {error}=await supabase.auth.signUp({email:body.email,password:body.password,options:{data:{display_name:body.name},emailRedirectTo:`${siteUrl()}/auth/callback`}});
      if(error) throw new HttpError("Pendaftaran belum berhasil. Periksa isian atau coba lagi nanti.");
      return json({message:"Periksa email untuk mengonfirmasi akun sebelum mulai mencatat murid."});
    }
    // Login: yang dihitung hanya percobaan GAGAL, jadi login berhasil berulang tidak mengunci guru.
    const account=`${body.email}|${ip}`;
    await enforce("login.ip",ip,{record:false});
    await enforce("login.account",account,{record:false});
    const {data,error}=await supabase.auth.signInWithPassword({email:body.email,password:body.password});
    if(error) {
      await Promise.all([recordFailure("login.ip",ip),recordFailure("login.account",account)]);
      logEvent("warn","auth.login_failed",{email:body.email,reason:error.code??error.name});
      throw new HttpError("Email atau kata sandi belum sesuai, atau email belum diverifikasi.",401);
    }
    if(!data.session)throw new HttpError("Sesi belum dapat dimulai.",401);
    await rememberSession(data.session);
    logEvent("info","auth.login",{userId:data.user.id});
    return json({redirect:"/dashboard"});
  } catch(error) { return errorResponse(error); }
}
