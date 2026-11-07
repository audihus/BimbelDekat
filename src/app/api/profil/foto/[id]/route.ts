import { serverSupabase } from "@/lib/supabase/server";
import { isPhotoId,jpegResponse,photoNotFound } from "@/lib/photo";
import { errorResponse } from "@/lib/http";

// Foto yang belum tayang: hanya pemilik (pratinjau draf) dan pengelola (peninjauan). Tidak pernah di-cache bersama.
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  try {
    const {id}=await params;
    if(!isPhotoId(id))return photoNotFound();
    const {data,error}=await (await serverSupabase()).rpc("private_profile_photo",{p_id:id});
    if(error||!data)return photoNotFound();
    return jpegResponse(data as string,"private, no-store");
  } catch(error) { return errorResponse(error); }
}
