import Link from "next/link";
import { Search,UserPlus,ShieldCheck,MessageCircle,Share2,BarChart3,NotebookPen,ArrowRight } from "lucide-react";
import { PublicHeader,PublicFooter,Badge,Field } from "@/components/ui";
import { TeacherCard } from "@/components/teacher-card";
import { HeroArt,StepArt } from "@/components/illustrations";
import { RegionAreaFilter } from "@/components/region-select";
import { publicTeachers } from "@/lib/public-data";
import type { ProfileDocument } from "@/lib/domain/types";

export const dynamic="force-dynamic";

// Data fiktif hanya untuk ilustrasi di bagian guru; bukan guru sungguhan.
const example:ProfileDocument={name:"Contoh Guru",about:"Mengajar matematika SD dan SMP dengan sabar, memakai contoh sehari-hari, dan memberi kabar kemajuan belajar kepada orang tua.",phone:"",province:"Jawa Barat",regency:"Kota Depok",areas:[{province:"Jawa Barat",regency:"Kota Depok",district:"Beji"}],offers:[{subject:"Matematika",level:"SD",mode:"online",duration:60,price:"75000"},{subject:"Matematika",level:"SMP",mode:"offline",duration:90,price:"110000"}]};
const popular=["Matematika","Bahasa Inggris","IPA","Calistung","Mengaji"];
const steps=[
  {icon:UserPlus,title:"Isi profil les Anda",body:"Tulis pelajaran, tarif, dan wilayah yang bisa Anda datangi. Cukup diisi sekali."},
  {icon:ShieldCheck,title:"Kami cek, lalu iklan tayang",body:"Tim kami memeriksa isi iklan sebelum muncul di pencarian orang tua."},
  {icon:MessageCircle,title:"Orang tua menghubungi Anda",body:"Mereka menekan satu tombol WhatsApp dan langsung mengobrol dengan Anda."}
];
const perks=[{icon:Share2,text:"Tautan iklan pribadi yang bisa dibagikan ke grup WhatsApp"},{icon:BarChart3,text:"Lihat berapa kali iklan Anda dibuka dan WhatsApp Anda ditekan"},{icon:NotebookPen,text:"Catat murid dan jadwal bila Anda mau. Boleh tidak dipakai"}];

export default async function Home(){
  const {teachers}=await publicTeachers();
  const shown=teachers.slice(0,3);
  return <><PublicHeader/><main id="main" className="public-main">
    <section className="hero" aria-labelledby="judul-guru-les">
      <div>
        <p className="eyebrow">Untuk guru les privat</p>
        <h1 id="judul-guru-les">Punya les privat? Biar orang tua yang menemukan Anda.</h1>
        <p className="lead">Buat iklan les Anda di sini. Orang tua di daerah Anda bisa melihat pelajaran, tarif, dan wilayah mengajar Anda, lalu langsung menghubungi lewat WhatsApp.</p>
        <p style={{marginTop:26,fontWeight:750,fontSize:"1.15rem"}}>Ingin mendaftarkan diri? Langsung saja.</p>
        <div className="row" style={{marginTop:14}}><Link href="/daftar" className="btn big">Daftarkan diri Anda <ArrowRight size={19} aria-hidden="true"/></Link></div>
        <p className="hero-note">Sudah punya akun? <Link href="/masuk">Masuk</Link></p>
      </div>
      <HeroArt/>
    </section>

    <section className="search-band" aria-labelledby="judul-cari">
      <form action="/cari" className="card stack" role="search"><h2 id="judul-cari">Mencari guru les untuk anak Anda?</h2><div className="filter-main"><Field label="Pelajaran atau nama guru" name="q" placeholder="Contoh: Matematika"/><RegionAreaFilter/></div><div className="row between"><div className="row" style={{gap:8}}><span className="muted" style={{fontSize:".85rem"}}>Populer:</span>{popular.map(s=><Link key={s} className="tag" href={`/cari?q=${encodeURIComponent(s)}`}>{s}</Link>)}</div><button type="submit" className="btn"><Search size={17} aria-hidden="true"/>Cari guru</button></div></form>
    </section>

    <section style={{marginTop:64}} aria-labelledby="judul-cara"><div className="section-heading"><p className="eyebrow">Cara kerjanya untuk guru</p><h2 id="judul-cara">Tiga langkah sampai ada murid yang menghubungi.</h2></div>
      <div className="steps">{steps.map((item,index)=><article key={item.title} className="card step"><StepArt step={(index+1) as 1|2|3}/><div className="step-head"><span className="step-num" aria-hidden="true">{index+1}</span><h3>{item.title}</h3></div><p className="muted" style={{fontSize:".95rem"}}>{item.body}</p></article>)}</div>
    </section>

    <section className="showcase" style={{marginTop:64}} aria-labelledby="judul-contoh"><div className="stack">
      <div><p className="eyebrow">Iklan Anda di mata orang tua</p><h2 id="judul-contoh" style={{fontSize:"clamp(1.6rem,3.4vw,2.2rem)",marginTop:12}}>Satu kartu yang menjawab pertanyaan orang tua.</h2></div>
      <p className="lead">Pelajaran, tarif, wilayah yang Anda datangi, dan tombol WhatsApp ada di satu tempat, jadi orang tua tidak perlu bertanya berulang-ulang.</p>
      <ul className="check-list">{perks.map(p=><li key={p.text}><span className="stat-icon" style={{width:34,height:34,flex:"0 0 34px"}}><p.icon size={17} aria-hidden="true"/></span><span style={{alignSelf:"center"}}>{p.text}</span></li>)}</ul>
    </div><div className="showcase-art" aria-label="Contoh tampilan iklan guru, memakai data fiktif"><Badge tone="amber">Contoh tampilan, bukan guru sungguhan</Badge><TeacherCard document={example} accepting/></div></section>

    {shown.length>0&&<section className="stack" style={{marginTop:64}} aria-labelledby="judul-guru"><div className="row between"><h2 id="judul-guru">Guru di Les Privat</h2><Link href="/cari" className="text-link">Lihat semua guru</Link></div><div className="grid-3">{shown.map(t=><TeacherCard key={t.id} document={t.document} accepting={t.accepting} href={`/guru/${t.id}`} profileId={t.id}/>)}</div></section>}

    <section className="cta-band" style={{marginTop:64}} aria-labelledby="judul-akhir"><h2 id="judul-akhir">Siap dicari murid baru?</h2><p>Buat iklan les Anda sekarang. Anda yang menentukan tarif dan jadwal.</p><Link href="/daftar" className="btn big">Daftarkan diri Anda <ArrowRight size={19} aria-hidden="true"/></Link><p style={{fontSize:".92rem"}}>Sudah punya akun? <Link className="plain" href="/masuk">Masuk</Link></p></section>
  </main><PublicFooter/></>;
}
