import { getAccount } from "@/lib/session";
import { serverSupabase } from "@/lib/supabase/server";
import { HttpError,sameOrigin,json,errorResponse,databaseError } from "@/lib/http";
import { enforce } from "@/lib/rate-limit";
import { sanitizeJpeg,JpegError } from "@/lib/jpeg";

const RAW_LIMIT=1_000_000;

// Unggah foto profil. Menerima JPEG mentah (browser sudah memperkecil dan memotongnya jadi persegi), tetapi server tidak percaya
// pada itu: berkas diperiksa ulang dan dibersihkan (EXIF dibuang) sebelum disimpan. Foto baru belum tayang sampai profil disetujui.
export async function POST(request:Request){
  try {
    sameOrigin(request);
    const account=await getAccount();
    if(!account)throw new HttpError("Silakan masuk kembali.",401);
    if(account.status!=="active"||account.role!=="teacher")throw new HttpError("Akun tidak dapat mengubah foto profil.",403);
    if(!(request.headers.get("content-type")??"").startsWith("image/jpeg"))throw new HttpError("Foto harus berformat JPEG.",415);
    if(Number(request.headers.get("content-length")??0)>RAW_LIMIT)throw new HttpError("Foto terlalu besar. Pilih foto lain.",413);
    await enforce("photo.account",account.id);
    const raw=new Uint8Array(await request.arrayBuffer());
    let clean;
    try { clean=sanitizeJpeg(raw); } catch(error) { if(error instanceof JpegError)throw new HttpError(error.message); throw error; }
    const {data,error}=await (await serverSupabase()).rpc("save_profile_photo",{p_data:Buffer.from(clean.data).toString("base64")});
    if(error)databaseError(error);
    return json({id:data,message:"Foto terunggah. Simpan atau kirim profil agar foto ikut tersimpan."});
  } catch(error) { return errorResponse(error); }
}
