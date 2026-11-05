import type { PublicTeacher } from "./domain/types";
export interface TeacherFilters {q?:string;level?:string;mode?:string;province?:string;regency?:string;district?:string}
export const normalize=(value:string|undefined)=>(value??"").normalize("NFKC").trim().toLocaleLowerCase("id-ID");
export const contains=(value:string,query:string|undefined)=>normalize(value).includes(normalize(query));
export function matchesTeacher(teacher:PublicTeacher,filters:TeacherFilters):boolean{
  const profile=teacher.document;
  return profile.offers.some(offer=>{
    if(filters.mode&&offer.mode!==filters.mode)return false;
    if(filters.level&&normalize(offer.level)!==normalize(filters.level))return false;
    if(filters.q&&!contains(profile.name,filters.q)&&!contains(offer.subject,filters.q))return false;
    if(offer.mode==="offline")return profile.areas.some(area=>contains(area.province,filters.province)&&contains(area.regency,filters.regency)&&contains(area.district,filters.district));
    if(filters.district&&filters.mode!=="online")return false;
    return contains(profile.province,filters.province)&&contains(profile.regency,filters.regency);
  });
}
