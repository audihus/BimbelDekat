import { Check } from "lucide-react";
import { PublicHeader } from "@/components/ui";
import { AuthForm } from "@/components/auth-form";
export const metadata={title:"Daftar jadi guru"};
const perks=["Iklan bimbel Anda muncul saat orang tua mencari guru","Orang tua menghubungi langsung lewat WhatsApp","Anda yang menentukan tarif dan wilayah mengajar"];
export default function Page(){return <><PublicHeader/><main id="main" className="auth-page"><div className="auth-intro"><p className="eyebrow">Untuk guru bimbel privat</p><h1>Daftarkan diri Anda, biar murid yang mencari.</h1><ul className="check-list" style={{marginTop:8}}>{perks.map(t=><li key={t}><Check size={18} className="done" aria-hidden="true"/><span>{t}</span></li>)}</ul></div><AuthForm mode="signup"/></main></>;}
