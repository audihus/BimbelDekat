import { Brand } from "./ui";
import { NavLinks } from "./workspace-nav";
import { LogoutButton } from "./command-form";
import type { Account } from "@/lib/domain/types";
import { zoneLabel } from "@/lib/format";

export function WorkspaceShell({account,children}:{account:Account;children:React.ReactNode}){
  return <div className="shell"><aside className="sidebar"><Brand/><p className="nav-section">{account.role==="admin"?"Pengelola":"Ruang kerja Anda"}</p><NavLinks role={account.role} restricted={account.status==="deletion_pending"}/><div className="sidebar-footer"><p className="muted" style={{fontSize:".8rem",padding:"0 12px 12px"}}>Mengajar lebih teratur,<br/>satu pertemuan setiap waktu.</p><LogoutButton/></div></aside><div className="shell-content"><header className="topbar"><Brand/><p className="muted desktop-label" style={{fontSize:".85rem"}}>{new Intl.DateTimeFormat("id-ID",{dateStyle:"full",timeZone:account.timezone}).format(new Date())} · {zoneLabel(account.timezone)}</p><div className="row"><div className="avatar" aria-hidden="true">{account.display_name.slice(0,1).toUpperCase()}</div><span className="account-name">{account.display_name}</span></div></header><main id="main" className="workspace-main">{children}</main></div><nav className="mobile-nav" aria-label="Navigasi ruang kerja"><NavLinks role={account.role} restricted={account.status==="deletion_pending"} mobile/></nav></div>;
}
