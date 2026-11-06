import Link from "next/link";
import { Plus,ArrowUpRight } from "lucide-react";
import { requireWorkspace } from "@/lib/session";
import { rupiah } from "@/lib/format";
import { Badge,Empty,Field,SelectField } from "@/components/ui";
import { CommandForm } from "@/components/command-form";

export default async function Students({searchParams}:{searchParams:Promise<{q?:string;status?:string}>}){
  const filters=await searchParams;const {data}=await requireWorkspace();
  const archived=filters.status==="arsip";
  const students=data.students.filter(s=>s.archived===archived&&s.name.toLocaleLowerCase("id-ID").includes((filters.q??"").toLocaleLowerCase("id-ID")));
  const totalActive=data.students.filter(s=>!s.archived).length;
  return <div className="stack">
    <div className="page-heading"><p className="eyebrow">Catatan les (opsional)</p><h1>Murid</h1><p>Catat murid Anda di sini supaya tidak lupa sisa pertemuan dan pembayaran.</p></div>
    <div className="grid-2" style={{gridTemplateColumns:"minmax(0,1.4fr) minmax(0,1fr)"}}>
      <section className="card">
        <div className="card-header"><h2>{archived?"Murid yang sudah berhenti":"Murid Anda"}</h2><Badge>{students.length} murid</Badge></div>
        {(totalActive>6||filters.q)&&<form className="row" action="/murid" style={{marginBottom:20}}><div className="field grow"><label htmlFor="search-student">Cari nama murid</label><input id="search-student" name="q" defaultValue={filters.q} placeholder="Ketik nama murid"/></div><input type="hidden" name="status" value={archived?"arsip":"aktif"}/><button type="submit" className="btn secondary" style={{alignSelf:"end"}}>Cari</button></form>}
        <div className="row" style={{marginBottom:18}}><Link className={`badge ${!archived?"green":""}`} href="/murid">Masih les</Link><Link className={`badge ${archived?"amber":""}`} href="/murid?status=arsip">Sudah berhenti</Link></div>
        {students.length?<div className="record-list">{students.map(student=>{
          const packs=data.packages.filter(p=>p.student_id===student.id&&!p.closed_at);
          const remaining=packs.reduce((n,p)=>n+p.remaining,0);
          const due=packs.reduce((n,p)=>n+BigInt(p.due),0n);
          return <Link key={student.id} href={`/murid/${student.id}`} className="record"><div className="avatar">{student.name.slice(0,1).toUpperCase()}</div><div className="grow"><p className="record-name">{student.name}</p><p className="record-meta">{student.level} · {packs.length?`sisa ${remaining} pertemuan`:"belum ada paket"}</p></div>{due>0n&&<Badge tone="amber">Belum dibayar {rupiah(due.toString())}</Badge>}<ArrowUpRight size={18} aria-hidden="true"/></Link>;
        })}</div>:<Empty title={filters.q?"Nama murid belum ditemukan":archived?"Belum ada murid yang berhenti":"Belum ada murid"}>{archived?"Murid yang berhenti les akan muncul di sini.":"Tambahkan murid pertama Anda di samping. Cukup namanya saja."}</Empty>}
      </section>
      <section id="tambah" className="card" style={{alignSelf:"start"}}>
        <h2 className="row" style={{marginBottom:20}}><Plus size={20} aria-hidden="true"/>Tambah murid</h2>
        <CommandForm action="student.create" buttonLabel="Simpan murid" reset><div className="stack-sm">
          <Field label="Nama murid" name="name" required maxLength={150}/>
          <SelectField label="Kelas" name="level"><option>SD</option><option>SMP</option><option>SMA</option></SelectField>
          <Field label="WhatsApp orang tua (boleh dikosongkan)" name="guardian_phone" type="tel" autoComplete="off" inputMode="tel" maxLength={30}/>
        </div></CommandForm>
        <p className="record-meta" style={{marginTop:12}}>Alamat dan catatan bisa ditambahkan nanti di halaman murid.</p>
      </section>
    </div>
  </div>;
}
