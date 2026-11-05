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

export default async function Page({searchParams}:{searchParams:Promise<{pesan?:string}>}){const {pesan}=await searchParams;return <><PublicHeader/><main id="main" className="auth-page"><div className="auth-intro"><p className="eyebrow">Untuk guru les mandiri</p><h1>Kelola iklan Anda.<br/>Dapatkan murid baru.</h1><p className="muted">Lihat status iklan, bagikan tautan profil, dan pantau berapa orang yang melihatnya.</p></div><AuthForm notice={pesan?notices[pesan]:undefined}/></main></>;}
