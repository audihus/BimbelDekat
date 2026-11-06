import { Field,SelectField } from "./ui";
import { CommandForm } from "./command-form";
import type { IndonesiaZone } from "@/lib/domain/rules";

// Formulir tambah pertemuan yang singkat: tanggal, jam, lama. Jam selesai dihitung otomatis (lihat quickLesson di CommandForm).
// Bila hanya ada satu paket, paket itu dipakai langsung tanpa pertanyaan.
export function QuickLessonForm({packages,timezone,date,buttonLabel="Simpan pertemuan"}:{packages:{id:string;label:string}[];timezone:IndonesiaZone;date:string;buttonLabel?:string}){
  const single=packages.length===1;
  return <CommandForm action="lesson.create" fixed={single?{package_id:packages[0].id}:{}} buttonLabel={buttonLabel} timezone={timezone} quickLesson reset>
    <div className="form-grid">
      {!single&&<div className="span-2"><SelectField label="Murid dan paket" name="package_id" required><option value="">Pilih murid</option>{packages.map(p=><option value={p.id} key={p.id}>{p.label}</option>)}</SelectField></div>}
      <Field label="Tanggal" name="date" type="date" required defaultValue={date}/>
      <Field label="Jam mulai" name="time" type="time" required defaultValue="16:00"/>
      <SelectField label="Lama" name="minutes" defaultValue="60">{[30,45,60,90,120].map(m=><option key={m} value={m}>{m} menit</option>)}</SelectField>
      <SelectField label="Cara belajar" name="mode"><option value="online">Online</option><option value="offline">Tatap muka (di rumah)</option></SelectField>
    </div>
  </CommandForm>;
}
