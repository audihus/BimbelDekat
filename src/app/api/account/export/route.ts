import { z } from "zod";
import { NextResponse } from "next/server";
import { getAccount } from "@/lib/session";
import { serverSupabase } from "@/lib/supabase/server";
import { requirePassword } from "@/lib/account-guard";
import { enforce } from "@/lib/rate-limit";
import { logEvent } from "@/lib/log";
import { HttpError,sameOrigin,requestBody,errorResponse,databaseError } from "@/lib/http";

// Boleh dipakai saat akun menunggu penghapusan: mengunduh data adalah salah satu dari dua hal yang tetap diizinkan.
export async function POST(request:Request) {
  try {
    sameOrigin(request);
    const {password}=z.object({password:z.string().min(1,"Masukkan kata sandi Anda.").max(256)}).parse(await requestBody(request));
    const account=await getAccount();
    if(!account) throw new HttpError("Silakan masuk kembali.",401);
    await enforce("export.account",account.id);
    await requirePassword(account,password,"export");
    const {data,error}=await (await serverSupabase()).rpc("export_workspace");
    if(error) databaseError(error);
    logEvent("info","account.exported",{userId:account.id});
    const day=new Date().toISOString().slice(0,10);
    return new NextResponse(JSON.stringify(data,null,2),{status:200,headers:{
      "Content-Type":"application/json; charset=utf-8",
      "Content-Disposition":`attachment; filename="les-privat-ekspor-${day}.json"`,
      "Cache-Control":"private, no-store"
    }});
  } catch(error) { return errorResponse(error); }
}
