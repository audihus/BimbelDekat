"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProfileDocument, TeacherProfile } from "@/lib/domain/types";

const empty:ProfileDocument={name:"",about:"",phone:"",province:"",regency:"",areas:[],offers:[]};
export function ProfileEditor({profile}:{profile:TeacherProfile|null}){
  const [doc,setDoc]=useState<ProfileDocument>(profile?.draft??empty);
  const [pending,setPending]=useState(false);const [message,setMessage]=useState("");const [failed,setFailed]=useState(false);
  const router=useRouter();
  async function save(action:"profile.save"|"profile.submit"){
    setPending(true);setMessage("");try{
      const response=await fetch("/api/commands",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,payload:{document:doc},requestId:crypto.randomUUID()})});
      const result=await response.json();if(!response.ok)throw new Error(result.error);
      setFailed(false);setMessage(action==="profile.submit"?"Profil diajukan untuk pemeriksaan.":"Draf profil tersimpan.");router.refresh();
    }catch(error){setFailed(true);setMessage(error instanceof Error?error.message:"Profil belum tersimpan. Coba lagi.");}finally{setPending(false);}
  }
  return <div className="stack"><div className="form-grid">
    {([ ["name","Nama yang ditampilkan"],["phone","Nomor WhatsApp publik"],["province","Provinsi tempat tinggal"],["regency","Kabupaten / kota tempat tinggal"] ] as const).map(([field,label])=><label className="field" key={field}><span className="field-label">{label}</span><input value={doc[field]} onChange={e=>setDoc({...doc,[field]:e.target.value})}/></label>)}
    <label className="field span-2"><span className="field-label">Tentang Anda dan cara mengajar</span><textarea value={doc.about} maxLength={3000} onChange={e=>setDoc({...doc,about:e.target.value})}/></label>
  </div><div className="stack-sm"><div className="row between"><h2>Penawaran les</h2><button type="button" className="btn secondary" onClick={()=>setDoc({...doc,offers:[...doc.offers,{subject:"",level:"SD",mode:"online",duration:60,price:"0"}]})}>Tambah penawaran</button></div>{doc.offers.map((offer,index)=><div className="offer stack-sm" key={index}><div className="form-grid">
    <label className="field"><span className="field-label">Pelajaran</span><input value={offer.subject} onChange={e=>setDoc({...doc,offers:doc.offers.map((o,i)=>i===index?{...o,subject:e.target.value}:o)})}/></label>
    <label className="field"><span className="field-label">Jenjang</span><select value={offer.level} onChange={e=>setDoc({...doc,offers:doc.offers.map((o,i)=>i===index?{...o,level:e.target.value}:o)})}><option>SD</option><option>SMP</option><option>SMA</option></select></label>
    <label className="field"><span className="field-label">Cara mengajar</span><select value={offer.mode} onChange={e=>setDoc({...doc,offers:doc.offers.map((o,i)=>i===index?{...o,mode:e.target.value as "online"|"offline"}:o)})}><option value="online">Online</option><option value="offline">Tatap muka</option></select></label>
    <label className="field"><span className="field-label">Durasi (menit)</span><input type="number" min="1" value={offer.duration} onChange={e=>setDoc({...doc,offers:doc.offers.map((o,i)=>i===index?{...o,duration:Number(e.target.value)}:o)})}/></label>
    <label className="field"><span className="field-label">Tarif per pertemuan (Rp)</span><input inputMode="numeric" value={offer.price} onChange={e=>setDoc({...doc,offers:doc.offers.map((o,i)=>i===index?{...o,price:e.target.value}:o)})}/></label>
  </div><button type="button" className="btn ghost" onClick={()=>setDoc({...doc,offers:doc.offers.filter((_,i)=>i!==index)})}>Hapus penawaran</button></div>)}</div>
  <div className="stack-sm"><div className="row between"><div><h2>Daerah yang bersedia didatangi</h2><p className="muted">Untuk les tatap muka; dapat berbeda dari tempat tinggal.</p></div><button type="button" className="btn secondary" onClick={()=>setDoc({...doc,areas:[...doc.areas,{province:"",regency:"",district:""}]})}>Tambah daerah</button></div>{doc.areas.map((area,index)=><div className="offer stack-sm" key={index}><div className="form-grid">{([ ["province","Provinsi"],["regency","Kabupaten / kota"],["district","Kecamatan (opsional)"] ] as const).map(([field,label])=><label className="field" key={field}><span className="field-label">{label}</span><input value={area[field]} onChange={e=>setDoc({...doc,areas:doc.areas.map((a,i)=>i===index?{...a,[field]:e.target.value}:a)})}/></label>)}</div><button type="button" className="btn ghost" onClick={()=>setDoc({...doc,areas:doc.areas.filter((_,i)=>i!==index)})}>Hapus daerah</button></div>)}</div>
  <p className="muted">Nama, WhatsApp, daerah, dan penawaran yang disetujui akan terlihat oleh publik. Profil lama tetap ditampilkan selama perubahan diperiksa.</p><div className="row"><button type="button" className="btn secondary" disabled={pending} onClick={()=>save("profile.save")}>Simpan draf</button><button type="button" className="btn" disabled={pending} onClick={()=>save("profile.submit")}>Ajukan pemeriksaan</button></div>{message&&<p role={failed?"alert":"status"} className={`notice ${failed?"error":"success"}`}>{message}</p>}</div>;
}
