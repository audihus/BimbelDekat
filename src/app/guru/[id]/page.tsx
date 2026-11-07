import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MapPin,MessageCircle,ShieldCheck } from "lucide-react";
import { PublicHeader,PublicFooter,Badge,BackLink,TeacherAvatar } from "@/components/ui";
import { publicPhotoSrc } from "@/lib/photo";
import { publicTeachers } from "@/lib/public-data";
import { teacherSummary } from "@/lib/teacher-summary";
import { whatsappLink,contactMessage } from "@/lib/whatsapp";
import { rupiah } from "@/lib/format";
import { AdBeacon,WhatsappLink } from "@/components/ad-beacon";
import { APP_NAME } from "@/lib/brand";
import { contactChannels,reportMailto } from "@/lib/contact";
export const dynamic="force-dynamic";

const load=cache(async()=>publicTeachers());

// Judul dan deskripsi inilah yang tampil sebagai pratinjau saat tautan dibagikan ke WhatsApp.
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
  const {id}=await params;const {teachers}=await load();const teacher=teachers.find(t=>t.id===id);
  if(!teacher)return {title:"Profil guru"};
  const s=teacherSummary(teacher.document,{});
  const subjects=s.subjects.slice(0,3).join(", ");
  const title=`${teacher.document.name} — guru bimbel${subjects?` ${subjects}`:""}`;
  const description=[s.fromPrice!==null?`Mulai ${rupiah(s.fromPrice)} / pertemuan.`:"",teacher.document.about.slice(0,140)].filter(Boolean).join(" ");
  return {title,description,openGraph:{title,description,type:"profile",locale:"id_ID",siteName:APP_NAME}};
}

export default async function PublicProfile({params}:{params:Promise<{id:string}>}){
  const {id}=await params;const {teachers,unavailable}=await load();
  if(unavailable)return <><PublicHeader/><main id="main" className="public-main"><p className="notice warning">Profil belum dapat dimuat. Coba lagi sebentar.</p></main></>;
  const teacher=teachers.find(t=>t.id===id);if(!teacher)notFound();
  const profile=teacher.document;const s=teacherSummary(profile,{});
  const reportEmail=contactChannels().email;const report=reportEmail?reportMailto(reportEmail,teacher.id):null;
  const contact=whatsappLink(profile.phone,contactMessage(profile.name,s.subjects[0]));
  const wa=contact?<WhatsappLink profile={teacher.id} href={contact} className="btn wa big"><MessageCircle size={20} aria-hidden="true"/>Hubungi lewat WhatsApp</WhatsappLink>:<p className="notice warning">Guru belum mencantumkan nomor WhatsApp.</p>;
  return <><PublicHeader/><main id="main" className={`public-main stack${contact?" has-wa-bar":""}`}><AdBeacon profile={teacher.id}/>
    <div><BackLink href="/cari">Cari guru lainnya</BackLink></div>
    <section className="profile-hero stack" aria-labelledby="nama-guru">
      <div className="row"><TeacherAvatar name={profile.name} src={profile.photo?publicPhotoSrc(profile.photo):null}/><div className="grow"><h1 id="nama-guru">{profile.name}</h1><p className="area-line muted" style={{marginTop:8}}><MapPin size={16} aria-hidden="true"/>Tinggal di {profile.regency}, {profile.province}</p></div><Badge tone={teacher.accepting?"green":"amber"}>{teacher.accepting?"Menerima murid baru":"Sedang penuh"}</Badge></div>
      <div className="facts"><div className="fact"><span className="stat-label">Tarif mulai</span><strong>{s.fromPrice===null?"Tanyakan ke guru":`${rupiah(s.fromPrice)} / pertemuan`}</strong></div><div className="fact"><span className="stat-label">Cara belajar</span><strong>{s.modes.map(m=>m==="online"?"Online":"Tatap muka").join(" & ")||"-"}</strong></div><div className="fact"><span className="stat-label">Wilayah mengajar</span><strong>{s.areas.length?s.areas.slice(0,2).join(", ")+(s.areas.length>2?` +${s.areas.length-2}`:""):"Online dari mana saja"}</strong></div></div>
      <div className="row">{wa}</div>
    </section>
    <div className="grid-2"><section className="stack">
      <div className="card"><h2 style={{marginBottom:14}}>Tentang guru</h2><p style={{whiteSpace:"pre-wrap"}}>{profile.about}</p></div>
      <div className="card"><h2 style={{marginBottom:18}}>Bimbel yang diajarkan</h2><div className="stack-sm">{profile.offers.map((offer,index)=><article className="offer row between" key={index}><div><h3>{offer.subject} · {offer.level}</h3><p className="record-meta">{offer.mode==="online"?"Online":"Tatap muka"} · {offer.duration} menit</p></div><p className="from-price"><strong>{rupiah(offer.price)}</strong><span className="muted" style={{fontSize:".8rem"}}> / pertemuan</span></p></article>)}</div></div>
    </section><aside className="stack" style={{alignSelf:"start"}}>
      <div className="card"><h2 style={{marginBottom:14}}>Wilayah yang bisa didatangi</h2>{profile.areas.length?<ul style={{paddingLeft:20,margin:0}}>{profile.areas.map((area,index)=><li key={index}>{[area.district,area.regency,area.province].filter(Boolean).join(", ")}</li>)}</ul>:<p className="muted">Guru mengajar secara online, dari mana saja.</p>}</div>
      <div className="card stack-sm"><h2 className="row"><ShieldCheck size={20} aria-hidden="true"/>Sebelum mulai bimbel</h2><p className="muted" style={{fontSize:".92rem"}}>Profil ini ditinjau tim {APP_NAME} sebelum tayang. Jadwal dan pembayaran disepakati langsung dengan guru, di luar {APP_NAME}.</p>{!teacher.accepting&&<p className="notice warning">Guru sedang penuh. Anda tetap dapat menanyakan ketersediaan.</p>}{report&&<a className="text-link" href={report}>Laporkan profil ini</a>}</div>
    </aside></div>
    {contact&&<div className="wa-bar"><WhatsappLink profile={teacher.id} href={contact} className="btn wa"><MessageCircle size={20} aria-hidden="true"/>Hubungi lewat WhatsApp</WhatsappLink></div>}
  </main><PublicFooter/></>;
}
