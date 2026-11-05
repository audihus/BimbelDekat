import { createCipheriv,createDecipheriv,randomBytes } from "node:crypto";
export interface ProviderTokens{access_token:string;refresh_token:string}
function encryptionKey(key:string){if(!/^[a-f0-9]{64}$/i.test(key))throw new Error("Kunci enkripsi sesi belum dikonfigurasi.");return Buffer.from(key,"hex");}
export function sealTokens(tokens:ProviderTokens,key:string):string{
  const iv=randomBytes(12);const cipher=createCipheriv("aes-256-gcm",encryptionKey(key),iv);
  const content=Buffer.concat([cipher.update(JSON.stringify(tokens),"utf8"),cipher.final()]);
  return ["v1",iv.toString("base64url"),cipher.getAuthTag().toString("base64url"),content.toString("base64url")].join(".");
}
export function openTokens(sealed:string,key:string):ProviderTokens{
  const [version,iv,tag,content,...extra]=sealed.split(".");
  if(version!=="v1"||!iv||!tag||!content||extra.length)throw new Error("Sesi tidak sah.");
  const decipher=createDecipheriv("aes-256-gcm",encryptionKey(key),Buffer.from(iv,"base64url"));
  decipher.setAuthTag(Buffer.from(tag,"base64url"));
  const data=JSON.parse(Buffer.concat([decipher.update(Buffer.from(content,"base64url")),decipher.final()]).toString("utf8"));
  if(typeof data.access_token!=="string"||typeof data.refresh_token!=="string")throw new Error("Sesi tidak sah.");
  return data;
}
