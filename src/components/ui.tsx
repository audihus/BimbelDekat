import Link from "next/link";
import { GraduationCap, FolderOpen } from "lucide-react";

export function Brand(){return <Link href="/" className="brand" aria-label="Les Privat, halaman awal"><span className="brand-mark"><GraduationCap size={23} aria-hidden="true"/></span>Les Privat<span style={{color:"var(--primary)"}}>.</span></Link>;}
export function PublicHeader(){return <header className="public-header"><Brand/><nav aria-label="Navigasi utama" className="public-nav"><Link className="optional" href="/cari">Cari guru</Link><Link className="btn secondary" href="/masuk">Masuk</Link><Link className="btn" href="/daftar"><span className="cta-long">Buat profil guru</span><span className="cta-short">Buat profil</span></Link></nav></header>;}
export function PublicFooter(){return <footer className="public-footer">Les Privat · Tempat guru les mandiri di Indonesia memasang iklan dan dicari calon murid.</footer>;}
export function Badge({children,tone=""}:{children:React.ReactNode;tone?:string}){return <span className={`badge ${tone}`}>{children}</span>;}
export function Empty({title,children,action}:{title:string;children?:React.ReactNode;action?:React.ReactNode}){return <div className="empty"><FolderOpen size={34} strokeWidth={1.4} aria-hidden="true"/><h3>{title}</h3>{children&&<p>{children}</p>}{action}</div>;}
export function Field({label,name,children,...props}:{label:string;name:string;children?:React.ReactNode}&React.InputHTMLAttributes<HTMLInputElement>){return <label className="field"><span className="field-label">{label}</span>{children??<input name={name} {...props}/>}</label>;}
export function SelectField({label,name,children,...props}:{label:string;name:string;children:React.ReactNode}&React.SelectHTMLAttributes<HTMLSelectElement>){return <label className="field"><span className="field-label">{label}</span><select name={name} {...props}>{children}</select></label>;}
export function TextareaField({label,name,...props}:{label:string;name:string}&React.TextareaHTMLAttributes<HTMLTextAreaElement>){return <label className="field"><span className="field-label">{label}</span><textarea name={name} {...props}/></label>;}
