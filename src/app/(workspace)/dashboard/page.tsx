import Link from "next/link";
import { Users,CalendarDays,BookOpen,Wallet,ArrowRight,Plus,CheckCircle2,Circle,Eye,MessageCircle,Lightbulb } from "lucide-react";
import { requireWorkspace } from "@/lib/session";
import { serverSupabase } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/config";
import { rupiah } from "@/lib/format";
import { adChecklist,adStatus } from "@/lib/ad-checklist";
import { sampleProfiles } from "@/lib/sample-profiles";
import { Badge,Empty } from "@/components/ui";
import { CommandForm } from "@/components/command-form";
import { LessonList } from "@/components/lesson-list";
import { ShareAd } from "@/components/share-ad";
import { TeacherCard } from "@/components/teacher-card";

interface AdStats { last7:{views:number;wa_clicks:number}; last30:{views:number;wa_clicks:number} }
// Statistik hanya pelengkap: bila gagal dimuat, Beranda tetap tampil tanpa angka.
async function loadStats():Promise<AdStats|null>{
  try { const {data,error}=await (await serverSupabase()).rpc("ad_stats_summary"); return error?null:data as AdStats; }
  catch { return null; }
}

// Tiga contoh iklan yang bagus. Dibuka bila iklan belum tayang (guru butuh contoh), dilipat bila sudah tayang.
function Samples({open,cta}:{open:boolean;cta:boolean}){
  return <section className="card" aria-labelledby="contoh"><details open={open}><summary><h2 id="contoh">Contoh iklan yang menarik</h2></summary>
    <p className="muted" style={{fontSize:".92rem",marginBottom:18}}>Tiga contoh iklan lengkap. Seluruhnya fiktif (bukan guru sungguhan), hanya sebagai acuan penulisan.</p>
    <div className="grid-3">{sampleProfiles.map(s=><div key={s.document.name} className="stack-sm"><TeacherCard document={s.document} accepting/><div className="offer"><p className="row" style={{fontWeight:700,fontSize:".88rem",gap:6}}><Lightbulb size={15} aria-hidden="true"/>Keunggulan</p><ul style={{margin:"8px 0 0",paddingLeft:18,fontSize:".85rem"}} className="muted">{s.why.map(w=><li key={w}>{w}</li>)}</ul></div></div>)}</div>
    {cta&&<div className="row" style={{marginTop:20}}><Link className="btn" href="/profil">Buat iklan saya <ArrowRight size={16} aria-hidden="true"/></Link></div>}
  </details></section>;
}

