import { dateTime,lessonLabel,rupiah,zoneLabel } from "./format";
import type { IndonesiaZone } from "./domain/rules";
import type { Lesson,Package,Payment,Student,TeacherProfile } from "./domain/types";

export interface ExportData {
  exported_at:string;
  account:{display_name:string;email:string;timezone:IndonesiaZone;status:string;created_at:string};
  students:Student[];packages:Package[];lessons:Lesson[];payments:Payment[];
  profile:TeacherProfile|null;
}

const escapeHtml=(value:unknown)=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
const e=escapeHtml;
const table=(heads:string[],rows:string[][],empty:string)=>rows.length?`<table><thead><tr>${heads.map(h=>`<th>${e(h)}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`:`<p class="empty">${e(empty)}</p>`;
const kindLabel={payment:"Pembayaran",refund:"Pengembalian",correction:"Koreksi"} as const;

export function renderExportHtml(data:ExportData):string{
  const zone=data.account.timezone;
  const student=(id:string)=>e(data.students.find(s=>s.id===id)?.name??"-");
  const pack=(id:string)=>data.packages.find(p=>p.id===id);
  const when=(value:string)=>e(dateTime(value,zone));
  const profile=data.profile?(data.profile.published??data.profile.draft):null;
  const css=`body{font:15px/1.5 system-ui,sans-serif;color:#1c2a33;max-width:1000px;margin:0 auto;padding:24px}h1{font-size:1.6rem;margin:0 0 4px}h2{font-size:1.15rem;margin:32px 0 10px;border-bottom:2px solid #d6e2e8;padding-bottom:4px}table{width:100%;border-collapse:collapse;font-size:.88rem}th,td{border:1px solid #d6e2e8;padding:6px 8px;text-align:left;vertical-align:top}th{background:#eef4f7}.meta,.empty{color:#5b6b75}button{padding:8px 14px;font:inherit;cursor:pointer}@media print{button{display:none}body{padding:0}h2{break-after:avoid}tr{break-inside:avoid}}`;
  const title=`Data Les Privat - ${data.account.display_name}`;
  return `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(title)}</title><style>${css}</style></head><body>
<h1>${e(title)}</h1>
<p class="meta">Diunduh ${when(data.exported_at)} · Email ${e(data.account.email)} · Waktu ditampilkan dalam ${e(zoneLabel(zone))}</p>
<p><button type="button" onclick="window.print()">Cetak atau simpan sebagai PDF</button></p>
<h2>Murid (${data.students.length})</h2>
${table(["Nama","Jenjang","Telepon wali","Alamat","Catatan","Status"],data.students.map(s=>[e(s.name),e(s.level),e(s.guardian_phone),e(s.address),e(s.notes),s.archived?"Diarsipkan":"Aktif"]),"Belum ada murid.")}
<h2>Paket pertemuan (${data.packages.length})</h2>
${table(["Murid","Paket","Jatah","Sisa","Harga disepakati","Sudah dibayar","Sisa pembayaran","Status"],data.packages.map(p=>[student(p.student_id),e(p.name),String(p.quota),String(p.remaining),e(rupiah(p.agreed_price)),e(rupiah(p.received)),e(rupiah(p.due)),p.closed_at?`Ditutup${p.closure_reason?`: ${e(p.closure_reason)}`:""}`:"Berjalan"]),"Belum ada paket.")}
<h2>Jadwal pertemuan (${data.lessons.length})</h2>
${table(["Waktu mulai","Murid","Paket","Cara","Status","Catatan"],data.lessons.map(l=>[when(l.starts_at),student(l.student_id),e(pack(l.package_id)?.name??"-"),l.mode==="online"?"Online":"Tatap muka",e(lessonLabel(l.status)),e(l.reason)]),"Belum ada pertemuan.")}
<h2>Pembayaran (${data.payments.length})</h2>
${table(["Tanggal","Paket","Jenis","Jumlah","Keterangan"],data.payments.map(p=>[when(p.paid_at),e(pack(p.package_id)?`${data.students.find(s=>s.id===pack(p.package_id)?.student_id)?.name??"-"} · ${pack(p.package_id)?.name}`:"-"),e(kindLabel[p.kind]),e(rupiah(p.amount)),e(p.reason)]),"Belum ada pembayaran.")}
${profile?`<h2>Profil iklan</h2>
<p><strong>${e(profile.name)}</strong> · ${e(profile.regency)}, ${e(profile.province)} · WhatsApp ${e(profile.phone)}</p>
<p>${e(profile.about)}</p>
${table(["Pelajaran","Jenjang","Cara","Durasi","Tarif"],profile.offers.map(o=>[e(o.subject),e(o.level),o.mode==="online"?"Online":"Tatap muka",`${o.duration} menit`,e(rupiah(o.price))]),"Belum ada penawaran.")}`:""}
</body></html>
`;
}
