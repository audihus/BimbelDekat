import Link from "next/link";
import { UserPlus,ShieldCheck,MessageCircle,Share2,BarChart3,NotebookPen,ArrowRight } from "lucide-react";
import { PublicHeader,PublicFooter,Badge } from "@/components/ui";
import { TeacherCard } from "@/components/teacher-card";
import { HeroArt } from "@/components/illustrations";
import { Steps,Faq,TrustStrip } from "@/components/landing";
import type { ProfileDocument } from "@/lib/domain/types";

export const metadata={title:"Untuk guru: pasang iklan bimbel privat Anda"};

// Halaman untuk GURU yang ingin mengiklankan bimbel privatnya. Halaman untuk orang tua ada di /.
// Data fiktif hanya untuk ilustrasi; bukan guru sungguhan.
const example:ProfileDocument={name:"Contoh Guru",about:"Mengajar matematika SD dan SMP dengan sabar, memakai contoh sehari-hari, dan memberi kabar kemajuan belajar kepada orang tua.",phone:"",province:"Jawa Barat",regency:"Kota Depok",areas:[{province:"Jawa Barat",regency:"Kota Depok",district:"Beji"}],offers:[{subject:"Matematika",level:"SD",mode:"online",duration:60,price:"75000"},{subject:"Matematika",level:"SMP",mode:"offline",duration:90,price:"110000"}]};
const perks=[{icon:Share2,text:"Tautan iklan pribadi yang bisa dibagikan ke grup WhatsApp"},{icon:BarChart3,text:"Lihat berapa kali iklan Anda dibuka dan WhatsApp Anda ditekan"},{icon:NotebookPen,text:"Catat murid dan jadwal bila Anda mau. Boleh tidak dipakai"}];
const steps=[
  {kind:"profil" as const,title:"Isi iklan bimbel Anda",body:"Tulis pelajaran, tarif, dan wilayah yang bisa Anda datangi. Cukup diisi sekali."},
  {kind:"cek" as const,title:"Kami cek, lalu iklan tayang",body:"Tim kami memeriksa isi iklan sebelum muncul di pencarian orang tua."},
  {kind:"chat" as const,title:"Orang tua menghubungi Anda",body:"Mereka menekan satu tombol WhatsApp dan langsung mengobrol dengan Anda."}
];
// Sengaja tidak ada jawaban soal biaya: model bisnis belum diputuskan.
const faq=[
  {q:"Siapa yang menentukan tarif?",a:"Anda sendiri. Tarif, jadwal, dan wilayah yang Anda datangi ditulis di iklan Anda dan bisa diubah kapan saja (perubahan dicek tim kami dulu)."},
  {q:"Bagaimana orang tua menghubungi saya?",a:"Lewat WhatsApp, ke nomor yang Anda cantumkan. Orang tua menekan satu tombol, dan Anda mengobrol langsung dengan mereka."},
  {q:"Apakah saya wajib mencatat murid di aplikasi?",a:"Tidak. Catatan murid, jadwal, dan pembayaran bersifat opsional. Iklan Anda tetap berjalan tanpa itu."},
  {q:"Apakah saya harus punya lembaga bimbel?",a:"Tidak. Aplikasi ini untuk guru bimbel privat mandiri yang mengajar sendiri."}
];

export default function ForTeachers(){
  return <><PublicHeader current="guru"/><main id="main" className="public-main">
    <section className="hero" aria-labelledby="judul-guru">
      <div>
        <p className="eyebrow">Untuk guru bimbel privat</p>
        <h1 id="judul-guru">Dapatkan murid baru untuk bimbel privat Anda.</h1>
        <p className="lead">Pasang iklan bimbel Anda. Orang tua di daerah Anda menghubungi lewat WhatsApp.</p>
        <p style={{marginTop:26,fontWeight:750,fontSize:"1.15rem"}}>Ingin mendaftarkan diri? Langsung saja.</p>
        <div className="row" style={{marginTop:14}}><Link href="/daftar" className="btn big">Daftarkan diri Anda <ArrowRight size={19} aria-hidden="true"/></Link></div>
        <p className="hero-note">Sudah punya akun? <Link href="/masuk">Masuk</Link></p>
      </div>
      <HeroArt/>
    </section>

    <section style={{marginTop:28}} aria-label="Yang Anda dapatkan"><TrustStrip items={perks}/></section>

    <section style={{marginTop:64}} aria-labelledby="judul-cara"><div className="section-heading"><p className="eyebrow">Cara kerjanya untuk guru</p><h2 id="judul-cara">Tiga langkah sampai ada murid yang menghubungi.</h2></div><Steps items={steps}/></section>

    <section className="showcase" style={{marginTop:64}} aria-labelledby="judul-contoh"><div className="stack">
      <div><p className="eyebrow">Iklan Anda di mata orang tua</p><h2 id="judul-contoh" style={{fontSize:"clamp(1.6rem,3.4vw,2.2rem)",marginTop:12}}>Satu kartu yang menjawab pertanyaan orang tua.</h2></div>
      <p className="lead">Pelajaran, tarif, wilayah yang Anda datangi, dan tombol WhatsApp ada di satu tempat, jadi orang tua tidak perlu bertanya berulang-ulang.</p>
      <ul className="check-list">{[{icon:UserPlus,text:"Isi sekali, tampil di pencarian orang tua"},{icon:ShieldCheck,text:"Dicek tim kami sebelum tayang"},{icon:MessageCircle,text:"Tombol WhatsApp langsung di kartu dan di profil Anda"}].map(p=><li key={p.text}><span className="stat-icon" style={{width:34,height:34,flex:"0 0 34px"}}><p.icon size={17} aria-hidden="true"/></span><span style={{alignSelf:"center"}}>{p.text}</span></li>)}</ul>
    </div><div className="showcase-art" aria-label="Contoh tampilan iklan guru, memakai data fiktif"><Badge tone="amber">Contoh tampilan, bukan guru sungguhan</Badge><TeacherCard document={example} accepting/></div></section>

    <section style={{marginTop:64}} aria-labelledby="judul-faq"><div className="section-heading"><p className="eyebrow">Tanya jawab</p><h2 id="judul-faq">Pertanyaan yang sering muncul.</h2></div><Faq items={faq}/></section>

    <section className="cta-band" style={{marginTop:64}} aria-labelledby="judul-akhir"><h2 id="judul-akhir">Siap dicari murid baru?</h2><p>Buat iklan bimbel Anda sekarang. Anda yang menentukan tarif dan jadwal.</p><Link href="/daftar" className="btn big">Daftarkan diri Anda <ArrowRight size={19} aria-hidden="true"/></Link><p style={{fontSize:".92rem"}}>Sudah punya akun? <Link className="plain" href="/masuk">Masuk</Link></p><p style={{fontSize:".92rem"}}>Anda orang tua? <Link className="plain" href="/cari">Cari bimbel di sini</Link></p></section>
  </main><PublicFooter/></>;
}
