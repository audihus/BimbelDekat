import { APP_NAME } from "./brand";

// Tautan WhatsApp untuk menghubungi guru. Murni dan tanpa efek samping agar mudah diuji.

// Nomor siap pakai untuk wa.me: hanya angka, awalan 0 menjadi 62. Kosong bila terlalu pendek (kurang dari 9 angka).
export function whatsappNumber(phone:string):string{
  let digits=phone.replace(/\D/g,"");
  if(digits.startsWith("0"))digits="62"+digits.slice(1);
  return digits.length>=9?digits:"";
}

export function whatsappLink(phone:string,text:string):string|null{
  const number=whatsappNumber(phone);
  return number?`https://wa.me/${number}?text=${encodeURIComponent(text)}`:null;
}

// Pesan pembuka yang terisi otomatis, supaya orang tua tinggal menekan kirim.
export function contactMessage(teacherName:string,subject?:string):string{
  return `Halo ${teacherName}, saya melihat iklan bimbel ${subject?subject+" ":""}Anda di ${APP_NAME}. Apakah masih ada tempat untuk murid baru?`;
}
