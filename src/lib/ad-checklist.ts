import type { ProfileDocument,TeacherProfile } from "./domain/types";

export interface ChecklistItem { key: string; label: string; done: boolean; hint: string }
export interface Checklist { items: ChecklistItem[]; percent: number; complete: boolean }

const ABOUT_MIN = 100;
// Nilai awal; ubah di sini bila ambang kelengkapan iklan perlu lebih longgar/ketat.
export function adChecklist(doc: ProfileDocument | null): Checklist {
  const d = doc ?? { name: "", about: "", phone: "", province: "", regency: "", areas: [], offers: [] };
  const items: ChecklistItem[] = [
    { key: "name", label: "Nama yang ditampilkan", done: d.name.trim().length >= 2, hint: "Tulis nama yang dikenal calon murid." },
    { key: "about", label: "Perkenalan diri dan cara mengajar", done: d.about.trim().length >= ABOUT_MIN, hint: `Tulis minimal ${ABOUT_MIN} karakter: pengalaman, cara mengajar, dan siapa yang cocok belajar dengan Anda.` },
    { key: "phone", label: "Nomor WhatsApp", done: d.phone.replace(/\D/g, "").length >= 9, hint: "Orang tua menghubungi Anda lewat nomor ini." },
    { key: "home", label: "Tempat tinggal (provinsi dan kabupaten/kota)", done: Boolean(d.province && d.regency), hint: "Dipilih dari daftar." },
    { key: "offers", label: "Minimal satu penawaran les (pelajaran, jenjang, tarif)", done: d.offers.length > 0, hint: "Tanpa penawaran, iklan tidak muncul di hasil pencarian." }
  ];
  // Daerah layanan hanya relevan bila ada les tatap muka: pencarian tatap muka mencocokkan daerah ini.
  if (d.offers.some(o => o.mode === "offline")) {
    items.push({ key: "areas", label: "Daerah yang bersedia didatangi", done: d.areas.some(a => a.province && a.regency), hint: "Tanpa daerah layanan, penawaran tatap muka tidak ditemukan." });
  }
  const done = items.filter(i => i.done).length;
  return { items, percent: Math.round((done / items.length) * 100), complete: done === items.length };
}

export interface AdStatus { key: "none" | "draft" | "pending" | "rejected" | "live" | "paused" | "hidden"; tone: "green" | "amber" | "red" | "blue" | ""; title: string; detail: string; action: { label: string; href: string } | null }

export function adStatus(profile: TeacherProfile | null): AdStatus {
  if (!profile) return { key: "none", tone: "amber", title: "Iklan Anda belum dibuat", detail: "Buat profil agar orang tua bisa menemukan Anda di pencarian guru.", action: { label: "Buat iklan", href: "/profil" } };
  if (profile.published) {
    if (profile.admin_hidden) return { key: "hidden", tone: "red", title: "Iklan disembunyikan pengelola", detail: `Iklan Anda tidak tampil di pencarian. Alasan: ${profile.review_reason || "tidak dicantumkan"}.`, action: null };
    if (!profile.visible) return { key: "paused", tone: "amber", title: "Iklan sedang dijeda", detail: "Iklan Anda tidak tampil di pencarian sampai Anda mengaktifkannya kembali.", action: { label: "Aktifkan iklan", href: "/profil" } };
    const note = profile.review_status === "pending" ? " Perubahan terbaru sedang diperiksa; sementara itu versi sebelumnya tetap tayang."
      : profile.review_status === "rejected" ? ` Perubahan terbaru belum disetujui: ${profile.review_reason}. Versi sebelumnya tetap tayang.`
      : profile.review_status === "draft" ? " Ada draf perubahan yang belum diajukan." : "";
    return { key: "live", tone: "green", title: "Iklan Anda tayang", detail: `Iklan Anda bisa ditemukan di pencarian guru.${note}`, action: { label: "Lihat iklan saya", href: `/guru/${profile.id}` } };
  }
  if (profile.review_status === "pending") return { key: "pending", tone: "blue", title: "Iklan sedang diperiksa", detail: "Pengelola memeriksa iklan baru sebelum ditampilkan. Anda akan melihat hasilnya di sini.", action: { label: "Lihat isi iklan", href: "/profil" } };
  if (profile.review_status === "rejected") return { key: "rejected", tone: "red", title: "Pengajuan iklan belum disetujui", detail: `Alasan: ${profile.review_reason}. Perbaiki lalu ajukan lagi.`, action: { label: "Perbaiki iklan", href: "/profil" } };
  return { key: "draft", tone: "amber", title: "Iklan masih draf", detail: "Lengkapi isinya lalu ajukan pemeriksaan agar tayang di pencarian.", action: { label: "Lengkapi dan ajukan", href: "/profil" } };
}
