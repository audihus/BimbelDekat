import Link from "next/link";
import { Search,MapPinned,MessageCircle,ArrowRight,Check } from "lucide-react";
import { PublicHeader,PublicFooter,Badge,Field } from "@/components/ui";
import { TeacherCard } from "@/components/teacher-card";
import { RegionAreaFilter } from "@/components/region-select";
import { publicTeachers } from "@/lib/public-data";
import type { ProfileDocument } from "@/lib/domain/types";

export const dynamic="force-dynamic";

// Data fiktif hanya untuk ilustrasi di bagian guru; bukan guru sungguhan.
const example:ProfileDocument={name:"Contoh Guru",about:"Mengajar matematika SD dan SMP dengan sabar, memakai contoh sehari-hari, dan memberi kabar kemajuan belajar kepada orang tua.",phone:"",province:"Jawa Barat",regency:"Kota Depok",areas:[{province:"Jawa Barat",regency:"Kota Depok",district:"Beji"}],offers:[{subject:"Matematika",level:"SD",mode:"online",duration:60,price:"75000"},{subject:"Matematika",level:"SMP",mode:"offline",duration:90,price:"110000"}]};
const popular=["Matematika","Bahasa Inggris","IPA","Calistung","Mengaji"];

export default async function Home(){
  const {teachers}=await publicTeachers();
  const shown=teachers.slice(0,3);
  return <><PublicHeader/><main id="main" className="public-main">
    <section className="home-search stack" aria-labelledby="judul-cari">
      <div><p className="eyebrow">Cari guru les privat</p><h1 id="judul-cari" style={{marginTop:12}}>Temukan guru les privat di daerah Anda.</h1><p className="lead">Pilih pelajaran dan lokasi, lihat tarif dan daerah mengajar, lalu hubungi guru langsung lewat WhatsApp.</p></div>
      <form action="/cari" className="card stack" role="search"><div className="filter-main"><Field label="Pelajaran atau nama guru" name="q" placeholder="Contoh: Matematika"/><RegionAreaFilter/></div><div className="row between"><div className="row" style={{gap:8}}><span className="muted" style={{fontSize:".83rem"}}>Populer:</span>{popular.map(s=><Link key={s} className="tag" href={`/cari?q=${encodeURIComponent(s)}`}>{s}</Link>)}</div><button type="submit" className="btn"><Search size={17} aria-hidden="true"/>Cari guru</button></div></form>
    </section>

    {shown.length>0&&<section className="stack" style={{marginTop:48}} aria-labelledby="judul-guru"><div className="row between"><h2 id="judul-guru">Guru di direktori</h2><Link href="/cari" className="text-link">Lihat semua guru</Link></div><div className="grid-3">{shown.map(t=><TeacherCard key={t.id} document={t.document} accepting={t.accepting} href={`/guru/${t.id}`}/>)}</div></section>}

    <section style={{marginTop:56}}><div className="section-heading"><p className="eyebrow">Untuk orang tua dan murid</p><h2 style={{marginTop:10}}>Tiga langkah menemukan guru yang cocok.</h2></div>
      <div className="grid-3">{[{icon:Search,title:"Cari sesuai kebutuhan",body:"Pilih pelajaran, jenjang, dan online atau tatap muka. Les online bisa dicari dari mana saja."},{icon:MapPinned,title:"Lihat daerah dan tarif",body:"Kartu guru menunjukkan daerah yang didatangi, tarif mulai berapa, dan apakah guru sedang menerima murid."},{icon:MessageCircle,title:"Hubungi lewat WhatsApp",body:"Satu tombol untuk menanyakan jadwal dan kesepakatan. Anda berhubungan langsung dengan guru."}].map(item=><article key={item.title} className="card"><span className="feature-icon"><item.icon size={23} aria-hidden="true"/></span><h3 style={{fontSize:"1.1rem"}}>{item.title}</h3><p className="muted" style={{marginTop:12,fontSize:".92rem"}}>{item.body}</p></article>)}</div>
    </section>

    <section className="hero teacher-door" style={{marginTop:56}} aria-labelledby="judul-guru-les"><div>
      <p className="eyebrow">Untuk guru les privat mandiri</p>
      <h2 id="judul-guru-les" style={{fontSize:"clamp(1.8rem,4vw,2.6rem)",marginTop:12}}>Pasang iklan les Anda. Dicari orang tua di daerah Anda.</h2>
      <ul className="check-list" style={{marginTop:20}}>{["Buat profil dengan pelajaran, tarif, dan daerah mengajar","Orang tua menghubungi Anda langsung lewat WhatsApp","Bagikan tautan profil Anda ke grup orang tua","Lihat berapa kali profil Anda dibuka"].map(t=><li key={t}><Check size={18} className="done" aria-hidden="true"/><span>{t}</span></li>)}</ul>
      <div className="row" style={{marginTop:26}}><Link href="/daftar" className="btn">Buat profil guru <ArrowRight size={17} aria-hidden="true"/></Link><Link href="/masuk" className="btn secondary">Masuk</Link></div>
      <p className="hero-note">Bila Anda mau, tersedia juga catatan murid, jadwal, dan pembayaran les. Boleh dipakai, boleh tidak.</p>
    </div>
    <div className="hero-preview" aria-label="Contoh tampilan iklan guru, memakai data fiktif"><div className="stack"><div className="row between"><Badge>Contoh tampilan</Badge></div><TeacherCard document={example} accepting/></div></div></section>
  </main><PublicFooter/></>;
}
