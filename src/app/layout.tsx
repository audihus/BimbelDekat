import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata:Metadata={title:{default:"Les Privat — ruang kerja guru",template:"%s | Les Privat"},description:"Kelola murid, jadwal, paket pertemuan, dan pembayaran les privat dalam satu tempat."};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#0f766e"};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="id"><body><a className="skip-link" href="#main">Langsung ke isi</a>{children}</body></html>;
}
