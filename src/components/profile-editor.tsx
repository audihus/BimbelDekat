"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Offer, ProfileDocument, TeacherProfile } from "@/lib/domain/types";
import { RegionSelect } from "./region-select";
import { TeacherCard } from "./teacher-card";

const empty:ProfileDocument={name:"",about:"",phone:"",province:"",regency:"",areas:[],offers:[]};
// Saran saja; guru tetap bebas mengetik pelajaran lain.
const subjects=["Matematika","IPA","Fisika","Kimia","Biologi","Bahasa Inggris","Bahasa Indonesia","Calistung","Mengaji / Iqro","Coding","Musik","Persiapan UTBK"];

export function ProfileEditor({profile}:{profile:TeacherProfile|null}){
  const [doc,setDoc]=useState<ProfileDocument>(profile?.draft??empty);
  const [pending,setPending]=useState(false);const [message,setMessage]=useState("");const [failed,setFailed]=useState(false);
  const router=useRouter();
  const setOffer=(index:number,change:Partial<Offer>)=>setDoc({...doc,offers:doc.offers.map((o,i)=>i===index?{...o,...change}:o)});
  async function save(action:"profile.save"|"profile.submit"){
    setPending(true);setMessage("");try{
      const response=await fetch("/api/commands",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,payload:{document:doc},requestId:crypto.randomUUID()})});
      const result=await response.json();if(!response.ok)throw new Error(result.error);
      setFailed(false);setMessage(action==="profile.submit"?"Iklan dikirim untuk dicek tim kami.":"Draf iklan tersimpan.");router.refresh();
    }catch(error){setFailed(true);setMessage(error instanceof Error?error.message:"Iklan belum tersimpan. Coba lagi.");}finally{setPending(false);}
  }
  return <div className="grid-2" style={{alignItems:"start"}}>
    <div className="stack">
      <section className="stack-sm" aria-labelledby="ed-identitas"><h2 id="ed-identitas">1. Siapa Anda</h2>
        <div className="form-grid">
          <label className="field"><span className="field-label">Nama yang ditampilkan</span><input value={doc.name} onChange={e=>setDoc({...doc,name:e.target.value})} autoComplete="name"/></label>
          <label className="field"><span className="field-label">Nomor WhatsApp Anda</span><input value={doc.phone} inputMode="tel" placeholder="Contoh: 081234567890" onChange={e=>setDoc({...doc,phone:e.target.value})} autoComplete="tel"/></label>
          <RegionSelect withDistrict={false} value={{province:doc.province,regency:doc.regency,district:""}} onChange={r=>setDoc({...doc,province:r.province,regency:r.regency})}/>
          <label className="field span-2"><span className="field-label">Tentang Anda dan cara mengajar</span><textarea value={doc.about} maxLength={3000} placeholder="Ceritakan pengalaman, cara mengajar, dan murid seperti apa yang cocok. Tulis minimal 100 huruf." onChange={e=>setDoc({...doc,about:e.target.value})}/><small>{doc.about.trim().length} huruf</small></label>
        </div>
      </section>

      <section className="stack-sm" aria-labelledby="ed-penawaran">
        <div className="row between"><h2 id="ed-penawaran">2. Les yang Anda ajarkan</h2><button type="button" className="btn secondary" onClick={()=>setDoc({...doc,offers:[...doc.offers,{subject:"",level:"SD",mode:"online",duration:60,price:""}]})}>Tambah les</button></div>
        <datalist id="saran-pelajaran">{subjects.map(s=><option key={s} value={s}/>)}</datalist>
        {doc.offers.length===0&&<p className="muted">Tambahkan minimal satu les agar iklan Anda muncul di hasil pencarian.</p>}
        {doc.offers.map((offer,index)=><div className="offer stack-sm" key={index}><div className="form-grid">
          <label className="field"><span className="field-label">Pelajaran</span><input list="saran-pelajaran" value={offer.subject} onChange={e=>setOffer(index,{subject:e.target.value})}/></label>
          <label className="field"><span className="field-label">Kelas</span><select value={offer.level} onChange={e=>setOffer(index,{level:e.target.value})}><option>SD</option><option>SMP</option><option>SMA</option></select></label>
          <label className="field"><span className="field-label">Cara belajar</span><select value={offer.mode} onChange={e=>setOffer(index,{mode:e.target.value as "online"|"offline"})}><option value="online">Online</option><option value="offline">Tatap muka (datang ke rumah)</option></select></label>
          <label className="field"><span className="field-label">Lama (menit)</span><input type="number" min="1" value={offer.duration} onChange={e=>setOffer(index,{duration:Number(e.target.value)})}/></label>
          <label className="field span-2"><span className="field-label">Tarif per pertemuan (Rp, angka saja)</span><input inputMode="numeric" value={offer.price} placeholder="Contoh: 75000" onChange={e=>setOffer(index,{price:e.target.value.replace(/\D/g,"")})}/></label>
        </div><button type="button" className="btn ghost" onClick={()=>setDoc({...doc,offers:doc.offers.filter((_,i)=>i!==index)})}>Hapus les ini</button></div>)}
      </section>

      <section className="stack-sm" aria-labelledby="ed-daerah">
        <div className="row between"><div><h2 id="ed-daerah">3. Wilayah yang bisa Anda datangi</h2><p className="muted">Untuk les tatap muka. Boleh berbeda dari tempat tinggal Anda.</p></div><button type="button" className="btn secondary" onClick={()=>setDoc({...doc,areas:[...doc.areas,{province:"",regency:"",district:""}]})}>Tambah wilayah</button></div>
        {doc.areas.map((area,index)=><div className="offer stack-sm" key={index}><div className="form-grid"><RegionSelect value={area} onChange={r=>setDoc({...doc,areas:doc.areas.map((a,i)=>i===index?r:a)})}/></div><button type="button" className="btn ghost" onClick={()=>setDoc({...doc,areas:doc.areas.filter((_,i)=>i!==index)})}>Hapus wilayah</button></div>)}
      </section>

      <p className="muted">Nama, WhatsApp, wilayah, dan les Anda akan terlihat oleh semua orang setelah disetujui. Iklan yang lama tetap tayang selama perubahan dicek.</p>
      <div className="row"><button type="button" className="btn secondary" disabled={pending} onClick={()=>save("profile.save")}>Simpan draf</button><button type="button" className="btn" disabled={pending} onClick={()=>save("profile.submit")}>Kirim untuk dicek</button></div>
      {message&&<p role={failed?"alert":"status"} className={`notice ${failed?"error":"success"}`}>{message}</p>}
    </div>

    <aside className="stack-sm" aria-label="Pratinjau iklan"><h2>Pratinjau di pencarian</h2><p className="muted" style={{fontSize:".85rem"}}>Seperti inilah kartu Anda terlihat oleh orang tua. Berubah langsung saat Anda mengisi.</p><TeacherCard document={doc} accepting={profile?.accepting??true}/></aside>
  </div>;
}
