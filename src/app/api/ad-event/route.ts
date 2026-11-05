import { z } from "zod";
import { adminSupabase } from "@/lib/supabase/server";
import { sameOrigin,requestBody,json,errorResponse } from "@/lib/http";
import { clientIp,enforce } from "@/lib/rate-limit";
import { logEvent } from "@/lib/log";

const input=z.object({profile:z.uuid(),kind:z.enum(["view","wa_click"])});

// Penghitung tayangan dan klik WhatsApp. Selalu menjawab sama (juga untuk profil yang tidak tayang atau ID ngawur)
// agar tidak bisa dipakai menebak profil mana yang ada; kegagalan pencatatan tidak boleh mengganggu pengunjung.
export async function POST(request:Request){
  try {
    sameOrigin(request);
    await enforce("ad.ip",clientIp(request),{failOpen:true});
    const {profile,kind}=input.parse(await requestBody(request));
    const {error}=await adminSupabase().rpc("record_ad_event",{p_profile:profile,p_kind:kind});
    if(error)logEvent("warn","ad_event.failed",{kind,error:error.message});
    return json({ok:true});
  } catch(error) { return errorResponse(error); }
}
