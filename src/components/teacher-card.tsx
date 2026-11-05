import Link from "next/link";
import { MapPin,ArrowUpRight } from "lucide-react";
import { Badge } from "./ui";
import { rupiah } from "@/lib/format";
import type { ProfileDocument } from "@/lib/domain/types";

// Kartu guru di hasil pencarian. Dipakai juga sebagai pratinjau iklan (tanpa href) agar guru melihat persis tampilan publiknya.
export function TeacherCard({document:doc,accepting,href}:{document:ProfileDocument;accepting:boolean;href?:string}){
  const name=doc.name.trim()||"Nama Anda";
  return <article className="card teacher-card">
    <div className="row"><div className="avatar large">{name.slice(0,1)}</div><div><h2>{name}</h2><p className="record-meta row"><MapPin size={13} aria-hidden="true"/>{doc.regency||"Kabupaten / kota belum dipilih"}</p></div></div>
    <Badge tone={accepting?"green":"amber"}>{accepting?"Menerima murid baru":"Sedang tidak menerima murid"}</Badge>
    <p className="muted" style={{fontSize:".9rem"}}>{doc.about.slice(0,150)}{doc.about.length>150?"…":""}</p>
    <div className="stack-sm">{doc.offers.slice(0,2).map((offer,index)=><div key={index} className="offer"><p className="record-name" style={{fontSize:".86rem"}}>{offer.subject||"Pelajaran"} · {offer.level}</p><p className="record-meta">{offer.mode==="online"?"Online":"Tatap muka"} · {offer.duration} menit</p><p style={{fontWeight:700,fontSize:".9rem",marginTop:4}}>{rupiah(offer.price)} / pertemuan</p></div>)}</div>
    <div className="card-footer">{href?<Link href={href} className="btn secondary full">Lihat profil <ArrowUpRight size={16} aria-hidden="true"/></Link>:<span className="btn secondary full" aria-disabled="true">Lihat profil</span>}</div>
  </article>;
}
