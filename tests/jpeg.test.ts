import { describe,expect,it } from "vitest";
import { sanitizeJpeg,JpegError,PHOTO_MAX_BYTES } from "@/lib/jpeg";

// JPEG rekaan seukuran struktur saja (tanpa piksel sungguhan): cukup untuk menguji penguraian penanda.
const seg=(marker:number,payload:number[])=>[0xff,marker,(payload.length+2)>>8,(payload.length+2)&255,...payload];
const sof=(w:number,h:number,marker=0xc0,components=3,precision=8)=>seg(marker,[precision,h>>8,h&255,w>>8,w&255,components,...Array.from({length:components*3},()=>1)]);
const sos=seg(0xda,[3,1,0,2,0x11,3,0x11,0,63,0]);
const SOI=[0xff,0xd8],EOI=[0xff,0xd9];
const build=(...parts:number[][])=>Uint8Array.from(parts.flat());
const exif=seg(0xe1,[...Buffer.from("Exif\0\0GPS-LOKASI-RAHASIA")]);
const entropy=[0x12,0x34,0xff,0x00,0x56,0xff,0xd0,0x78];

describe("sanitizeJpeg",()=>{
  it("membuang EXIF dan komentar tetapi mempertahankan gambar dan ukurannya",()=>{
    const input=build(SOI,seg(0xe0,[...Buffer.from("JFIF\0")]),exif,seg(0xfe,[...Buffer.from("rahasia")]),seg(0xdb,[0,...Array(64).fill(8)]),sof(400,300),seg(0xc4,[0x00,...Array(28).fill(1)]),sos,entropy,EOI);
    const out=sanitizeJpeg(input);
    expect(out.width).toBe(400);expect(out.height).toBe(300);
    expect(Buffer.from(out.data).includes(Buffer.from("GPS-LOKASI-RAHASIA"))).toBe(false);
    expect(Buffer.from(out.data).includes(Buffer.from("rahasia"))).toBe(false);
    expect([...out.data.slice(0,2)]).toEqual([0xff,0xd8]);
    expect([...out.data.slice(-2)]).toEqual([0xff,0xd9]);
    expect(out.data.length).toBeLessThan(input.length);
  });

  it("menyalin data piksel apa adanya, termasuk byte FF00 dan penanda RST",()=>{
    const out=sanitizeJpeg(build(SOI,sof(200,200),sos,entropy,EOI));
    const tail=[...out.data.slice(-entropy.length-2)];
    expect(tail).toEqual([...entropy,0xff,0xd9]);
  });

  it("memotong data tambahan setelah penanda akhir (pembungkus berkas ganda)",()=>{
    const out=sanitizeJpeg(build(SOI,sof(200,200),sos,entropy,EOI,[...Buffer.from("<script>alert(1)</script>")]));
    expect(Buffer.from(out.data).includes(Buffer.from("<script>"))).toBe(false);
    expect([...out.data.slice(-2)]).toEqual([0xff,0xd9]);
  });

  it("mendukung JPEG progresif dengan banyak pemindaian",()=>{
    const out=sanitizeJpeg(build(SOI,sof(300,300,0xc2),sos,entropy,seg(0xc4,[0x10,...Array(28).fill(1)]),sos,entropy,EOI));
    expect(out.width).toBe(300);
  });

  it("menolak berkas yang bukan JPEG",()=>{
    expect(()=>sanitizeJpeg(Uint8Array.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]))).toThrow(JpegError);
    expect(()=>sanitizeJpeg(new Uint8Array())).toThrow(JpegError);
    expect(()=>sanitizeJpeg(Uint8Array.from(Buffer.from("<html>bukan gambar</html>")))).toThrow(JpegError);
  });

  it("menolak JPEG terpotong (tanpa penanda akhir) atau tanpa gambar",()=>{
    expect(()=>sanitizeJpeg(build(SOI,sof(200,200),sos,entropy))).toThrow(JpegError);
    expect(()=>sanitizeJpeg(build(SOI,exif,EOI))).toThrow(JpegError);
    expect(()=>sanitizeJpeg(build(SOI,sof(200,200),[0xff,0xdb,0x00,0x50,1,2]))).toThrow(JpegError);   // panjang segmen melebihi berkas
  });

  it("menolak ukuran yang terlalu kecil atau terlalu besar",()=>{
    expect(()=>sanitizeJpeg(build(SOI,sof(10,10),sos,entropy,EOI))).toThrow(/ukuran/i);
    expect(()=>sanitizeJpeg(build(SOI,sof(5000,5000),sos,entropy,EOI))).toThrow(/ukuran/i);
  });

  it("menolak format JPEG yang tidak didukung (aritmetika, tanpa kehilangan, 12-bit, CMYK)",()=>{
    expect(()=>sanitizeJpeg(build(SOI,sof(200,200,0xc3),sos,entropy,EOI))).toThrow(JpegError);
    expect(()=>sanitizeJpeg(build(SOI,sof(200,200,0xc9),sos,entropy,EOI))).toThrow(JpegError);
    expect(()=>sanitizeJpeg(build(SOI,sof(200,200,0xc0,3,12),sos,entropy,EOI))).toThrow(JpegError);
    expect(()=>sanitizeJpeg(build(SOI,sof(200,200,0xc0,4),sos,entropy,EOI))).toThrow(JpegError);
  });

  it("menolak hasil yang melebihi batas ukuran berkas",()=>{
    const big=Array(PHOTO_MAX_BYTES+10).fill(0x11);
    expect(()=>sanitizeJpeg(build(SOI,sof(400,400),sos,big,EOI))).toThrow(/besar/i);
  });
});
