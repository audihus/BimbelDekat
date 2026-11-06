import Link from "next/link";
import { ChevronLeft,ChevronRight } from "lucide-react";
import { monthGrid,monthParam,shiftMonth,type Month } from "@/lib/calendar";
import type { IndonesiaZone } from "@/lib/domain/rules";
import type { Lesson,Student } from "@/lib/domain/types";

const dows=["Sen","Sel","Rab","Kam","Jum","Sab","Min"];
const tone=(status:Lesson["status"])=>status==="completed"?"green":status==="scheduled"?"blue":"amber";
const monthName=(m:Month)=>new Intl.DateTimeFormat("id-ID",{month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(Date.UTC(m.year,m.month-1,1)));
const clock=(iso:string,zone:IndonesiaZone)=>new Intl.DateTimeFormat("id-ID",{hour:"2-digit",minute:"2-digit",timeZone:zone}).format(new Date(iso));
const href=(month:Month,day?:string)=>`/jadwal?bulan=${monthParam(month)}${day?`&tgl=${day}`:""}`;

// Kalender bulanan tanpa pustaka: setiap hari adalah tautan, jadi bekerja tanpa JavaScript dan bisa dibagikan/dimuat ulang.
export function ScheduleCalendar({month,selected,today,byDay,students,zone}:{month:Month;selected:string;today:string;byDay:Record<string,Lesson[]>;students:Student[];zone:IndonesiaZone}){
  const name=(l:Lesson)=>students.find(s=>s.id===l.student_id)?.name??"Murid";
  const current={year:Number(today.slice(0,4)),month:Number(today.slice(5,7))};
  return <div className="cal">
    <div className="cal-head">
      <h2 className="cal-title" aria-live="polite">{monthName(month)}</h2>
      <div className="row">
        <Link className="btn secondary" href={href(shiftMonth(month,-1))} aria-label="Bulan sebelumnya"><ChevronLeft size={17} aria-hidden="true"/></Link>
        <Link className="btn secondary" href={href(current,today)}>Hari ini</Link>
        <Link className="btn secondary" href={href(shiftMonth(month,1))} aria-label="Bulan berikutnya"><ChevronRight size={17} aria-hidden="true"/></Link>
      </div>
    </div>
    <div className="cal-grid" role="grid" aria-label={`Kalender ${monthName(month)}`}>
      {dows.map(d=><div key={d} className="cal-dow" role="columnheader">{d}</div>)}
      {monthGrid(month.year,month.month).flat().map(cell=>{
        const items=byDay[cell.key]??[];
        const label=`${cell.day} ${monthName({year:Number(cell.key.slice(0,4)),month:Number(cell.key.slice(5,7))})}, ${items.length?`${items.length} pertemuan`:"tidak ada pertemuan"}`;
        return <Link key={cell.key} role="gridcell" href={href(month,cell.key)} aria-label={label} aria-current={cell.key===today?"date":undefined} className={`cal-cell${cell.inMonth?"":" out"}${cell.key===today?" today":""}${cell.key===selected?" selected":""}`}>
          <span className="cal-day">{cell.day}</span>
          {items.slice(0,2).map(l=><span key={l.id} className={`cal-chip ${tone(l.status)}`}>{clock(l.starts_at,zone)} {name(l)}</span>)}
          {items.length>2&&<span className="cal-more">+{items.length-2} lagi</span>}
          {items.length>0&&<span className="cal-dots" aria-hidden="true">{items.slice(0,4).map(l=><span key={l.id} className={`cal-dot ${tone(l.status)}`}/>)}</span>}
        </Link>;
      })}
    </div>
    <p className="cal-legend"><span><i className="cal-dot blue"/>Akan datang</span><span><i className="cal-dot green"/>Sudah selesai</span><span><i className="cal-dot amber"/>Batal</span></p>
  </div>;
}
