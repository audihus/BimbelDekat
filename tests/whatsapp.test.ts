import { describe,expect,it } from "vitest";
import { whatsappNumber,whatsappLink,contactMessage } from "@/lib/whatsapp";

describe("whatsappNumber",()=>{
  it("mengubah awalan 0 menjadi 62 dan membuang tanda baca",()=>{
    expect(whatsappNumber("0812-3456-7890")).toBe("6281234567890");
    expect(whatsappNumber("+62 812 3456 7890")).toBe("6281234567890");
    expect(whatsappNumber("6281234567890")).toBe("6281234567890");
  });
  it("mengembalikan teks kosong bila nomor terlalu pendek untuk dihubungi",()=>{
    expect(whatsappNumber("")).toBe("");
    expect(whatsappNumber("0812")).toBe("");
    expect(whatsappNumber("abc")).toBe("");
  });
});

describe("whatsappLink",()=>{
  it("membuat tautan wa.me dengan pesan yang di-encode",()=>{
    expect(whatsappLink("081234567890","Halo & salam")).toBe("https://wa.me/6281234567890?text=Halo%20%26%20salam");
  });
  it("mengembalikan null bila nomor belum bisa dipakai",()=>{
    expect(whatsappLink("","Halo")).toBeNull();
  });
});

describe("contactMessage",()=>{
  it("menyebut nama guru dan pelajaran pertama bila ada",()=>{
    expect(contactMessage("Rina","Matematika")).toBe("Halo Rina, saya melihat iklan bimbel Matematika Anda di BimbelDekat. Apakah masih ada tempat untuk murid baru?");
  });
  it("tetap wajar tanpa pelajaran",()=>{
    expect(contactMessage("Rina")).toBe("Halo Rina, saya melihat iklan bimbel Anda di BimbelDekat. Apakah masih ada tempat untuk murid baru?");
  });
});
