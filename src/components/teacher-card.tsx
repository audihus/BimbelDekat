import Link from "next/link";
import { MapPin,Navigation,MessageCircle } from "lucide-react";
import { Badge,avatarTone } from "./ui";
import { WhatsappLink } from "./ad-beacon";
import { rupiah } from "@/lib/format";
import { teacherSummary } from "@/lib/teacher-summary";
import { whatsappLink,contactMessage } from "@/lib/whatsapp";
import type { TeacherFilters } from "@/lib/directory";
import type { ProfileDocument } from "@/lib/domain/types";

// Kartu guru di hasil pencarian. Dipakai juga sebagai pratinjau iklan dan contoh (tanpa href) agar guru melihat persis tampilan publiknya.
// `filters` membuat kartu menyorot daerah mengajar yang cocok dengan pencarian, bukan tempat tinggal guru.
// `profileId` menyalakan tombol WhatsApp di kartu; kliknya dihitung sebagai "menghubungi lewat WhatsApp".
export function TeacherCard({document:doc,accepting,href,profileId,filters={}}:{document:ProfileDocument;accepting:boolean;href?:string;profileId?:string;filters?:TeacherFilters}){
  const name=doc.name.trim()||"Nama Anda";
  const s=teacherSummary(doc,filters);
  const others=s.areas.filter(a=>a!==s.matchedArea);
  const wa=profileId?whatsappLink(doc.phone,contactMessage(name,s.subjects[0])):null;
  const preview=!href;
  return <article className="card teacher-card">
    <div className="row"><div className="avatar large" data-tone={avatarTone(name)}>{name.slice(0,1).toUpperCase()}</div><div><h2>{name}</h2><p className="record-meta row"><MapPin size={13} aria-hidden="true"/>Tinggal di {s.home||"kabupaten / kota belum dipilih"}</p></div></div>
    <div className="row" style={{gap:8}}><Badge tone={accepting?"green":"amber"}>{accepting?"Menerima murid baru":"Sedang penuh"}</Badge>{s.modes.map(m=><Badge key={m} tone="blue">{m==="online"?"Online":"Tatap muka"}</Badge>)}</div>
    {s.areas.length>0&&<p className="area-line"><Navigation size={14} aria-hidden="true"/><span>{s.matchedArea?<><strong>Mengajar di {s.matchedArea}</strong>{others.length>0&&<span className="muted"> · +{others.length} daerah lain</span>}</>:<>Bisa datang ke {s.areas.slice(0,2).join(", ")}{s.areas.length>2&&<span className="muted"> · +{s.areas.length-2} lagi</span>}</>}</span></p>}
    <p className="muted" style={{fontSize:".92rem"}}>{doc.about.slice(0,140)}{doc.about.length>140?"…":""}</p>
    {(s.subjects.length>0||s.levels.length>0)&&<div className="tags" aria-label="Pelajaran dan jenjang">{s.subjects.slice(0,4).map(t=><span key={t} className="tag">{t}</span>)}{s.subjects.length>4&&<span className="tag">+{s.subjects.length-4}</span>}{s.levels.map(l=><span key={l} className="tag level">{l}</span>)}</div>}
    <p className="from-price">{s.fromPrice===null?<span className="muted">Tarif belum diisi</span>:<>Mulai <strong>{rupiah(s.fromPrice)}</strong> / pertemuan</>}</p>
    <div className={`card-footer${preview||wa?" two":""}`}>
      {href?<Link href={href} className="btn secondary">Lihat profil</Link>:<span className="btn secondary" aria-disabled="true">Lihat profil</span>}
      {wa&&profileId?<WhatsappLink profile={profileId} href={wa}><MessageCircle size={17} aria-hidden="true"/>WhatsApp</WhatsappLink>:preview?<span className="btn wa" aria-disabled="true"><MessageCircle size={17} aria-hidden="true"/>WhatsApp</span>:null}
    </div>
  </article>;
}
