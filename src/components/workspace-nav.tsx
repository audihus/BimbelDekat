"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard,Users,CalendarDays,UserRound,Settings,ShieldCheck } from "lucide-react";

export function NavLinks({role,restricted,mobile=false}:{role:string;restricted:boolean;mobile?:boolean}){
  const path=usePathname();
  const links=restricted?[{href:"/akun",label:"Akun",icon:Settings}]:role==="admin"?[{href:"/admin",label:"Moderasi",icon:ShieldCheck},{href:"/akun",label:"Akun",icon:Settings}]:[
    {href:"/dashboard",label:"Ringkasan",icon:LayoutDashboard},{href:"/murid",label:"Murid",icon:Users},{href:"/jadwal",label:"Jadwal",icon:CalendarDays},{href:"/profil",label:"Profil publik",icon:UserRound},{href:"/akun",label:"Akun",icon:Settings}
  ];
  const nodes=links.map(link=>{const active=path===link.href||path.startsWith(link.href+"/");return <Link key={link.href} href={link.href} aria-current={active?"page":undefined} className={`nav-link ${active?"active":""}`}><link.icon size={19} aria-hidden="true"/>{link.label}</Link>;});
  return mobile?<>{nodes}</>:<nav aria-label="Navigasi ruang kerja" className="nav-links">{nodes}</nav>;
}
