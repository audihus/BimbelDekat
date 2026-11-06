import { describe,expect,it } from "vitest";
import { cronAuthorized } from "@/lib/cron-auth";

const secret="rahasia-cron-yang-cukup-panjang-123456";

describe("cronAuthorized",()=>{
  it("menerima header Bearer yang sama persis dengan rahasia",()=>{
    expect(cronAuthorized(`Bearer ${secret}`,secret)).toBe(true);
  });
  it("menolak header kosong, salah, atau tanpa kata Bearer",()=>{
    expect(cronAuthorized(null,secret)).toBe(false);
    expect(cronAuthorized("",secret)).toBe(false);
    expect(cronAuthorized("Bearer salah",secret)).toBe(false);
    expect(cronAuthorized(secret,secret)).toBe(false);
  });
  it("menolak semuanya bila rahasia belum diatur atau terlalu pendek (tidak pernah terbuka karena salah konfigurasi)",()=>{
    expect(cronAuthorized("Bearer ",undefined)).toBe(false);
    expect(cronAuthorized("Bearer ","")).toBe(false);
    expect(cronAuthorized("Bearer pendek","pendek")).toBe(false);
  });
});
