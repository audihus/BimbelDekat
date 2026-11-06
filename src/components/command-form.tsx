"use client";

import { useRef,useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle,Check } from "lucide-react";
import { localToInstant,type IndonesiaZone } from "@/lib/domain/rules";
import { addMinutes } from "@/lib/calendar";

export function CommandForm({action,fixed={},buttonLabel="Simpan",tone="",inline=false,reset=false,timezone="Asia/Jakarta",quickLesson=false,children}:{action:string;fixed?:Record<string,unknown>;buttonLabel?:string;tone?:string;inline?:boolean;reset?:boolean;timezone?:IndonesiaZone;quickLesson?:boolean;children?:React.ReactNode}){
  const router=useRouter();
  const [pending,setPending]=useState(false);
  const [message,setMessage]=useState("");
  const [failed,setFailed]=useState(false);
  const [shareUrl,setShareUrl]=useState("");
  const last=useRef<{signature:string;id:string}|null>(null);
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault(); if(pending)return;
    const form=event.currentTarget;
    const payload:Record<string,unknown>={...Object.fromEntries(new FormData(form)),...fixed};
    try{
      // Formulir pertemuan singkat: tanggal + jam + lama menjadi waktu mulai dan selesai.
      if(quickLesson){const start=`${payload.date}T${payload.time}`;payload.starts_at=start;payload.ends_at=addMinutes(start,Number(payload.minutes));delete payload.date;delete payload.time;delete payload.minutes;}
      for(const field of ["quota","opening_used","delta"]) if(field in payload) payload[field]=Number(payload[field]);
      for(const field of ["archived","charged","accepting","visible"]) if(field in payload && typeof payload[field]==="string") payload[field]=payload[field]==="true" || payload[field]==="on";
      for(const field of ["starts_at","ends_at","paid_at"]) if(typeof payload[field]==="string") {if(payload[field]) payload[field]=localToInstant(payload[field] as string,timezone);else delete payload[field];}
      const signature=JSON.stringify({action,payload});
      if(!last.current || last.current.signature!==signature) last.current={signature,id:crypto.randomUUID()};
      setPending(true);setMessage("");setShareUrl("");
      const response=await fetch("/api/commands",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,payload,requestId:last.current.id})});
      const result=await response.json();
      if(!response.ok) throw new Error(result.error??"Belum tersimpan. Silakan coba kembali.");
      setFailed(false);setMessage(result.message??"Perubahan tersimpan.");setShareUrl(result.shareUrl??"");last.current=null;
      if(reset)form.reset();router.refresh();
    }catch(error){setFailed(true);setMessage(error instanceof Error?error.message:"Belum tersimpan. Periksa koneksi dan coba kembali.");}
    finally{setPending(false);}
  }
  return <form onSubmit={submit} className={`command-form ${inline?"inline":""}`}><fieldset disabled={pending}>{children}<div className="form-actions"><button className={`btn ${tone}`} type="submit" disabled={pending}>{pending?<LoaderCircle size={16} className="spin" aria-hidden="true"/>:null}{pending?"Menyimpan…":buttonLabel}</button></div></fieldset>{message&&<div role={failed?"alert":"status"} className={`notice ${failed?"error":"success"}`}><span className="row">{!failed&&<Check size={15} aria-hidden="true"/>}{message}</span></div>}{shareUrl&&<div className="stack-sm"><p className="muted" style={{fontSize:".85rem"}}>Tautan berlaku tujuh hari. Siapa pun yang memegangnya dapat membaca ringkasan murid ini.</p><div className="token-url">{shareUrl}</div><button className="btn secondary" type="button" onClick={async()=>{try{await navigator.clipboard.writeText(shareUrl);setMessage("Tautan disalin.");}catch{setMessage("Pilih dan salin tautan di atas.");}}}>Salin tautan</button></div>}</form>;
}

export function LogoutButton({all=false}:{all?:boolean}){
  const [pending,setPending]=useState(false);const [error,setError]=useState("");
  async function logout(){setPending(true);setError("");try{const response=await fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:all?"logout-all":"logout"})});if(!response.ok)throw new Error();window.location.assign("/masuk");}catch{setError("Belum berhasil keluar. Coba lagi.");setPending(false);}}
  return <div><button type="button" className="btn ghost" onClick={logout} disabled={pending}>{pending?"Memproses…":all?"Keluar dari semua perangkat":"Keluar"}</button>{error&&<p role="alert" className="muted">{error}</p>}</div>;
}
