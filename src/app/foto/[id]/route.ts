import { hasSupabase } from "@/lib/config";
import { isolatedSupabase } from "@/lib/supabase/server";
import { isPhotoId,jpegResponse,photoNotFound } from "@/lib/photo";

// Foto profil yang sudah tayang. ID acak dan tidak bisa diubah isinya (foto baru = ID baru), jadi aman di-cache sebentar.
// Batasnya satu jam supaya foto profil yang disembunyikan atau dihapus tidak bertahan lama di cache.
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  if(!isPhotoId(id)||!hasSupabase())return photoNotFound();
  const {data,error}=await isolatedSupabase().rpc("public_profile_photo",{p_id:id});
  if(error||!data)return photoNotFound();
  return jpegResponse(data as string,"public, max-age=3600");
}