export default async function Dashboard(){
  const {account,data}=await requireWorkspace();
  const profile=data.profile;
  const status=adStatus(profile);
  const checklist=adChecklist(profile?.draft??null);
  const live=status.key==="live"&&profile;
  const stats=live?await loadStats():null;
  const active=data.students.filter(s=>!s.archived);
  const scheduled=data.lessons.filter(l=>l.status==="scheduled"&&Date.parse(l.ends_at)>=Date.parse(new Date().toISOString()));
  const due=data.packages.reduce((total,p)=>total+BigInt(p.due),0n);
  const low=data.packages.filter(p=>!p.closed_at&&p.remaining<=1&&active.some(s=>s.id===p.student_id));
  const name=profile?.published?.name||profile?.draft.name||account.display_name;
  const needsAd=["none","draft","rejected"].includes(status.key);
  return <div className="stack">
    <div className="page-heading"><p className="eyebrow">Beranda</p><h1>Selamat datang, {account.display_name.split(" ")[0]}.</h1><p>Ringkasan iklan bimbel Anda.</p></div>

    <section className={`card status-card ${status.tone} stack`} aria-labelledby="status-iklan">
      <div className="row between"><h2 id="status-iklan">{status.title}</h2><Badge tone={status.tone}>{live?"Tayang":"Iklan"}</Badge></div>
      <p className="muted">{status.detail}</p>
      <div className="row">
        {status.action&&<Link className="btn" href={status.action.href}>{status.action.label} <ArrowRight size={16} aria-hidden="true"/></Link>}
        {live&&<CommandForm inline action="profile.accepting" fixed={{accepting:!profile.accepting}} buttonLabel={profile.accepting?"Tandai sedang penuh":"Tandai menerima murid baru"} tone="secondary"/>}
      </div>
    </section>

    {needsAd&&<Samples open cta={false}/>}

    <div className="grid-2">
      <section className="card stack" aria-labelledby="kelengkapan">
        <div className="row between"><h2 id="kelengkapan">Kelengkapan iklan</h2><span className="number" style={{fontWeight:700}}>{checklist.percent}%</span></div>
        <div className="progress" role="progressbar" aria-valuenow={checklist.percent} aria-valuemin={0} aria-valuemax={100} aria-label="Kelengkapan iklan"><span style={{width:`${checklist.percent}%`}}/></div>
        <ul className="check-list">{checklist.items.map(item=><li key={item.key}>{item.done?<CheckCircle2 size={18} className="done" aria-label="Selesai"/>:<Circle size={18} className="todo" aria-label="Belum"/>}<span>{item.label}{!item.done&&<span className="hint">{item.hint}</span>}</span></li>)}</ul>
        {!checklist.complete&&<Link href="/profil" className="text-link">Lengkapi di Iklan saya</Link>}
      </section>

      <section className="card stack" aria-labelledby="kinerja">
        <h2 id="kinerja">Kunjungan iklan</h2>
        {live?(stats?<>
          <div className="grid-2" style={{gap:12}}>
            <div className="offer"><p className="stat-label row"><Eye size={15} aria-hidden="true"/>Dilihat, 7 hari</p><p className="stat-value">{stats.last7.views}</p></div>
            <div className="offer"><p className="stat-label row"><MessageCircle size={15} aria-hidden="true"/>Klik WhatsApp, 7 hari</p><p className="stat-value">{stats.last7.wa_clicks}</p></div>
          </div>
          <p className="muted" style={{fontSize:".85rem"}}>30 hari terakhir: {stats.last30.views} dilihat, {stats.last30.wa_clicks} klik WhatsApp.</p>
          <p className="muted" style={{fontSize:".78rem"}}>Angka bersifat perkiraan. Kunjungan Anda sendiri dan mesin pencari dapat ikut terhitung.</p>
        </>:<p className="muted">Data belum dapat dimuat. Muat ulang halaman.</p>)
        :<Empty title="Belum ada data">Data tampil setelah iklan Anda tayang.</Empty>}
      </section>
    </div>

    {live&&<section className="card stack" aria-labelledby="bagikan"><h2 id="bagikan">Bagikan iklan Anda</h2><p className="muted" style={{fontSize:".92rem"}}>Kirim tautan ini ke grup orang tua atau media sosial.</p><ShareAd url={`${siteUrl()}/guru/${profile.id}`} name={name}/></section>}

    {!needsAd&&<Samples open={false} cta={false}/>}

    <section className="card stack" aria-labelledby="catatan">
      <div className="row between"><div><p className="eyebrow">Opsional</p><h2 id="catatan" style={{marginTop:8}}>Catatan bimbel</h2></div><Link href="/murid#tambah" className="btn secondary"><Plus size={16} aria-hidden="true"/>Tambah murid</Link></div>
      {active.length?<>
        <div className="grid-4">{[{label:"Murid aktif",value:String(active.length),icon:Users},{label:"Jadwal mendatang",value:String(scheduled.length),icon:CalendarDays},{label:"Paket hampir habis",value:String(low.length),icon:BookOpen},{label:"Belum dibayar",value:rupiah(due.toString()),icon:Wallet}].map(item=><div className="offer" key={item.label}><div className="row between"><p className="stat-label">{item.label}</p><span className="stat-icon"><item.icon size={18} aria-hidden="true"/></span></div><p className="stat-value" style={{marginTop:8,fontSize:item.label==="Belum dibayar"?"1.3rem":undefined}}>{item.value}</p></div>)}</div>
        <div className="grid-2">
          <div><div className="card-header"><h3>Pertemuan mendatang</h3><Link href="/jadwal" className="text-link">Buka jadwal</Link></div><LessonList lessons={scheduled.slice(0,3)} students={data.students} packages={data.packages} timezone={account.timezone} compact/></div>
          <div><div className="card-header"><h3>Perlu diperpanjang</h3><Badge tone="amber">{low.length} paket</Badge></div>{low.length?<div className="record-list">{low.map(pack=><Link key={pack.id} href={`/murid/${pack.student_id}`} className="record"><span className="avatar"><BookOpen size={19} aria-hidden="true"/></span><div className="grow"><p className="record-name">{data.students.find(s=>s.id===pack.student_id)?.name}</p><p className="record-meta">{pack.name} · {pack.remaining===0?"Pertemuan habis":"Tinggal 1 pertemuan"}</p></div><ArrowRight size={17} aria-hidden="true"/></Link>)}</div>:<p className="muted" style={{fontSize:".9rem"}}>Tidak ada paket yang perlu diperpanjang.</p>}</div>
        </div>
      </>:<p className="muted">Catat murid, jadwal, dan pembayaran di sini. Fitur ini opsional; iklan Anda tetap tayang tanpanya.</p>}
    </section>
  </div>;
}
