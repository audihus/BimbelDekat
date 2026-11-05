import Link from "next/link";
import { GraduationCap, FolderOpen } from "lucide-react";

export function Brand(){return <Link href="/" className="brand" aria-label="Les Privat, halaman awal"><span className="brand-mark"><GraduationCap size={23} aria-hidden="true"/></span>Les Privat</Link>;}
// Header publik sengaja hanya memuat logo dan "Cari guru": ajakan mendaftar ada di halaman depan, bukan di bilah navigasi.
export function PublicHeader(){return <header className="public-header"><Brand/><nav aria-label="Navigasi utama" className="public-nav"><Link href="/cari">Cari guru</Link></nav></header>;}
export function PublicFooter(){return <footer className="public-footer"><p>Les Privat · Tempat guru les privat mandiri dicari orang tua di daerahnya.</p><p className="row" style={{justifyContent:"center",gap:18}}><Link className="text-link" href="/cari">Cari guru</Link><Link className="text-link" href="/daftar">Daftar jadi guru</Link><Link className="text-link" href="/masuk">Sudah punya akun? Masuk</Link></p></footer>;}
// Warna avatar tetap untuk satu nama, supaya kartu tidak seragam tetapi tidak berganti-ganti saat dimuat ulang.
export const avatarTone=(name:string)=>String([...name].reduce((n,c)=>n+c.charCodeAt(0),0)%5);
export function Badge({children,tone=""}:{children:React.ReactNode;tone?:string}){return <span className={`badge ${tone}`}>{children}</span>;}
export function Empty({title,children,action}:{title:string;children?:React.ReactNode;action?:React.ReactNode}){return <div className="empty"><FolderOpen size={34} strokeWidth={1.4} aria-hidden="true"/><h3>{title}</h3>{children&&<p>{children}</p>}{action}</div>;}
export function Field({label,name,children,...props}:{label:string;name:string;children?:React.ReactNode}&React.InputHTMLAttributes<HTMLInputElement>){return <label className="field"><span className="field-label">{label}</span>{children??<input name={name} {...props}/>}</label>;}
export function SelectField({label,name,children,...props}:{label:string;name:string;children:React.ReactNode}&React.SelectHTMLAttributes<HTMLSelectElement>){return <label className="field"><span className="field-label">{label}</span><select name={name} {...props}>{children}</select></label>;}
export function TextareaField({label,name,...props}:{label:string;name:string}&React.TextareaHTMLAttributes<HTMLTextAreaElement>){return <label className="field"><span className="field-label">{label}</span><textarea name={name} {...props}/></label>;}
