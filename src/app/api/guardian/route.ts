import { z } from "zod";
import { isolatedSupabase } from "@/lib/supabase/server";
import { sameOrigin,requestBody,json,errorResponse,HttpError } from "@/lib/http";
export async function POST(request:Request){try{sameOrigin(request);const {token}=z.object({token:z.string().regex(/^[A-Za-z0-9_-]{40,200}$/)}).parse(await requestBody(request));const {data,error}=await isolatedSupabase().rpc("guardian_summary",{p_token:token});if(error)throw new HttpError("Ringkasan belum dapat dimuat. Coba kembali sebentar.",503);if(!data)throw new HttpError("Tautan sudah tidak berlaku atau tidak ditemukan. Minta tautan baru kepada guru.",404);return json({summary:data});}catch(error){return errorResponse(error);}}
