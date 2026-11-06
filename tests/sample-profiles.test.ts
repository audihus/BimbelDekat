import { describe,expect,it } from "vitest";
import { sampleProfiles } from "@/lib/sample-profiles";
import { adChecklist } from "@/lib/ad-checklist";
import { profileRegionProblem } from "@/lib/wilayah";
import { profileSchema } from "@/lib/domain/commands";

describe("contoh profil guru",()=>{
  it("ada tiga contoh yang berbeda (jenjang, cara mengajar, dan wilayah)",()=>{
    expect(sampleProfiles).toHaveLength(3);
    expect(new Set(sampleProfiles.map(s=>s.document.name)).size).toBe(3);
    expect(new Set(sampleProfiles.map(s=>s.document.regency)).size).toBe(3);
    const modes=new Set(sampleProfiles.flatMap(s=>s.document.offers.map(o=>o.mode)));
    expect(modes).toEqual(new Set(["online","offline"]));
  });
  it("memenuhi standar kelengkapan iklan kecuali nomor WhatsApp, yang sengaja kosong (bukan guru sungguhan)",()=>{
    for(const s of sampleProfiles){
      expect(s.document.phone,s.document.name).toBe("");
      const missing=adChecklist(s.document).items.filter(i=>!i.done).map(i=>i.key);
      expect(missing,s.document.name).toEqual(["phone"]);
    }
  });
  it("memakai nama wilayah yang benar-benar ada dan lolos skema profil",async()=>{
    for(const s of sampleProfiles){
      expect(await profileRegionProblem(s.document),s.document.name).toBeNull();
      expect(profileSchema.safeParse({...s.document,phone:"081234567890"}).success,s.document.name).toBe(true);
    }
  });
  it("tiap contoh punya alasan singkat mengapa iklannya menarik",()=>{
    for(const s of sampleProfiles){
      expect(s.why.length).toBeGreaterThanOrEqual(2);
      for(const line of s.why)expect(line.length).toBeLessThanOrEqual(90);
    }
  });
});
