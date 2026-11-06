import Link from "next/link";
import { requireWorkspace } from "@/lib/session";
import { Empty,Badge } from "@/components/ui";
import { QuickLessonForm } from "@/components/quick-lesson-form";
import { LessonList } from "@/components/lesson-list";
import { ScheduleCalendar } from "@/components/schedule-calendar";
import { zoneLabel } from "@/lib/format";
import { dateKey,groupByDay,monthParam,parseDay,parseMonth } from "@/lib/calendar";

export default async function Schedule({searchParams}:{searchParams:Promise<{bulan?:string;tgl?:string}>}){
  const {account,data}=await requireWorkspace();const query=await searchParams;const zone=account.timezone;
  const today=dateKey(new Date().toISOString(),zone);
  const day=parseDay(query.tgl);
  const todayMonth={year:Number(today.slice(0,4)),month:Number(today.slice(5,7))};
  // Urutan: ?bulan= yang sah, lalu bulan dari ?tgl=, lalu bulan ini.
  const month=parseMonth(query.bulan,day?{year:Number(day.slice(0,4)),month:Number(day.slice(5,7))}:todayMonth);
  const selected=day&&day.startsWith(monthParam(month))?day:today.startsWith(monthParam(month))?today:`${monthParam(month)}-01`;
  const byDay=groupByDay(data.lessons,zone);
  const now=Date.parse(new Date().toISOString());
  const overdue=data.lessons.filter(l=>l.status==="scheduled"&&Date.parse(l.ends_at)<now).sort((a,b)=>Date.parse(a.starts_at)-Date.parse(b.starts_at));
  const packages=data.packages.filter(p=>!p.closed_at&&data.students.some(s=>s.id===p.student_id&&!s.archived));
  const label=new Intl.DateTimeFormat("id-ID",{dateStyle:"full",timeZone:"UTC"}).format(new Date(`${selected}T00:00:00Z`));
  const lessons=byDay[selected]??[];
  return <div className="stack">
    <div className="page-heading"><p className="eyebrow">Catatan bimbel (opsional)</p><h1 style={{marginTop:8}}>Jadwal Anda</h1><p>Semua jam memakai {zoneLabel(zone)}. Dua pertemuan di jam yang sama tidak bisa disimpan.</p></div>
    {overdue.length>0&&<p role="status" className="notice warning">{overdue.length} pertemuan sudah lewat tetapi belum ditandai selesai atau batal. <Link className="text-link" href={`/jadwal?tgl=${dateKey(overdue[0].starts_at,zone)}`}>Lihat yang paling lama</Link></p>}
    <section className="card"><ScheduleCalendar month={month} selected={selected} today={today} byDay={byDay} students={data.students} zone={zone}/></section>
    <section className="card stack">
      <div className="card-header" style={{marginBottom:0}}><h2>{label}</h2><Badge tone={lessons.length?"blue":""}>{lessons.length} pertemuan</Badge></div>
      {lessons.length?<LessonList lessons={lessons} students={data.students} packages={data.packages} timezone={zone}/>:<Empty title="Tidak ada pertemuan di hari ini">Pilih tanggal lain di kalender, atau tambahkan pertemuan di bawah.</Empty>}
    </section>
    <section className="card"><details key={selected} open={data.lessons.length===0}><summary>Tambah pertemuan pada {label}</summary>{packages.length?<QuickLessonForm packages={packages.map(p=>({id:p.id,label:`${data.students.find(s=>s.id===p.student_id)?.name} · ${p.name} · sisa ${p.remaining}`}))} timezone={zone} date={selected} buttonLabel="Simpan pertemuan"/>:<Empty title="Tambahkan paket dulu">Buka halaman murid, catat paketnya, lalu kembali ke sini untuk mengatur pertemuan.</Empty>}</details></section>
  </div>;
}
