import { afterEach,describe,expect,it,vi } from "vitest";
import { siteUrl } from "@/lib/config";

afterEach(()=>vi.unstubAllEnvs());

describe("siteUrl",()=>{
  it("memakai NEXT_PUBLIC_SITE_URL bila diisi",()=>{
    vi.stubEnv("NEXT_PUBLIC_SITE_URL","https://bimbeldekat.id");
    expect(siteUrl()).toBe("https://bimbeldekat.id");
  });
  it("memakai alamat lokal di pengembangan bila kosong",()=>{
    vi.stubEnv("NEXT_PUBLIC_SITE_URL","");vi.stubEnv("NODE_ENV","development");
    expect(siteUrl()).toBe("http://127.0.0.1:3000");
  });
  it("menolak berjalan di produksi tanpa alamat, agar tautan dan email tidak mengarah ke localhost",()=>{
    vi.stubEnv("NEXT_PUBLIC_SITE_URL","");vi.stubEnv("NODE_ENV","production");
    expect(()=>siteUrl()).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });
});
