import Link from "next/link";
import { Megaphone,MapPinned,MessageCircle,ArrowRight } from "lucide-react";
import { PublicHeader,PublicFooter,Badge } from "@/components/ui";
import { TeacherCard } from "@/components/teacher-card";
import type { ProfileDocument } from "@/lib/domain/types";

// Data fiktif hanya untuk ilustrasi; bukan guru sungguhan.
const example:ProfileDocument={name:"Contoh Guru",about:"Mengajar matematika SD dan SMP dengan sabar, memakai contoh sehari-hari, dan memberi kabar kemajuan belajar kepada orang tua.",phone:"",province:"Jawa Barat",regency:"Kota Depok",areas:[],offers:[{subject:"Matematika",level:"SD",mode:"online",duration:60,price:"75000"},{subject:"Matematika",level:"SMP",mode:"offline",duration:90,price:"110000"}]};

export default function Home(){return <><PublicHeader/><main id="main" className="public-main">
  <section className="hero"><div>
    <p className="eyebrow">Untuk guru les privat mandiri</p>
    <h1>Pasang iklan les Anda.<br/><span style={{color:"var(--primary)"}}>Dicari orang tua di daerah Anda.</span></h1>
    <p className="lead">Buat profil guru dengan pelajaran, tarif, dan daerah mengajar. Orang tua mencari berdasarkan pelajaran dan lokasi, lalu menghubungi Anda langsung lewat WhatsApp.</p>
    <div className="row" style={{marginTop:30}}><Link href="/daftar" className="btn">Buat profil guru <ArrowRight size={17} aria-hidden="true"/></Link><Link href="/cari" className="btn secondary">Saya mencari guru</Link></div>
    <p className="hero-note">Untuk les individual SD–SMA, online maupun tatap muka, di seluruh Indonesia.</p>
  </div>
  <div className="hero-preview" aria-label="Contoh tampilan iklan guru, memakai data fiktif"><div className="stack"><div className="row between"><Badge>Contoh tampilan</Badge></div><TeacherCard document={example} accepting/></div></div></section>

  <section><div className="section-heading"><p className="eyebrow">Cara kerjanya</p><h2 style={{marginTop:10}}>Tiga langkah sampai dihubungi calon murid.</h2></div>
    <div className="grid-3">{[{icon:Megaphone,title:"Buat profil dan penawaran",body:"Tulis perkenalan, pelajaran, jenjang, dan tarif per pertemuan. Pengelola memeriksa iklan sebelum tayang."},{icon:MapPinned,title:"Ditemukan di daerah Anda",body:"Pilih provinsi, kabupaten/kota, dan kecamatan yang bersedia Anda datangi. Les online dapat ditemukan dari mana saja."},{icon:MessageCircle,title:"Dihubungi lewat WhatsApp",body:"Orang tua menekan satu tombol untuk menghubungi Anda. Kesepakatan les tetap antara Anda dan orang tua."}].map(item=><article key={item.title} className="card"><span className="feature-icon"><item.icon size={23} aria-hidden="true"/></span><h2>{item.title}</h2><p className="muted" style={{marginTop:12,fontSize:".92rem"}}>{item.body}</p></article>)}</div></section>

  <section className="card row between" style={{marginTop:40,padding:30}}><div><h2>Sedang mencari guru les?</h2><p className="muted" style={{marginTop:8}}>Temukan penawaran yang sesuai pelajaran, jenjang, dan daerah Anda.</p></div><Link href="/cari" className="btn secondary">Jelajahi guru <ArrowRight size={16} aria-hidden="true"/></Link></section>

  <p className="muted" style={{marginTop:28,fontSize:".9rem",textAlign:"center"}}>Bila Anda mau, tersedia juga catatan murid, jadwal, dan pembayaran les. Boleh dipakai, boleh tidak.</p>
</main><PublicFooter/></>;}
