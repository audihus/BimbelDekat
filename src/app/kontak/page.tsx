import { Mail,MessageCircle } from "lucide-react";
import { PublicHeader,PublicFooter } from "@/components/ui";
import { contactChannels } from "@/lib/contact";
import { APP_NAME } from "@/lib/brand";

export const metadata={title:"Kontak dan bantuan"};
export const dynamic="force-dynamic";

export default function Contact(){
  const {email,whatsapp}=contactChannels();
  return <><PublicHeader/><main id="main" className="public-main"><article className="legal">
    <div className="page-heading"><p className="eyebrow">Kontak</p><h1>Butuh bantuan?</h1><p>Hubungi tim {APP_NAME} untuk pertanyaan, kendala akun, atau laporan profil guru.</p></div>
    {email||whatsapp?<div className="stack-sm">
      {email&&<p className="row"><Mail size={19} aria-hidden="true"/><a className="plain-link" href={`mailto:${email}`}>{email}</a></p>}
      {whatsapp&&<p className="row"><MessageCircle size={19} aria-hidden="true"/><a className="plain-link" href={whatsapp.href} target="_blank" rel="noopener noreferrer">WhatsApp {whatsapp.number}</a></p>}
    </div>:<p role="status" className="notice warning">Saluran kontak belum tersedia.</p>}
    <h2>Melaporkan profil guru</h2>
    <p>Sertakan nama guru dan alasan laporan, atau gunakan tautan &ldquo;Laporkan profil ini&rdquo; di halaman guru yang bersangkutan.</p>
    <h2>Pembayaran</h2>
    <p>Pembayaran diatur langsung antara orang tua dan guru, di luar {APP_NAME}. Kami tidak dapat menengahi urusan pembayaran.</p>
  </article></main><PublicFooter/></>;
}
