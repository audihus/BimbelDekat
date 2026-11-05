import { describe,expect,it } from "vitest";
import { adChecklist,adStatus } from "@/lib/ad-checklist";
import type { ProfileDocument,TeacherProfile } from "@/lib/domain/types";

const about="Saya mengajar matematika SD dan SMP dengan sabar, memakai contoh sehari-hari, dan selalu memberi laporan kemajuan kepada orang tua setiap bulan.";
const full:ProfileDocument={name:"Rina",about,phone:"081234567890",province:"Jawa Barat",regency:"Kota Depok",areas:[{province:"Jawa Barat",regency:"Kota Depok",district:"Beji"}],offers:[{subject:"Matematika",level:"SD",mode:"offline",duration:60,price:"75000"}]};
const profile=(over:Partial<TeacherProfile>={}):TeacherProfile=>({id:"p1",draft:full,published:null,review_status:"draft",visible:false,admin_hidden:false,accepting:true,review_reason:"",...over});

describe("adChecklist",()=>{
  it("profil kosong: 0 persen dan semua butir belum selesai",()=>{
    const c=adChecklist(null);
    expect(c.percent).toBe(0);expect(c.complete).toBe(false);
    expect(c.items.every(i=>!i.done)).toBe(true);
  });
  it("profil lengkap: 100 persen",()=>{
    const c=adChecklist(full);
    expect(c.percent).toBe(100);expect(c.complete).toBe(true);
  });
  it("deskripsi pendek tidak dihitung; butir menjelaskan caranya",()=>{
    const c=adChecklist({...full,about:"Guru matematika."});
    expect(c.items.find(i=>i.key==="about")).toMatchObject({done:false});
    expect(c.items.find(i=>i.key==="about")!.hint).toMatch(/100/);
    expect(c.complete).toBe(false);
  });
  it("daerah layanan hanya diminta bila ada penawaran tatap muka",()=>{
    const online={...full,areas:[],offers:[{...full.offers[0],mode:"online" as const}]};
    expect(adChecklist(online).items.some(i=>i.key==="areas")).toBe(false);
    expect(adChecklist(online).complete).toBe(true);
    const offlineNoArea={...full,areas:[]};
    expect(adChecklist(offlineNoArea).items.find(i=>i.key==="areas")).toMatchObject({done:false});
  });
  it("nomor WhatsApp harus berupa angka yang masuk akal",()=>{
    expect(adChecklist({...full,phone:"abc"}).items.find(i=>i.key==="phone")!.done).toBe(false);
    expect(adChecklist({...full,phone:"+62 812-3456-7890"}).items.find(i=>i.key==="phone")!.done).toBe(true);
  });
});

describe("adStatus",()=>{
  it("belum ada profil",()=>expect(adStatus(null)).toMatchObject({key:"none",tone:"amber"}));
  it("draf belum diajukan",()=>expect(adStatus(profile())).toMatchObject({key:"draft"}));
  it("menunggu pemeriksaan",()=>expect(adStatus(profile({review_status:"pending"}))).toMatchObject({key:"pending"}));
  it("ditolak menyertakan alasan",()=>{
    const s=adStatus(profile({review_status:"rejected",review_reason:"Foto tidak jelas"}));
    expect(s.key).toBe("rejected");expect(s.detail).toContain("Foto tidak jelas");
  });
  it("tayang bila terbit dan terlihat",()=>{
    expect(adStatus(profile({published:full,review_status:"approved",visible:true}))).toMatchObject({key:"live",tone:"green"});
  });
  it("tayang dengan versi lama saat perubahan menunggu atau ditolak",()=>{
    expect(adStatus(profile({published:full,visible:true,review_status:"pending"})).detail).toMatch(/versi sebelumnya|perubahan/i);
    const r=adStatus(profile({published:full,visible:true,review_status:"rejected",review_reason:"Tarif tidak wajar"}));
    expect(r.key).toBe("live");expect(r.detail).toContain("Tarif tidak wajar");
  });
  it("dijeda guru dan disembunyikan pengelola dibedakan",()=>{
    expect(adStatus(profile({published:full,review_status:"approved",visible:false}))).toMatchObject({key:"paused"});
    const hidden=adStatus(profile({published:full,review_status:"approved",visible:false,admin_hidden:true,review_reason:"Laporan orang tua"}));
    expect(hidden).toMatchObject({key:"hidden",tone:"red"});expect(hidden.detail).toContain("Laporan orang tua");
  });
});
