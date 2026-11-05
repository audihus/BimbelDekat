import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata:Metadata={title:{default:"Les Privat — iklan guru les privat",template:"%s | Les Privat"},description:"Pasang iklan les privat Anda dan ditemukan calon murid di daerah Anda. Catatan murid dan jadwal bersifat opsional."};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#0f766e"};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="id"><body><a className="skip-link" href="#main">Langsung ke isi</a>{children}</body></html>;
}
