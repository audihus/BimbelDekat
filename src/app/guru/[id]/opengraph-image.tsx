import { ImageResponse } from "next/og";
import { publicTeachers } from "@/lib/public-data";
import { teacherSummary } from "@/lib/teacher-summary";
import { rupiah } from "@/lib/format";

// Gambar yang muncul saat tautan profil ditempel di WhatsApp atau media sosial. Tidak memuat nomor telepon.
export const alt="Profil guru les privat";
export const size={width:1200,height:630};
export const contentType="image/png";
export const dynamic="force-dynamic";

export default async function Image({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const {teachers}=await publicTeachers();
  const teacher=teachers.find(t=>t.id===id);
  const name=teacher?.document.name??"Guru les privat";
  const s=teacher?teacherSummary(teacher.document,{}):null;
  const subjects=s?.subjects.slice(0,3).join("  ·  ")??"";
  const where=s?(s.areas[0]??(s.modes.includes("online")?"Les online":s.home)):"";
  return new ImageResponse(
    <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:72,background:"linear-gradient(135deg,#ffedd5,#fff7ed 60%,#fef3c7)",color:"#292524"}}>
      <div style={{display:"flex",alignItems:"center",fontSize:34,fontWeight:700,color:"#9a3412"}}>Les Privat</div>
      <div style={{display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",fontSize:84,fontWeight:800,lineHeight:1.05}}>{name}</div>
        {subjects&&<div style={{display:"flex",fontSize:42,marginTop:22,color:"#57534e"}}>{subjects}</div>}
        {where&&<div style={{display:"flex",fontSize:34,marginTop:14,color:"#57534e"}}>{where}</div>}
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",fontSize:40,fontWeight:800,color:"#9a3412"}}>{s&&s.fromPrice!==null?`Mulai ${rupiah(s.fromPrice)} / pertemuan`:"Cari guru les di Les Privat"}</div>
        <div style={{display:"flex",padding:"18px 34px",borderRadius:20,background:"#15803d",color:"#fff",fontSize:34,fontWeight:700}}>Hubungi lewat WhatsApp</div>
      </div>
    </div>,
    {...size}
  );
}
