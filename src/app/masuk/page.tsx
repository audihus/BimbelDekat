import { PublicHeader } from "@/components/ui";
import { AuthForm } from "@/components/auth-form";
export default function Page(){return <><PublicHeader/><main id="main" className="auth-page"><div className="auth-intro"><p className="eyebrow">Ruang kerja guru les</p><h1>Lebih tenang mengajar.<br/>Lebih rapi mencatat.</h1><p className="muted">Jadwal, murid, jatah pertemuan, dan pembayaran tersimpan bersama. Fokus Anda tetap pada mengajar.</p></div><AuthForm/></main></>;}
