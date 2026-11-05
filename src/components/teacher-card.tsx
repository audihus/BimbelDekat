import Link from "next/link";
import { MapPin,ArrowUpRight,Navigation } from "lucide-react";
import { Badge } from "./ui";
import { rupiah } from "@/lib/format";
import { teacherSummary } from "@/lib/teacher-summary";
import type { TeacherFilters } from "@/lib/directory";
import type { ProfileDocument } from "@/lib/domain/types";

// Kartu guru di hasil pencarian. Dipakai juga sebagai pratinjau iklan (tanpa href) agar guru melihat persis tampilan publiknya.
// `filters` membuat kartu menyorot daerah mengajar yang cocok dengan pencarian, bukan tempat tinggal guru.
export function TeacherCard({document:doc,accepting,href,filters={}}:{document:ProfileDocument;accepting:boolean;href?:string;filters?:TeacherFilters}){
  const name=doc.name.trim()||"Nama Anda";
  const s=teacherSummary(doc,filters);
  const others=s.areas.filter(a=>a!==s.matchedArea);
  return <article className="card teacher-card">
    <div className="row"><div className="avatar large">{name.slice(0,1)}</div><div><h2>{name}</h2><p className="record-meta row"><MapPin size={13} aria-hidden="true"/>Tinggal di {s.home||"kabupaten / kota belum dipilih"}</p></div></div>
    <div className="row" style={{gap:8}}><Badge tone={accepting?"green":"amber"}>{accepting?"Menerima murid baru":"Sedang tidak menerima murid"}</Badge>{s.modes.map(m=><Badge key={m} tone="blue">{m==="online"?"Online":"Tatap muka"}</Badge>)}</div>
    {s.areas.length>0&&<p className="area-line"><Navigation size={14} aria-hidden="true"/><span>{s.matchedArea?<><strong>Mengajar di {s.matchedArea}</strong>{others.length>0&&<span className="muted"> · +{others.length} daerah lain</span>}</>:<>Mengajar tatap muka di {s.areas.slice(0,2).join(", ")}{s.areas.length>2&&<span className="muted"> · +{s.areas.length-2} lagi</span>}</>}</span></p>}
    <p className="muted" style={{fontSize:".9rem"}}>{doc.about.slice(0,140)}{doc.about.length>140?"…":""}</p>
    {(s.subjects.length>0||s.levels.length>0)&&<div className="tags" aria-label="Pelajaran dan jenjang">{s.subjects.slice(0,4).map(t=><span key={t} className="tag">{t}</span>)}{s.subjects.length>4&&<span className="tag">+{s.subjects.length-4}</span>}{s.levels.map(l=><span key={l} className="tag level">{l}</span>)}</div>}
    <p className="from-price">{s.fromPrice===null?<span className="muted">Tarif belum diisi</span>:<>Mulai <strong>{rupiah(s.fromPrice)}</strong> / pertemuan</>}</p>
    <div className="card-footer">{href?<Link href={href} className="btn secondary full">Lihat profil <ArrowUpRight size={16} aria-hidden="true"/></Link>:<span className="btn secondary full" aria-disabled="true">Lihat profil</span>}</div>
  </article>;
}
