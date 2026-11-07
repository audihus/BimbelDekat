import Link from "next/link";
import { GraduationCap, FolderOpen, ArrowLeft } from "lucide-react";
import { APP_NAME,APP_TAGLINE } from "@/lib/brand";

export function Brand(){return <Link href="/" className="brand" aria-label={`${APP_NAME}, halaman awal`}><span className="brand-mark"><GraduationCap size={23} aria-hidden="true"/></span><span>Bimbel<span style={{color:"var(--primary)"}}>Dekat</span></span></Link>;}
// Header publik sengaja hanya memuat logo dan dua tujuan: Cari bimbel (orang tua) dan Untuk guru. Tanpa tombol Masuk/Daftar di sini.
// `anchors` dipakai halaman depan: tautan menuju bagian di halaman itu sendiri, menggantikan tiga tujuan di atas.
export function PublicHeader({current,anchors}:{current?:"beranda"|"orangtua"|"guru";anchors?:{href:string;label:string}[]}){const item=(key:NonNullable<typeof current>,href:string,label:string)=><Link href={href} aria-current={current===key?"page":undefined} className={current===key?"active":""}>{label}</Link>;return <div className="public-header-wrap"><header className="public-header"><Brand/><nav aria-label="Navigasi utama" className="public-nav">{anchors?anchors.map(a=><Link key={a.href} href={a.href}>{a.label}</Link>):<>{item("beranda","/","Beranda")}{item("orangtua","/cari","Cari bimbel")}{item("guru","/untuk-guru","Untuk guru")}</>}</nav></header></div>;}
// Tombol kembali yang jelas terlihat sekilas (bukan tautan teks kecil).
export function BackLink({href,children}:{href:string;children:React.ReactNode}){return <Link href={href} className="back-btn"><ArrowLeft size={18} aria-hidden="true"/>{children}</Link>;}
export function PublicFooter(){return <footer className="public-footer"><div className="footer-grid"><div className="stack-sm"><Brand/><p className="muted" style={{fontSize:".9rem"}}>{APP_TAGLINE}.</p><p className="muted" style={{fontSize:".85rem"}}>{APP_NAME} mempertemukan orang tua dan guru. Pembayaran diatur langsung antara keduanya.</p></div><nav aria-label="Untuk orang tua" className="stack-sm"><h2>Untuk orang tua</h2><Link href="/cari">Cari bimbel</Link></nav><nav aria-label="Untuk guru" className="stack-sm"><h2>Untuk guru</h2><Link href="/untuk-guru">Pasang iklan bimbel</Link><Link href="/daftar">Daftar jadi guru</Link><Link href="/masuk">Sudah punya akun? Masuk</Link></nav></div><div className="footer-copy"><span>© 2026 {APP_NAME}</span><Link href="/privasi">Kebijakan Privasi</Link><Link href="/kontak">Kontak</Link></div></footer>;}
// Warna avatar tetap untuk satu nama, supaya kartu tidak seragam tetapi tidak berganti-ganti saat dimuat ulang.
export const avatarTone=(name:string)=>String([...name].reduce((n,c)=>n+c.charCodeAt(0),0)%5);
// Foto profil bila ada, selain itu huruf awal nama. <img> biasa (bukan next/image): fotonya kecil dan dilayani route sendiri.
export function TeacherAvatar({name,src}:{name:string;src?:string|null}){
  if(src){
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="avatar large photo" src={src} alt={`Foto ${name}`} width={68} height={68} loading="lazy" decoding="async"/>;
  }
  return <div className="avatar large" data-tone={avatarTone(name)}>{name.slice(0,1).toUpperCase()}</div>;
}
export function Badge({children,tone=""}:{children:React.ReactNode;tone?:string}){return <span className={`badge ${tone}`}>{children}</span>;}
export function Empty({title,children,action}:{title:string;children?:React.ReactNode;action?:React.ReactNode}){return <div className="empty"><FolderOpen size={34} strokeWidth={1.4} aria-hidden="true"/><h3>{title}</h3>{children&&<p>{children}</p>}{action}</div>;}
export function Field({label,name,children,...props}:{label:string;name:string;children?:React.ReactNode}&React.InputHTMLAttributes<HTMLInputElement>){return <label className="field"><span className="field-label">{label}</span>{children??<input name={name} {...props}/>}</label>;}
export function SelectField({label,name,children,...props}:{label:string;name:string;children:React.ReactNode}&React.SelectHTMLAttributes<HTMLSelectElement>){return <label className="field"><span className="field-label">{label}</span><select name={name} {...props}>{children}</select></label>;}
export function TextareaField({label,name,...props}:{label:string;name:string}&React.TextareaHTMLAttributes<HTMLTextAreaElement>){return <label className="field"><span className="field-label">{label}</span><textarea name={name} {...props}/></label>;}
