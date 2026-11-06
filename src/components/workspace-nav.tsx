"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard,Users,CalendarDays,Megaphone,Settings,ShieldCheck } from "lucide-react";

type NavItem={href:string;label:string;icon:typeof Users};
const akun:NavItem={href:"/akun",label:"Akun",icon:Settings};
// Iklan didahulukan; pencatatan murid dan jadwal adalah kelompok kedua karena bersifat opsional.
const main:NavItem[]=[{href:"/dashboard",label:"Beranda",icon:LayoutDashboard},{href:"/profil",label:"Iklan saya",icon:Megaphone}];
const records:NavItem[]=[{href:"/murid",label:"Murid",icon:Users},{href:"/jadwal",label:"Jadwal",icon:CalendarDays}];

export function NavLinks({role,restricted,mobile=false}:{role:string;restricted:boolean;mobile?:boolean}){
  const path=usePathname();
  const render=(items:NavItem[])=>items.map(link=>{const active=path===link.href||path.startsWith(link.href+"/");return <Link key={link.href} href={link.href} aria-current={active?"page":undefined} className={`nav-link ${active?"active":""}`}><link.icon size={19} aria-hidden="true"/>{link.label}</Link>;});
  if(restricted||role==="admin"){
    const items=restricted?[akun]:[{href:"/admin",label:"Moderasi",icon:ShieldCheck},akun];
    return mobile?<>{render(items)}</>:<nav aria-label="Menu guru" className="nav-links">{render(items)}</nav>;
  }
  if(mobile)return <>{render([...main,...records,akun])}</>;
  return <nav aria-label="Menu guru" className="nav-links">{render([...main,akun])}<p className="nav-section nav-subsection" id="nav-catatan">Catatan les (opsional)</p><div className="nav-links" role="group" aria-labelledby="nav-catatan">{render(records)}</div></nav>;
}
