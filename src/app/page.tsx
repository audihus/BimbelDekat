import Link from "next/link";
import { Search,ShieldCheck,MessageCircle,House,ArrowRight } from "lucide-react";
import { PublicHeader,PublicFooter,Field } from "@/components/ui";
import { TeacherCard } from "@/components/teacher-card";
import { RegionAreaFilter } from "@/components/region-select";
import { ParentArt } from "@/components/illustrations";
import { Steps,Faq,TrustStrip } from "@/components/landing";
import { publicTeachers } from "@/lib/public-data";
import { popularSubjects,popularCities,cityHref } from "@/lib/popular";
import { APP_NAME } from "@/lib/brand";

export const dynamic="force-dynamic";

// Halaman depan untuk ORANG TUA yang mencari bimbel. Halaman untuk guru ada di /untuk-guru.
const trust=[
  {icon:ShieldCheck,text:"Iklan guru dicek tim kami sebelum tayang"},
  {icon:MessageCircle,text:"Hubungi guru langsung lewat WhatsApp"},
  {icon:House,text:"Bimbel online, atau guru datang ke rumah"}
];
const steps=[
  {kind:"cari" as const,title:"Cari sesuai kebutuhan",body:"Ketik pelajaran dan pilih kota. Bimbel online bisa dicari dari mana saja."},
  {kind:"peta" as const,title:"Lihat tarif dan wilayah",body:"Kartu guru menunjukkan tarif mulai berapa, wilayah yang didatangi, dan apakah guru masih menerima murid."},
  {kind:"chat" as const,title:"Hubungi lewat WhatsApp",body:"Satu tombol untuk menanyakan jadwal dan kesepakatan. Anda berhubungan langsung dengan guru."}
];
const faq=[
  {q:"Bagaimana cara membayar guru?",a:`Pembayaran diatur langsung antara Anda dan guru, di luar ${APP_NAME}. Sepakati tarif dan cara bayar sebelum mulai.`},
  {q:"Apakah guru sudah diverifikasi?",a:`Isi iklan guru ditinjau tim kami sebelum tayang, tetapi kami belum memeriksa ijazah atau latar belakang guru. Tanyakan langsung ke guru, dan sebaiknya bertemu dulu sebelum mulai.`},
  {q:"Apa bedanya bimbel online dan tatap muka?",a:"Bimbel online dilakukan lewat video, jadi bisa dengan guru dari kota mana saja. Bimbel tatap muka berarti guru datang ke rumah, hanya di wilayah yang tercantum di iklannya."},
  {q:"Bagaimana kalau di kota saya belum ada guru?",a:"Coba cari bimbel online, atau kurangi pilihan wilayah. Guru baru terus bergabung dan iklannya muncul di hasil pencarian setelah dicek."}
];

export default async function Home(){
  const {teachers}=await publicTeachers();
  const shown=teachers.slice(0,3);
  return <><PublicHeader current="orangtua"/><main id="main" className="public-main">
    <section className="hero" aria-labelledby="judul-cari">
      <div>
        <p className="eyebrow">Untuk orang tua dan murid</p>
        <h1 id="judul-cari">Cari bimbel privat di dekat rumah Anda.</h1>
        <p className="lead">Pilih pelajaran dan lokasi, lihat tarif dan wilayah mengajar, lalu hubungi guru langsung lewat WhatsApp.</p>
        <form action="/cari" className="card hero-search" role="search" aria-label="Cari bimbel">
          <div className="filter-main"><Field label="Pelajaran atau nama guru" name="q" placeholder="Contoh: Matematika"/><RegionAreaFilter/></div>
          <button type="submit" className="btn big"><Search size={19} aria-hidden="true"/>Cari bimbel</button>
        </form>
        <div className="row" style={{marginTop:16,gap:8}}><span className="muted" style={{fontSize:".88rem"}}>Populer:</span>{popularSubjects.slice(0,5).map(s=><Link key={s} className="tag" href={`/cari?q=${encodeURIComponent(s)}`}>{s}</Link>)}</div>
      </div>
      <ParentArt/>
    </section>

    <section style={{marginTop:28}} aria-label="Yang perlu Anda tahu"><TrustStrip items={trust}/></section>

    <section style={{marginTop:64}} aria-labelledby="judul-cara"><div className="section-heading"><p className="eyebrow">Cara mencari</p><h2 id="judul-cara">Tiga langkah menemukan guru yang cocok.</h2></div><Steps items={steps}/></section>

    <section className="stack" style={{marginTop:64}} aria-labelledby="judul-pintasan"><div className="section-heading" style={{marginBottom:0}}><p className="eyebrow">Pintasan</p><h2 id="judul-pintasan">Cari menurut pelajaran atau kota.</h2></div>
      <div><h3 style={{marginBottom:10}}>Pelajaran</h3><div className="link-grid">{popularSubjects.map(s=><Link key={s} className="tag" href={`/cari?q=${encodeURIComponent(s)}`}>{s}</Link>)}</div></div>
      <div><h3 style={{marginBottom:10}}>Kota</h3><div className="link-grid">{popularCities.map(c=><Link key={c.regency} className="tag" href={cityHref(c)}>{c.regency.replace(/^Kota (Administrasi )?/,"")}</Link>)}</div></div>
    </section>

    {shown.length>0&&<section className="stack" style={{marginTop:64}} aria-labelledby="judul-guru"><div className="row between"><h2 id="judul-guru">Guru di {APP_NAME}</h2><Link href="/cari" className="text-link">Lihat semua guru</Link></div><div className="grid-3">{shown.map(t=><TeacherCard key={t.id} document={t.document} accepting={t.accepting} href={`/guru/${t.id}`} profileId={t.id}/>)}</div></section>}

    <section style={{marginTop:64}} aria-labelledby="judul-faq"><div className="section-heading"><p className="eyebrow">Tanya jawab</p><h2 id="judul-faq">Pertanyaan yang sering muncul.</h2></div><Faq items={faq}/></section>

    <section className="ribbon" style={{marginTop:64}} aria-labelledby="judul-guru-cta"><div><h2 id="judul-guru-cta">Anda guru bimbel privat?</h2><p className="muted" style={{marginTop:4}}>Pasang iklan Anda di sini dan dapatkan murid baru.</p></div><Link href="/untuk-guru" className="btn">Untuk guru <ArrowRight size={17} aria-hidden="true"/></Link></section>
  </main><PublicFooter/></>;
}
