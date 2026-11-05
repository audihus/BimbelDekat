import { PublicHeader } from "@/components/ui";
import { AuthForm } from "@/components/auth-form";
export default function Page(){return <><PublicHeader/><main id="main" className="auth-page"><div className="auth-intro"><p className="eyebrow">Untuk guru les mandiri</p><h1>Satu tempat untuk<br/>kegiatan les Anda.</h1><p className="muted">Catat murid yang sudah Anda ajar, atur pertemuan, dan bagikan profil untuk ditemukan calon murid.</p></div><AuthForm mode="signup"/></main></>;}
