"use client";
import { useState } from "react";
import { Copy,Share2,Check } from "lucide-react";

// Tombol bagikan iklan: salin tautan dan kirim lewat WhatsApp (tempat guru les paling sering berbagi).
export function ShareAd({url,name}:{url:string;name:string}){
  const [copied,setCopied]=useState(false);
  async function copy(){try{await navigator.clipboard.writeText(url);setCopied(true);setTimeout(()=>setCopied(false),2500);}catch{window.prompt("Salin tautan iklan Anda:",url);}}
  const text=`Halo! Saya ${name}, guru les privat. Lihat pelajaran dan tarif les saya di sini: ${url}`;
  return <div className="stack-sm">
    <p className="token-url" aria-label="Tautan iklan Anda">{url}</p>
    <div className="row">
      <button type="button" className="btn secondary" onClick={copy}>{copied?<Check size={16} aria-hidden="true"/>:<Copy size={16} aria-hidden="true"/>}{copied?"Tautan disalin":"Salin tautan"}</button>
      <a className="btn wa" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer"><Share2 size={16} aria-hidden="true"/>Bagikan lewat WhatsApp</a>
    </div>
  </div>;
}
