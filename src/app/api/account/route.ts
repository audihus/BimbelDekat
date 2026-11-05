import { z } from "zod";
import { getAccount } from "@/lib/session";
import { serverSupabase,forgetSession } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/config";
import { requirePassword } from "@/lib/account-guard";
import { enforce } from "@/lib/rate-limit";
import { logEvent } from "@/lib/log";
import { HttpError,sameOrigin,requestBody,json,errorResponse,databaseError } from "@/lib/http";

const password=z.string().min(1,"Masukkan kata sandi Anda.").max(256);
const input=z.discriminatedUnion("action",[
  z.object({action:z.literal("email.change"),password,email:z.email().max(254)}),
  z.object({action:z.literal("password.change"),password,newPassword:z.string().max(256)}),
  z.object({action:z.literal("deletion.request"),password}),
  z.object({action:z.literal("deletion.cancel")})
]);

export async function POST(request:Request) {
  try {
    sameOrigin(request);
    const body=input.parse(await requestBody(request));
    const account=await getAccount();
    if(!account) throw new HttpError("Silakan masuk kembali.",401);
    // Selama menunggu penghapusan hanya boleh mengunduh data atau membatalkan (PRD Q31).
    if(account.status==="deletion_pending" && body.action!=="deletion.cancel") throw new HttpError("Akun sedang menunggu penghapusan. Batalkan permintaan untuk memakai fitur ini.",403);
    const supabase=await serverSupabase();

    if(body.action==="deletion.cancel") {
      const {error}=await supabase.rpc("cancel_account_deletion");
      if(error) databaseError(error);
      logEvent("info","account.deletion_cancelled",{userId:account.id});
      return json({message:"Penghapusan dibatalkan. Profil publik masih tersembunyi dan tautan wali lama tetap dicabut; aktifkan profil dan buat tautan baru bila diperlukan."});
    }

    await requirePassword(account,body.password,body.action);

    if(body.action==="deletion.request") {
      const {error}=await supabase.rpc("request_account_deletion");
      if(error) databaseError(error);
      logEvent("info","account.deletion_requested",{userId:account.id});
      return json({message:"Permintaan penghapusan dicatat. Profil disembunyikan dan tautan wali dicabut. Anda punya 7 hari untuk membatalkan.",refresh:true});
    }

    if(body.action==="email.change") {
      if(body.email.toLowerCase()===account.email.toLowerCase()) throw new HttpError("Email baru sama dengan email saat ini.");
      await enforce("recover.email",body.email);
      const {error}=await supabase.auth.updateUser({email:body.email},{emailRedirectTo:`${siteUrl()}/masuk?pesan=email`});
      if(error) throw new HttpError("Email belum dapat diganti. Periksa alamatnya atau coba lagi nanti.");
      await supabase.rpc("record_account_event",{p_action:"account.email_change_requested"});
      logEvent("info","account.email_change_requested",{userId:account.id,email:body.email});
      return json({message:"Kami mengirim tautan konfirmasi ke email lama dan email baru. Email akun baru berubah setelah keduanya dikonfirmasi; sebelum itu email lama tetap berlaku."});
    }

    if(body.newPassword.length<15) throw new HttpError("Gunakan kata sandi baru minimal 15 karakter.");
    if(body.newPassword===body.password) throw new HttpError("Kata sandi baru harus berbeda dari yang lama.");
    const {error}=await supabase.auth.updateUser({password:body.newPassword});
    if(error) throw new HttpError(error.code==="same_password"?"Kata sandi baru harus berbeda dari yang lama.":"Kata sandi belum berubah. Coba lagi.");
    await supabase.rpc("record_account_event",{p_action:"account.password_changed"});
    // Sama seperti pemulihan: semua login dicabut, termasuk yang sedang dipakai.
    await supabase.auth.signOut({scope:"global"});
    await forgetSession(true);
    logEvent("info","account.password_changed",{userId:account.id});
    return json({message:"Kata sandi diganti. Silakan masuk kembali.",redirect:"/masuk?pesan=sandi"});
  } catch(error) { return errorResponse(error); }
}
