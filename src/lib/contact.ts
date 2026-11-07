import { whatsappNumber } from "./whatsapp";

// Saluran bantuan BimbelDekat, diatur lewat variabel lingkungan (bukan ditulis di kode) supaya bisa diganti tanpa mengubah aplikasi.
export interface ContactChannels { email: string | null; whatsapp: { number: string; href: string } | null }

export function contactChannels(env: Record<string, string | undefined> = {
  NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  NEXT_PUBLIC_CONTACT_WHATSAPP: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP
}): ContactChannels {
  const email = (env.NEXT_PUBLIC_CONTACT_EMAIL ?? "").trim();
  const number = whatsappNumber(env.NEXT_PUBLIC_CONTACT_WHATSAPP ?? "");
  return {
    email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? email : null,
    whatsapp: number ? { number, href: `https://wa.me/${number}` } : null
  };
}

export const reportMailto = (email: string, profileId: string) => `mailto:${email}?subject=${encodeURIComponent(`Laporan profil guru ${profileId}`)}`;
