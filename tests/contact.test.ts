import { describe,expect,it } from "vitest";
import { contactChannels,reportMailto } from "@/lib/contact";

describe("contactChannels",()=>{
  it("kosong bila tidak ada yang diatur",()=>{
    expect(contactChannels({})).toEqual({email:null,whatsapp:null});
  });
  it("mengambil email dan membuat tautan WhatsApp dari nomor berawalan 0",()=>{
    expect(contactChannels({NEXT_PUBLIC_CONTACT_EMAIL:" halo@bimbeldekat.id ",NEXT_PUBLIC_CONTACT_WHATSAPP:"0812-3456-7890"}))
      .toEqual({email:"halo@bimbeldekat.id",whatsapp:{number:"6281234567890",href:"https://wa.me/6281234567890"}});
  });
  it("mengabaikan email yang bentuknya tidak wajar dan nomor yang terlalu pendek",()=>{
    expect(contactChannels({NEXT_PUBLIC_CONTACT_EMAIL:"bukan-email",NEXT_PUBLIC_CONTACT_WHATSAPP:"0812"})).toEqual({email:null,whatsapp:null});
  });
});

describe("reportMailto",()=>{
  it("membuat tautan email dengan judul yang memuat ID iklan",()=>{
    expect(reportMailto("halo@bimbeldekat.id","abc-123")).toBe("mailto:halo@bimbeldekat.id?subject=Laporan%20profil%20guru%20abc-123");
  });
});
