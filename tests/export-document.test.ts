import { describe,expect,it } from "vitest";
import { renderExportHtml,type ExportData } from "../src/lib/export-document";

const base:ExportData={
  exported_at:"2026-11-05T03:00:00Z",
  account:{display_name:"Rina Guru",email:"rina@example.test",timezone:"Asia/Makassar",status:"active",created_at:"2026-10-01T00:00:00Z"},
  students:[{id:"s1",name:"Arka",level:"SD",guardian_phone:"081200000000",address:"Jl. Mawar 1",notes:"Suka matematika",source:"existing",archived:false,created_at:"2026-10-02T00:00:00Z"}],
  packages:[{id:"p1",student_id:"s1",name:"Matematika",quota:8,opening_used:2,agreed_price:"400000",remaining:5,received:"250000",due:"150000",overpaid:"0",closed_at:null,closure_reason:null}],
  lessons:[{id:"l1",student_id:"s1",package_id:"p1",starts_at:"2026-11-04T16:30:00Z",ends_at:"2026-11-04T17:30:00Z",mode:"online",status:"completed",reason:"",cancelled_by:null}],
  payments:[{id:"y1",package_id:"p1",amount:"250000",kind:"payment",reason:"Pembayaran contoh",paid_at:"2026-11-03T02:00:00Z"}],
  profile:null
};

describe("renderExportHtml",()=>{
  it("menghasilkan dokumen HTML lengkap berbahasa Indonesia yang berisi data guru",()=>{
    const html=renderExportHtml(base);
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain('<html lang="id">');
    for(const text of ["Rina Guru","rina@example.test","Arka","Matematika","Les selesai"])expect(html).toContain(text);
  });
  it("memformat rupiah dan memakai zona waktu guru (WITA, bukan UTC)",()=>{
    const html=renderExportHtml(base);
    expect(html).toMatch(/Rp\s?250\.000/);
    // 16:30 UTC pada 4 Nov = 00:30 WITA pada 5 Nov.
    expect(html).toContain("5 Nov 2026");
    expect(html).toContain("WITA");
  });
  it("meng-escape teks dari pengguna agar catatan tidak menjadi HTML/skrip",()=>{
    const html=renderExportHtml({...base,students:[{...base.students[0],name:'<script>alert(1)</script>',notes:'"><img src=x onerror=alert(2)>'}]});
    expect(html).not.toContain("<script>alert(1)");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });
  it("bagian kosong tetap ditulis jelas, bukan tabel kosong",()=>{
    const html=renderExportHtml({...base,students:[],packages:[],lessons:[],payments:[]});
    expect(html).toContain("Belum ada murid");
    expect(html).toContain("Belum ada pembayaran");
  });
  it("tidak memuat skrip eksternal dan memuat tombol cetak dengan gaya cetak",()=>{
    const html=renderExportHtml(base);
    expect(html).not.toMatch(/<script[^>]+src=/i);
    expect(html).toContain("@media print");
    expect(html).toContain("window.print()");
  });
  it("menampilkan profil iklan bila ada",()=>{
    const profile={id:"pr",draft:{name:"Rina",about:"Guru matematika",phone:"6281",province:"Jawa Barat",regency:"Kota Depok",areas:[],offers:[{subject:"Matematika",level:"SD",mode:"online" as const,duration:60,price:"75000"}]},published:null,review_status:"approved",visible:true,admin_hidden:false,accepting:true,review_reason:""};
    const html=renderExportHtml({...base,profile});
    expect(html).toContain("Kota Depok");
    expect(html).toMatch(/Rp\s?75\.000/);
  });
});
