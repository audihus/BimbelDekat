import { PublicHeader } from "@/components/ui";
import { AuthForm } from "@/components/auth-form";

// Alasan pengalihan ke halaman masuk (?pesan=...). Hanya kunci yang dikenal yang ditampilkan.
const notices: Record<string, string> = {
  sesi: "Sesi Anda sudah berakhir. Silakan masuk kembali.",
  tautan: "Tautan sudah tidak berlaku. Minta tautan baru bila diperlukan.",
  pulih: "Kata sandi berhasil diganti. Masuk dengan kata sandi baru Anda.",
  sandi: "Kata sandi berhasil diganti dan semua login dicabut. Masuk dengan kata sandi baru Anda.",
  email: "Konfirmasi email diterima. Jika email lama dan baru sama-sama sudah dikonfirmasi, masuklah dengan email baru; jika belum, email lama tetap berlaku."
};

export default async function Page({searchParams}:{searchParams:Promise<{pesan?:string}>}){const {pesan}=await searchParams;return <><PublicHeader/><main id="main" className="auth-page"><div className="auth-intro"><p className="eyebrow">Ruang kerja guru les</p><h1>Lebih tenang mengajar.<br/>Lebih rapi mencatat.</h1><p className="muted">Jadwal, murid, jatah pertemuan, dan pembayaran tersimpan bersama. Fokus Anda tetap pada mengajar.</p></div><AuthForm notice={pesan?notices[pesan]:undefined}/></main></>;}
