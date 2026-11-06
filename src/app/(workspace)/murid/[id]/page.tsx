import Link from "next/link";
import { notFound } from "next/navigation";
import { requireWorkspace } from "@/lib/session";
import { Badge,Field,SelectField,TextareaField } from "@/components/ui";
import { CommandForm } from "@/components/command-form";
import { LessonList } from "@/components/lesson-list";
import { QuickLessonForm } from "@/components/quick-lesson-form";
import { rupiah,dateTime } from "@/lib/format";
import { dateKey } from "@/lib/calendar";

// Formulir paket baru: hanya pelajaran, jumlah pertemuan, dan harga. "Sudah dipakai sebelumnya" disimpan di bagian Lainnya.
function NewPackageForm({studentId}:{studentId:string}){
  return <CommandForm action="package.create" fixed={{student_id:studentId}} buttonLabel="Simpan paket" reset>
    <div className="form-grid">
      <div className="span-2"><Field label="Pelajaran" name="name" placeholder="Contoh: Matematika" required maxLength={150}/></div>
      <Field label="Jumlah pertemuan" name="quota" type="number" required min={1} step={1} defaultValue={8}/>
      <Field label="Harga paket (Rp)" name="agreed_price" inputMode="numeric" pattern="[0-9]+" placeholder="Contoh: 400000" required/>
      <details className="span-2"><summary>Lainnya</summary><Field label="Pertemuan yang sudah dipakai sebelumnya" name="opening_used" type="number" min={0} step={1} defaultValue={0} required/></details>
    </div>
    <p className="record-meta">Pembayaran boleh menyusul. Pertemuan yang belum dipakai tidak hangus otomatis.</p>
  </CommandForm>;
}

