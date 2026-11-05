import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { siteUrl } from "@/lib/config";
import "./globals.css";

// Huruf dihosting sendiri saat build (tanpa permintaan ke Google saat halaman dibuka).
const font=Plus_Jakarta_Sans({subsets:["latin"],variable:"--font-sans",display:"swap"});

export const metadata:Metadata={metadataBase:new URL(siteUrl()),title:{default:"Les Privat — cari murid untuk les privat Anda",template:"%s | Les Privat"},description:"Tempat guru les privat mandiri memasang iklan dan ditemukan orang tua di daerahnya. Orang tua menghubungi langsung lewat WhatsApp."};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#c2410c"};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="id" className={font.variable}><body><a className="skip-link" href="#main">Langsung ke isi</a>{children}</body></html>;
}
