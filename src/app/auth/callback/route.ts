import { NextResponse } from "next/server";
import { authFlowSupabase,rememberSession } from "@/lib/supabase/server";
import { safeNext } from "@/lib/security";
import { siteUrl } from "@/lib/config";

export async function GET(request:Request) {
  const url=new URL(request.url);
  const code=url.searchParams.get("code");
  if(code) {
    const supabase=await authFlowSupabase();
    const {data,error}=await supabase.auth.exchangeCodeForSession(code);
    if(!error&&data.session){await rememberSession(data.session);return NextResponse.redirect(new URL(safeNext(url.searchParams.get("next")),siteUrl()));}
  }
  return NextResponse.redirect(new URL("/masuk?pesan=tautan",siteUrl()));
}
