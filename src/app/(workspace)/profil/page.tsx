import { requireWorkspace } from "@/lib/session";
import { Badge } from "@/components/ui";
import { CommandForm } from "@/components/command-form";
import { ProfileEditor } from "@/components/profile-editor";
import { adStatus } from "@/lib/ad-checklist";
import Link from "next/link";

export default async function ProfilePage(){
  const {data}=await requireWorkspace();const profile=data.profile;const status=adStatus(profile);
  return <div className="stack">
    <div className="page-heading"><p className="eyebrow">Iklan di direktori guru</p><h1 style={{marginTop:8}}>Iklan saya</h1><p>Perkenalkan layanan Anda kepada calon murid dan wali. Iklan baru dan perubahannya diperiksa pengelola sebelum tayang.</p></div>
    <section className={`card status-card ${status.tone} stack`}>
      <div className="row between"><h2>{status.title}</h2><Badge tone={profile?.visible?"green":"amber"}>{profile?.visible?"Terlihat di direktori":"Belum terlihat di direktori"}</Badge></div>
      <p className="muted">{status.detail}</p>
      {profile?.published&&<div className="row"><Link className="btn secondary" href={`/guru/${profile.id}`}>Lihat profil publik</Link>{!profile.admin_hidden&&<><CommandForm inline action="profile.accepting" fixed={{accepting:!profile.accepting}} buttonLabel={profile.accepting?"Tandai tidak menerima murid":"Tandai menerima murid"} tone="secondary"/><CommandForm inline action="profile.visibility" fixed={{visible:!profile.visible}} buttonLabel={profile.visible?"Jeda iklan":"Aktifkan iklan"} tone="secondary"/></>}</div>}
    </section>
    <section className="card"><h2 style={{marginBottom:20}}>Isi iklan</h2><ProfileEditor profile={profile}/></section>
  </div>;
}
