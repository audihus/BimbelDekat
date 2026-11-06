import type { IndonesiaZone,LessonStatus } from "./domain/rules";

export function rupiah(value:string|number){try{return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(BigInt(value));}catch{return "Rp0";}}
export function zoneLabel(zone:string){return ({"Asia/Jakarta":"WIB","Asia/Makassar":"WITA","Asia/Jayapura":"WIT"} as Record<string,string>)[zone]??zone;}
export function dateTime(value:string,zone:IndonesiaZone="Asia/Jakarta"){return new Intl.DateTimeFormat("id-ID",{dateStyle:"medium",timeStyle:"short",timeZone:zone}).format(new Date(value))+" "+zoneLabel(zone);}
export function lessonLabel(status:LessonStatus){return {scheduled:"Akan datang",completed:"Sudah selesai",cancelled:"Batal (pertemuan tidak berkurang)",cancelled_charged:"Batal (pertemuan tetap dihitung)"}[status];}
export function toLocalInput(value:string,zone:IndonesiaZone){const parts=Object.fromEntries(new Intl.DateTimeFormat("sv-SE",{timeZone:zone,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date(value)).map(p=>[p.type,p.value]));return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;}
