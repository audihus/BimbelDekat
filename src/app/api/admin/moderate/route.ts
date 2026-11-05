import { z } from "zod";
import { getAccount } from "@/lib/session";
import { serverSupabase } from "@/lib/supabase/server";
import { logEvent } from "@/lib/log";
import { HttpError,sameOrigin,requestBody,json,errorResponse,databaseError } from "@/lib/http";

const input=z.object({id:z.uuid(),decision:z.enum(["approve","reject","hide","unhide"]),reason:z.string().trim().max(1000).default("")});

// Hak admin diperiksa dua kali: di sini (pesan yang jelas) dan di moderate_profile (private.is_admin), yang menjadi pagar sebenarnya.
export async function POST(request:Request) {
  try {
    sameOrigin(request);
    const body=input.parse(await requestBody(request));
    const account=await getAccount();
    if(!account) throw new HttpError("Silakan masuk kembali.",401);
    if(account.role!=="admin"||account.status!=="active") throw new HttpError("Hanya pengelola yang dapat memeriksa profil.",403);
    const {error}=await (await serverSupabase()).rpc("moderate_profile",{p_id:body.id,p_decision:body.decision,p_reason:body.reason});
    if(error) databaseError(error);
    logEvent("info","admin.moderated",{adminId:account.id,profileId:body.id,decision:body.decision});
    return json({message:"Keputusan tersimpan."});
  } catch(error) { return errorResponse(error); }
}
