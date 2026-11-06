import { adminSupabase } from "@/lib/supabase/server";
import { cronAuthorized } from "@/lib/cron-auth";
import { HttpError,json,errorResponse,databaseError } from "@/lib/http";
import { logEvent } from "@/lib/log";

// Dipanggil harian oleh Vercel Cron (lihat vercel.json): menghapus akun guru yang sudah lewat masa batal 7 hari.
// Tanpa CRON_SECRET yang benar, rute ini menjawab 401 dan tidak menyentuh basis data.
export async function GET(request:Request){
  try {
    if(!cronAuthorized(request.headers.get("authorization"),process.env.CRON_SECRET)) throw new HttpError("Tidak diizinkan.",401);
    const {data,error}=await adminSupabase().rpc("process_account_deletions");
    if(error) databaseError(error);
    logEvent("info","cron.process_deletions",{removed:data});
    return json({removed:data});
  } catch(error) { return errorResponse(error); }
}
