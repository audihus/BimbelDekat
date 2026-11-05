import { hasSupabase } from "./config";
import { isolatedSupabase } from "./supabase/server";
import { profileSchema } from "./domain/commands";
import type { PublicTeacher } from "./domain/types";

export async function publicTeachers():Promise<{teachers:PublicTeacher[];unavailable:boolean}>{
  if(!hasSupabase())return {teachers:[],unavailable:true};
  const {data,error}=await isolatedSupabase().rpc("public_teachers");
  if(error)return {teachers:[],unavailable:true};
  const teachers=(data as PublicTeacher[]).filter(t=>profileSchema.safeParse(t.document).success).sort((a,b)=>a.document.name.localeCompare(b.document.name,"id"));
  return {teachers,unavailable:false};
}
