import { PublicHeader } from "@/components/ui";
import { AuthForm } from "@/components/auth-form";

// Alasan pengalihan ke halaman masuk (?pesan=...). Hanya kunci yang dikenal yang ditampilkan.
const notices: Record<string, string> = {
  sesi: "Sesi Anda sudah berakhir. Silakan masuk kembali.",
  tautan: "Tautan sudah tidak berlaku. Minta tautan baru bila diperlukan.",
  pulih: "Kata sandi berhasil diganti. Masuk dengan kata sandi baru Anda.",
  sandi: "Kata sandi diganti dan semua login dicabut. Masuk dengan kata sandi baru.",
  email: "Konfirmasi diterima. Setelah email lama dan baru dikonfirmasi, masuk dengan email baru. Sebelum itu, email lama tetap berlaku."
};

export default async function Page({searchParams}:{searchParams:Promise<{pesan?:string}>}){const {pesan}=await searchParams;return <><PublicHeader/><main id="main" className="auth-page"><div className="auth-intro"><p className="eyebrow">Untuk guru bimbel privat</p><h1>Selamat datang kembali.</h1><p className="lead">Kelola iklan, bagikan tautannya, dan pantau kunjungan.</p></div><AuthForm notice={pesan?notices[pesan]:undefined}/></main></>;}
