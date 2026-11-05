import { PublicHeader } from "@/components/ui";
import { AuthForm } from "@/components/auth-form";
export default function Page(){return <><PublicHeader/><main id="main" className="auth-page"><div className="auth-intro"><p className="eyebrow">Untuk guru les mandiri</p><h1>Pasang iklan les<br/>Anda hari ini.</h1><p className="muted">Buat profil guru agar ditemukan calon murid. Mencatat murid dan jadwal tersedia juga, tetapi sepenuhnya opsional.</p></div><AuthForm mode="signup"/></main></>;}
