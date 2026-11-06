import type { ProfileDocument,TeacherProfile } from "./domain/types";

export interface ChecklistItem { key: string; label: string; done: boolean; hint: string }
export interface Checklist { items: ChecklistItem[]; percent: number; complete: boolean }

const ABOUT_MIN = 100;
// Nilai awal; ubah di sini bila ambang kelengkapan iklan perlu lebih longgar/ketat.
export function adChecklist(doc: ProfileDocument | null): Checklist {
  const d = doc ?? { name: "", about: "", phone: "", province: "", regency: "", areas: [], offers: [] };
  const items: ChecklistItem[] = [
    { key: "name", label: "Nama Anda", done: d.name.trim().length >= 2, hint: "Gunakan nama yang dikenal orang tua dan murid." },
    { key: "about", label: "Perkenalan diri dan cara mengajar", done: d.about.trim().length >= ABOUT_MIN, hint: `Minimal ${ABOUT_MIN} karakter: pengalaman, metode mengajar, dan murid yang sesuai.` },
    { key: "phone", label: "Nomor WhatsApp", done: d.phone.replace(/\D/g, "").length >= 9, hint: "Nomor ini dipakai orang tua untuk menghubungi Anda." },
    { key: "home", label: "Kota tempat tinggal", done: Boolean(d.province && d.regency), hint: "Pilih provinsi, lalu kabupaten/kota." },
    { key: "offers", label: "Minimal satu bimbel (pelajaran, kelas, tarif)", done: d.offers.length > 0, hint: "Tanpa ini, iklan tidak muncul di pencarian." }
  ];
  // Daerah layanan hanya relevan bila ada bimbel tatap muka: pencarian tatap muka mencocokkan daerah ini.
  if (d.offers.some(o => o.mode === "offline")) {
    items.push({ key: "areas", label: "Wilayah yang bisa Anda datangi", done: d.areas.some(a => a.province && a.regency), hint: "Tanpa ini, bimbel tatap muka tidak ditemukan." });
  }
  const done = items.filter(i => i.done).length;
  return { items, percent: Math.round((done / items.length) * 100), complete: done === items.length };
}

export interface AdStatus { key: "none" | "draft" | "pending" | "rejected" | "live" | "paused" | "hidden"; tone: "green" | "amber" | "red" | "blue" | ""; title: string; detail: string; action: { label: string; href: string } | null }

export function adStatus(profile: TeacherProfile | null): AdStatus {
  if (!profile) return { key: "none", tone: "amber", title: "Iklan Anda belum dibuat", detail: "Buat iklan agar orang tua dapat menemukan Anda.", action: { label: "Buat iklan", href: "/profil" } };
  if (profile.published) {
    if (profile.admin_hidden) return { key: "hidden", tone: "red", title: "Iklan Anda disembunyikan tim kami", detail: `Iklan Anda tidak tampil di pencarian. Alasan: ${profile.review_reason || "tidak dicantumkan"}.`, action: null };
    if (!profile.visible) return { key: "paused", tone: "amber", title: "Iklan sedang dijeda", detail: "Iklan tidak tampil di pencarian sampai diaktifkan kembali.", action: { label: "Aktifkan iklan", href: "/profil" } };
    const note = profile.review_status === "pending" ? " Perubahan terbaru sedang dicek; versi lama tetap tayang."
      : profile.review_status === "rejected" ? ` Perubahan terbaru belum disetujui: ${profile.review_reason}. Versi lama tetap tayang.`
      : profile.review_status === "draft" ? " Ada perubahan yang belum Anda kirim untuk dicek." : "";
    return { key: "live", tone: "green", title: "Iklan Anda tayang", detail: `Iklan Anda sudah dapat ditemukan di pencarian.${note}`, action: { label: "Lihat iklan saya", href: `/guru/${profile.id}` } };
  }
  if (profile.review_status === "pending") return { key: "pending", tone: "blue", title: "Iklan sedang dicek tim kami", detail: "Hasil pengecekan akan tampil di sini.", action: { label: "Lihat iklan saya", href: "/profil" } };
  if (profile.review_status === "rejected") return { key: "rejected", tone: "red", title: "Iklan belum disetujui", detail: `Alasan: ${profile.review_reason}. Perbaiki lalu kirim ulang.`, action: { label: "Perbaiki iklan", href: "/profil" } };
  return { key: "draft", tone: "amber", title: "Iklan masih draf", detail: "Lengkapi isi iklan, lalu kirim untuk dicek.", action: { label: "Lengkapi iklan", href: "/profil" } };
}
