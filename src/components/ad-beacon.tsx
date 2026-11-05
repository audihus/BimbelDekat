"use client";
import { useEffect } from "react";

function send(profile:string,kind:"view"|"wa_click"){
  try { void fetch("/api/ad-event",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({profile,kind}),keepalive:true}).catch(()=>{}); } catch { /* statistik tidak boleh mengganggu halaman */ }
}

// Menghitung satu tayangan per profil per sesi browser, supaya memuat ulang halaman tidak menggelembungkan angka.
export function AdBeacon({profile}:{profile:string}){
  useEffect(()=>{
    const key=`ad-view:${profile}`;
    try { if(sessionStorage.getItem(key))return; sessionStorage.setItem(key,"1"); } catch { /* tanpa sessionStorage: hitung saja */ }
    send(profile,"view");
  },[profile]);
  return null;
}

// Tautan WhatsApp biasa yang juga mencatat klik; tautan tetap terbuka walau pencatatan gagal.
export function WhatsappLink({profile,href,children,className="btn wa"}:{profile:string;href:string;children:React.ReactNode;className?:string}){
  return <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={()=>send(profile,"wa_click")}>{children}</a>;
}
