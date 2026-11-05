import { z } from "zod";
import { getAccount } from "@/lib/session";
import { serverSupabase } from "@/lib/supabase/server";
import { parseCommand } from "@/lib/domain/commands";
import { profileRegionProblem } from "@/lib/wilayah";
import type { ProfileDocument } from "@/lib/domain/types";
import { guardianToken, tokenHash, tokenLink } from "@/lib/security";
import { siteUrl } from "@/lib/config";
import { HttpError,sameOrigin,requestBody,json,errorResponse,databaseError } from "@/lib/http";

export async function POST(request:Request) {
  try {
    sameOrigin(request);
    const body=z.object({action:z.string().max(100),payload:z.unknown(),requestId:z.uuid()}).parse(await requestBody(request));
    const account=await getAccount();
    if(!account) throw new HttpError("Silakan masuk kembali.",401);
    if(account.status!=="active" || account.role!=="teacher") throw new HttpError("Akun tidak dapat mengubah catatan les.",403);
    const payload=parseCommand(body.action,body.payload);
    // Wilayah hanya diperiksa saat MENULIS profil; pembacaan direktori tidak diperketat agar profil lama tidak hilang.
    if(body.action==="profile.save"||body.action==="profile.submit") {
      const problem=await profileRegionProblem((payload as {document:ProfileDocument}).document);
      if(problem) throw new HttpError(problem);
    }
    let shareUrl:string|undefined;
    if(body.action==="guardian.create") {
      const token=guardianToken(process.env.GUARDIAN_TOKEN_SECRET ?? "",account.workspace_id,body.requestId);
      payload.token_hash=tokenHash(token);
      shareUrl=tokenLink(siteUrl(),token);
    }
    const supabase=await serverSupabase();
    const {data,error}=await supabase.rpc("app_command",{p_action:body.action,p_payload:payload,p_request:body.requestId});
    if(error) databaseError(error);
    return json({result:data,...(shareUrl?{shareUrl}:{}),message:"Perubahan tersimpan."});
  } catch(error) { return errorResponse(error); }
}
