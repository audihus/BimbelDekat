import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { siteUrl } from "@/lib/config";
import "./globals.css";
import { APP_NAME } from "@/lib/brand";

// Huruf dihosting sendiri saat build (tanpa permintaan ke Google saat halaman dibuka).
const font=Plus_Jakarta_Sans({subsets:["latin"],variable:"--font-sans",display:"swap"});

export const metadata:Metadata={metadataBase:new URL(siteUrl()),title:{default:`${APP_NAME} — cari bimbel privat di dekat rumah Anda`,template:`%s | ${APP_NAME}`},description:"Tempat guru bimbel privat mandiri membuat profil bimbel dan ditemukan orang tua di daerahnya. Orang tua menghubungi langsung lewat WhatsApp."};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#c2410c"};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="id" className={font.variable}><body><a className="skip-link" href="#main">Langsung ke isi</a>{children}</body></html>;
}
