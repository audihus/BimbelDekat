import { createHash, createHmac } from "node:crypto";

export function safeNext(value: string | null): string {
  return value && ["/dashboard", "/akun/reset", "/akun", "/profil", "/admin", "/murid"].includes(value) ? value : "/dashboard";
}

export function mutationOriginAllowed(origin: string | null, siteUrl: string): boolean {
  if (!origin) return false;
  try { return new URL(origin).origin === new URL(siteUrl).origin && origin === new URL(origin).origin; }
  catch { return false; }
}

export function guardianToken(secret: string, workspace: string, request: string): string {
  if (Buffer.byteLength(secret, "utf8") < 32) throw new Error("Rahasia tautan wali belum dikonfigurasi.");
  return createHmac("sha256", secret).update(JSON.stringify(["guardian-v1",workspace,request])).digest("base64url");
}

export function tokenHash(token: string): string { return createHash("sha256").update(token).digest("hex"); }
export function tokenLink(site:string,token:string):string {const url=new URL("/wali",site);url.hash=token;return url.toString();}
