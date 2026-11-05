import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { siteUrl } from "@/lib/config";
import { mutationOriginAllowed } from "@/lib/security";
import { logEvent,newErrorId } from "@/lib/log";

export class HttpError extends Error { constructor(message:string, public status=400, public retryAfter?:number) { super(message); } }
export function json(data:unknown,status=200,headers:Record<string,string>={}) { return NextResponse.json(data,{status,headers:{"Cache-Control":"private, no-store",...headers}}); }
export function sameOrigin(request:Request) { if(!mutationOriginAllowed(request.headers.get("origin"),siteUrl())) throw new HttpError("Permintaan tidak berasal dari aplikasi ini.",403); }
export async function requestBody(request:Request):Promise<Record<string,unknown>> {
  const text=await request.text();
  if(Buffer.byteLength(text,"utf8")>65536) throw new HttpError("Isian terlalu panjang.",413);
  try { const data=JSON.parse(text); if(!data || typeof data!=="object" || Array.isArray(data)) throw new Error(); return data; }
  catch { throw new HttpError("Permintaan tidak sah."); }
}
export function databaseError(error:{code?:string;message:string}): never {
  logEvent("warn","db.error",{code:error.code,message:error.message});
  if(error.code==="P0001") throw new HttpError(error.message);
  if(error.code==="42501") throw new HttpError("Akses berakhir atau tidak diizinkan. Silakan masuk kembali.",403);
  if(error.code==="23P01") throw new HttpError("Jadwal bertabrakan. Pilih waktu lain.");
  throw new HttpError("Data belum tersimpan. Periksa isian atau coba kembali.");
}
export function errorResponse(error:unknown) {
  if(error instanceof HttpError && error.status<500) {
    logEvent(error.status===401||error.status===403||error.status===429?"warn":"info","http.client_error",{status:error.status,message:error.message});
    return json({error:error.message},error.status,error.retryAfter?{"Retry-After":String(error.retryAfter)}:{});
  }
  if(error instanceof ZodError) {
    logEvent("info","http.invalid_input",{fields:error.issues.map(issue=>issue.path.join("."))});
    return json({error:"Periksa kembali isian formulir. Gunakan nominal rupiah bulat dan lengkapi kolom yang diperlukan."},400);
  }
  // Kesalahan server: dicatat lengkap bersama kode acak yang juga ditampilkan kepada pengguna untuk dilaporkan.
  const errorId=newErrorId();
  const status=error instanceof HttpError?error.status:500;
  logEvent("error","http.server_error",{errorId,status,error});
  const message=error instanceof HttpError?error.message:"Permintaan belum berhasil. Silakan coba kembali.";
  return json({error:`${message} (Kode: ${errorId})`},status);
}