export default async function StudentDetail({params}:{params:Promise<{id:string}>}){
  const {id}=await params;const {account,data}=await requireWorkspace();
  const student=data.students.find(s=>s.id===id);if(!student)notFound();
  const packages=data.packages.filter(p=>p.student_id===id);
  const openPacks=packages.filter(p=>!p.closed_at);
  const lessons=data.lessons.filter(l=>l.student_id===id);
  const upcoming=lessons.filter(l=>l.status==="scheduled").sort((a,b)=>Date.parse(a.starts_at)-Date.parse(b.starts_at));
  const past=lessons.filter(l=>l.status!=="scheduled");
  const payments=data.payments.filter(p=>packages.some(k=>k.id===p.package_id));
  const today=dateKey(new Date().toISOString(),account.timezone);
  const due=openPacks.reduce((n,p)=>n+BigInt(p.due),0n);
  return <div className="stack">
    <Link href="/murid" className="text-link">← Semua murid</Link>
    <div className="page-heading row between"><div className="row"><span className="avatar large">{student.name.slice(0,1).toUpperCase()}</span><div><h1>{student.name}</h1><p>{student.level}{student.guardian_phone?` · WhatsApp orang tua ${student.guardian_phone}`:""}</p></div></div><Badge tone={student.archived?"amber":"green"}>{student.archived?"Sudah berhenti les":"Masih les"}</Badge></div>
    {student.archived&&<p className="notice warning">Murid ini sudah berhenti les. Riwayatnya tetap tersimpan. Jadwal yang dibatalkan dan tautan yang dimatikan tidak aktif lagi saat murid diaktifkan kembali.</p>}

    {!student.archived&&packages.length===0&&<section className="card stack" aria-labelledby="paket-pertama"><div><h2 id="paket-pertama">Mulai dengan paket les</h2><p className="muted" style={{marginTop:6,fontSize:".92rem"}}>Paket mencatat berapa pertemuan yang disepakati dan berapa harganya. Setelah itu Anda bisa menambah jadwal dan mencatat pembayaran.</p></div><NewPackageForm studentId={id}/></section>}

    {packages.length>0&&<div className="grid-2"><section className="stack">
      <div className="card stack" aria-labelledby="sisa"><div className="row between"><h2 id="sisa">Sisa pertemuan</h2>{openPacks.length>0&&(due>0n?<Badge tone="amber">Belum dibayar {rupiah(due.toString())}</Badge>:<Badge tone="green">Lunas</Badge>)}</div>
        {packages.map(pack=><article key={pack.id} className="offer stack-sm"><div className="row between"><h3>{pack.name}</h3>{pack.closed_at&&<Badge>Sudah diakhiri</Badge>}</div><p className="stat-value">{pack.remaining}<span className="muted" style={{fontSize:".9rem",fontWeight:500}}> dari {pack.quota} pertemuan tersisa</span></p><p className="record-meta">Harga paket {rupiah(pack.agreed_price)} · sudah dibayar {rupiah(pack.received)}{BigInt(pack.due)>0n?` · belum dibayar ${rupiah(pack.due)}`:""}{BigInt(pack.overpaid)>0n?` · bayar lebih ${rupiah(pack.overpaid)}`:""}</p>{pack.closed_at&&<p className="record-meta">Diakhiri: {pack.closure_reason}. Sisa {pack.remaining} pertemuan tetap tercatat belum dipakai.</p>}</article>)}
      </div>
      {!student.archived&&openPacks.length>0&&<div className="card stack" aria-labelledby="tambah-pertemuan"><h2 id="tambah-pertemuan">Tambah pertemuan</h2><QuickLessonForm packages={openPacks.map(p=>({id:p.id,label:`${p.name} · sisa ${p.remaining}`}))} timezone={account.timezone} date={today}/></div>}
      <div className="card stack" aria-labelledby="akan-datang"><div className="row between"><h2 id="akan-datang">Pertemuan yang akan datang</h2><Link href="/jadwal" className="text-link">Buka jadwal</Link></div>{upcoming.length?<LessonList lessons={upcoming} students={data.students} packages={packages} timezone={account.timezone}/>:<p className="muted">Belum ada pertemuan terjadwal.</p>}</div>
    </section><section className="stack">
      <div className="card stack" aria-labelledby="bayar"><h2 id="bayar">Catat pembayaran</h2>{packages.length?<>
        <CommandForm action="payment.record" fixed={{kind:"payment",...(packages.length===1?{package_id:packages[0].id}:{})}} buttonLabel="Catat pembayaran" reset>
          <div className="stack-sm">{packages.length>1&&<SelectField label="Untuk paket" name="package_id" required>{packages.map(p=><option key={p.id} value={p.id}>{p.name}{p.closed_at?" (sudah diakhiri)":""}</option>)}</SelectField>}<Field label="Uang yang diterima (Rp)" name="amount" inputMode="numeric" pattern="[0-9]+" placeholder="Contoh: 200000" required/></div>
        </CommandForm>
        <details><summary>Uang dikembalikan atau koreksi</summary><CommandForm action="payment.record" buttonLabel="Simpan catatan" tone="secondary" reset><div className="form-grid"><SelectField label="Untuk paket" name="package_id" required>{packages.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</SelectField><SelectField label="Jenis" name="kind"><option value="refund">Uang dikembalikan</option><option value="correction">Koreksi (+ / −)</option></SelectField><Field label="Jumlah (Rp)" name="amount" inputMode="numeric" pattern="-?[0-9]+" required/><div className="span-2"><TextareaField label="Alasan (wajib diisi)" name="reason" required maxLength={1000}/></div></div><p className="record-meta">Transfer uangnya dilakukan di luar aplikasi; di sini hanya dicatat.</p></CommandForm></details></>:<p className="muted">Tambahkan paket dulu sebelum mencatat pembayaran.</p>}</div>
      <div className="card stack" aria-labelledby="orangtua"><h2 id="orangtua">Tautan untuk orang tua</h2><p className="muted" style={{fontSize:".9rem"}}>Orang tua bisa melihat jadwal, sisa pertemuan, dan pembayaran lewat satu tautan, tanpa perlu akun. Siapa pun yang memegang tautannya bisa membacanya, termasuk bila tautan diteruskan. Berlaku tujuh hari.</p>{!student.archived&&<CommandForm action="guardian.create" fixed={{student_id:id}} buttonLabel="Buat tautan untuk orang tua" tone="secondary"/>}<div className="stack-sm">{data.guardian_links.filter(g=>g.student_id===id&&!g.revoked_at&&Date.parse(g.expires_at)>Date.now()).map(link=><div className="offer" key={link.id}><p className="record-meta">Berlaku sampai {dateTime(link.expires_at,account.timezone)}</p><CommandForm inline action="guardian.revoke" fixed={{id:link.id}} buttonLabel="Matikan tautan" tone="ghost"/></div>)}</div></div>
    </section></div>}

    {(past.length>0||payments.length>0)&&<section className="card"><details><summary>Riwayat pertemuan dan pembayaran</summary><div className="stack">
      {past.length>0&&<div><h3 style={{marginBottom:12}}>Pertemuan yang sudah lewat</h3><LessonList lessons={past} students={data.students} packages={packages} timezone={account.timezone}/></div>}
      {payments.length>0&&<div><h3 style={{marginBottom:12}}>Pembayaran</h3><div className="table-wrap"><table><thead><tr><th>Waktu</th><th>Paket</th><th>Jenis</th><th>Jumlah</th><th>Catatan</th></tr></thead><tbody>{payments.map(payment=><tr key={payment.id}><td className="nowrap">{dateTime(payment.paid_at,account.timezone)}</td><td>{packages.find(p=>p.id===payment.package_id)?.name}</td><td>{payment.kind==="payment"?"Diterima":payment.kind==="refund"?"Dikembalikan":"Koreksi"}</td><td className="nowrap number">{rupiah(payment.amount)}</td><td>{payment.reason}</td></tr>)}</tbody></table></div></div>}
    </div></details></section>}

    <section className="card"><details><summary>Pengaturan lain</summary><div className="stack">
      {!student.archived&&packages.length>0&&<div><h3 style={{marginBottom:12}}>Tambah paket baru</h3><NewPackageForm studentId={id}/></div>}
      {packages.map(pack=><div key={pack.id} className="offer stack-sm"><h3>Paket {pack.name}</h3>
        <CommandForm action="package.adjust_quota" fixed={{id:pack.id}} buttonLabel="Ubah jumlah pertemuan" tone="secondary"><div className="form-grid"><Field label="Tambah atau kurangi (+ / −)" name="delta" type="number" required step={1}/><Field label="Alasan" name="reason" required maxLength={1000}/></div></CommandForm>
        <CommandForm action="package.adjust_price" fixed={{id:pack.id}} buttonLabel="Ubah harga" tone="secondary"><div className="form-grid"><Field label="Harga baru (Rp)" name="agreed_price" inputMode="numeric" pattern="[0-9]+" required defaultValue={pack.agreed_price}/><Field label="Alasan" name="reason" required maxLength={1000}/></div></CommandForm>
        {!pack.closed_at&&<CommandForm action="package.close" fixed={{id:pack.id}} buttonLabel="Akhiri paket" tone="danger"><Field label="Alasan diakhiri (sudah disepakati dengan orang tua)" name="reason" required maxLength={1000}/><p className="record-meta">Mengakhiri paket tidak mengubah harga atau uang. Pengembalian uang dicatat terpisah.</p></CommandForm>}
      </div>)}
      <div><h3 style={{marginBottom:12}}>Data murid</h3><CommandForm action="student.update" fixed={{id}} buttonLabel="Simpan data murid" tone="secondary"><div className="stack-sm"><Field label="Nama murid" name="name" required defaultValue={student.name}/><SelectField label="Kelas" name="level" defaultValue={student.level}><option>SD</option><option>SMP</option><option>SMA</option></SelectField><Field label="WhatsApp orang tua" name="guardian_phone" type="tel" defaultValue={student.guardian_phone}/><TextareaField label="Alamat" name="address" defaultValue={student.address}/><TextareaField label="Catatan" name="notes" defaultValue={student.notes}/></div></CommandForm></div>
      <hr className="divider"/>
      <CommandForm action="student.archive" fixed={{id,archived:!student.archived}} buttonLabel={student.archived?"Aktifkan murid lagi":"Murid berhenti les"} tone={student.archived?"secondary":"danger"}><p className="record-meta">{student.archived?"Riwayat tetap tersimpan. Buat jadwal dan tautan orang tua yang baru bila perlu.":"Jadwal yang belum berlangsung dibatalkan (pertemuan tidak berkurang), tautan orang tua dimatikan, dan seluruh riwayat tetap tersimpan."}</p></CommandForm>
    </div></details></section>
  </div>;
}
