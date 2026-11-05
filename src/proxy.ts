import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request:NextRequest) {
  const response=NextResponse.next({request});
  response.headers.set("Cache-Control","private, no-store");
  return response;
}
export const config={matcher:["/dashboard/:path*","/murid/:path*","/jadwal/:path*","/profil/:path*","/akun/:path*","/admin/:path*","/api/:path*","/auth/:path*"]};
