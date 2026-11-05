import { redirect } from "next/navigation";
import { requireAccount } from "@/lib/session";
import { serverSupabase } from "@/lib/supabase/server";
import { Badge,Empty } from "@/components/ui";
import { ModerationForm,type Decision } from "@/components/moderation-form";
import { dateTime,rupiah } from "@/lib/format";
import type { ProfileDocument,TeacherProfile } from "@/lib/domain/types";

type QueueItem=TeacherProfile&{updated_at:string};

const approve:Decision={decision:"approve",label:"Setujui dan terbitkan",needsReason:false};
const reject:Decision={decision:"reject",label:"Tolak",tone:"danger",needsReason:true};
const hide:Decision={decision:"hide",label:"Sembunyikan dari direktori",tone:"danger",needsReason:true};
const unhide:Decision={decision:"unhide",label:"Tampilkan kembali",tone:"secondary",needsReason:true};

function status(item:QueueItem){
  if(item.review_status==="pending") return {label:"Menunggu pemeriksaan",tone:"amber"};
  if(item.admin_hidden) return {label:"Disembunyikan pengelola",tone:"amber"};
  if(item.review_status==="rejected") return {label:"Ditolak",tone:"amber"};
  if(item.published&&item.visible) return {label:"Terbit",tone:"green"};
  if(item.published) return {label:"Dijeda guru",tone:""};
  return {label:"Draf",tone:""};
}

function decisionsFor(item:QueueItem):Decision[]{
  if(item.review_status==="pending") return [approve,reject];
  if(item.admin_hidden) return [unhide];
  if(item.published&&item.visible) return [hide];
  return [];
}

function Summary({title,doc}:{title:string;doc:ProfileDocument}){
  return <div className="offer stack-sm"><p className="eyebrow">{title}</p>
    <p className="record-name">{doc.name||"(tanpa nama)"}</p>
    <p className="record-meta">WhatsApp: {doc.phone||"-"} · Tinggal di {[doc.regency,doc.province].filter(Boolean).join(", ")||"-"}</p>
    <p style={{whiteSpace:"pre-wrap"}}>{doc.about||"(belum ada deskripsi)"}</p>
    <div><p className="record-meta">Penawaran</p>{doc.offers.length?<ul style={{paddingLeft:20}}>{doc.offers.map((offer,index)=><li key={index}>{offer.subject} · {offer.level} · {offer.mode==="online"?"Online":"Tatap muka"} · {offer.duration} menit · {rupiah(offer.price)}</li>)}</ul>:<p className="muted">Belum ada.</p>}</div>
    <div><p className="record-meta">Daerah yang bersedia didatangi</p>{doc.areas.length?<ul style={{paddingLeft:20}}>{doc.areas.map((area,index)=><li key={index}>{[area.district,area.regency,area.province].filter(Boolean).join(", ")}</li>)}</ul>:<p className="muted">Tidak ada.</p>}</div>
  </div>;
}

function Entry({item,zone}:{item:QueueItem;zone:Parameters<typeof dateTime>[1]}){
  const state=status(item);const decisions=decisionsFor(item);
  const pending=item.review_status==="pending";
  return <article className="card stack"><div className="row between"><div><h3>{(pending?item.draft.name:item.published?.name)||item.draft.name||"(tanpa nama)"}</h3><p className="record-meta">Diperbarui {dateTime(item.updated_at,zone)}</p></div><Badge tone={state.tone}>{state.label}</Badge></div>
    {item.review_reason&&<p className="notice">Alasan terakhir: {item.review_reason}</p>}
    {pending?<div className="grid-2">{item.published&&<Summary title="Saat ini tampil di direktori" doc={item.published}/>}<Summary title={item.published?"Perubahan yang diajukan":"Pengajuan pertama"} doc={item.draft}/></div>:item.published?<Summary title="Tampil di direktori" doc={item.published}/>:null}
    {decisions.length>0&&<ModerationForm id={item.id} decisions={decisions}/>}
  </article>;
}

export default async function AdminPage(){
  const account=await requireAccount();
  if(account.role!=="admin") redirect("/dashboard");
  const {data,error}=await (await serverSupabase()).rpc("review_queue");
  const items=((data??[]) as QueueItem[]);
  const waiting=items.filter(item=>item.review_status==="pending");
  // Draf yang belum pernah diajukan atau diterbitkan bukan urusan pengelola.
  const reviewed=items.filter(item=>item.review_status!=="pending"&&(item.published||item.review_status==="rejected"));
  const drafts=items.length-waiting.length-reviewed.length;
  return <div className="stack"><div className="page-heading"><p className="eyebrow">Pengelola</p><h1 style={{marginTop:8}}>Moderasi profil</h1><p>Periksa profil yang diajukan guru sebelum tampil di direktori. Pengelola hanya melihat isi profil publik, bukan catatan murid atau pembayaran guru.</p></div>
    {error&&<p role="alert" className="notice error">Antrean belum dapat dimuat. Muat ulang halaman sebentar lagi.</p>}
    <section className="stack"><div className="row between"><h2>Menunggu pemeriksaan</h2><Badge tone={waiting.length?"amber":"green"}>{waiting.length} profil</Badge></div>
      {waiting.length?waiting.map(item=><Entry key={item.id} item={item} zone={account.timezone}/>):<div className="card"><Empty title="Tidak ada pengajuan yang menunggu">Pengajuan baru dan perubahan dari guru akan muncul di sini.</Empty></div>}
    </section>
    <section className="stack"><div className="row between"><h2>Sudah ditinjau</h2><Badge>{reviewed.length} profil</Badge></div>
      {reviewed.length?reviewed.map(item=><Entry key={item.id} item={item} zone={account.timezone}/>):<div className="card"><Empty title="Belum ada profil yang ditinjau"/></div>}
      {drafts>0&&<p className="muted">{drafts} draf yang belum diajukan tidak ditampilkan.</p>}
    </section></div>;
}
