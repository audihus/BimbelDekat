import { expect,it } from "vitest";
import { sealTokens,openTokens } from "@/lib/session-crypto";
const key="11".repeat(32);
const tokens={access_token:"test-provider-access-token",refresh_token:"test-provider-refresh-token"};
it("menyimpan token penyedia dalam bentuk terenkripsi yang dapat dipulihkan server",()=>{
  const sealed=sealTokens(tokens,key);
  expect(sealed).not.toContain(tokens.access_token);
  expect(sealed).not.toContain(tokens.refresh_token);
  expect(openTokens(sealed,key)).toEqual(tokens);
  expect(sealTokens(tokens,key)).not.toBe(sealed);
});
it("menolak kunci yang salah dan perubahan isi token terenkripsi",()=>{
  const sealed=sealTokens(tokens,key);
  expect(()=>openTokens(sealed,"22".repeat(32))).toThrow();
  expect(()=>openTokens("tampered"+sealed,key)).toThrow();
  expect(()=>sealTokens(tokens,"weak")).toThrow();
});
