import type { ProfileDocument } from "./domain/types";

// Tiga contoh iklan untuk ilustrasi di Beranda guru. Semuanya FIKTIF: tidak disimpan di basis data,
// tidak muncul di pencarian, dan nomor WhatsApp sengaja kosong.
export interface SampleProfile { document: ProfileDocument; why: string[] }

export const sampleProfiles: SampleProfile[] = [
  {
    document: {
      name: "Bu Maya", phone: "", province: "Jawa Barat", regency: "Kota Bekasi",
      about: "Sabar menemani anak SD belajar membaca, menulis, dan berhitung dari nol. Tersedia juga bimbel mengaji Iqro. Belajar lewat permainan singkat supaya anak tidak bosan, dan kabar perkembangan dikirim ke orang tua setiap minggu.",
      areas: [{ province: "Jawa Barat", regency: "Kota Bekasi", district: "Bekasi Selatan" }, { province: "Jawa Barat", regency: "Kota Bekasi", district: "Bekasi Timur" }],
      offers: [
        { subject: "Calistung", level: "SD", mode: "offline", duration: 60, price: "60000" },
        { subject: "Mengaji / Iqro", level: "SD", mode: "offline", duration: 45, price: "50000" }
      ]
    },
    why: ["Menyebut siapa yang cocok: anak SD yang baru belajar membaca", "Wilayah yang didatangi ditulis jelas, sampai kecamatan", "Orang tua tahu akan mendapat kabar setiap minggu"]
  },
  {
    document: {
      name: "Pak Dimas", phone: "", province: "Jawa Timur", regency: "Kota Surabaya",
      about: "Guru Matematika dan Fisika untuk SMP dan SMA. Saya mulai dari soal yang sedang dikerjakan murid di sekolah, lalu menjelaskan konsepnya pelan-pelan sampai murid bisa mengerjakan sendiri. Bisa online atau datang ke rumah.",
      areas: [{ province: "Jawa Timur", regency: "Kota Surabaya", district: "Gubeng" }, { province: "Jawa Timur", regency: "Kota Surabaya", district: "Wonokromo" }],
      offers: [
        { subject: "Matematika", level: "SMP", mode: "online", duration: 60, price: "80000" },
        { subject: "Matematika", level: "SMA", mode: "offline", duration: 90, price: "120000" },
        { subject: "Fisika", level: "SMA", mode: "online", duration: 60, price: "100000" }
      ]
    },
    why: ["Cara mengajarnya dijelaskan dengan bahasa sehari-hari", "Ada pilihan online dan datang ke rumah, tarif tiap pilihan jelas", "Satu orang mengajar dua pelajaran, jadi mudah dicari"]
  },
  {
    document: {
      name: "Kak Alya", phone: "", province: "Jawa Tengah", regency: "Kota Semarang",
      about: "Bimbel Bahasa Inggris online untuk pelajar SMP dan SMA: percakapan, tata bahasa, dan latihan soal ujian sekolah. Materi disesuaikan dengan buku yang dipakai murid, dan jadwal fleksibel di sore atau malam hari.",
      areas: [],
      offers: [
        { subject: "Bahasa Inggris", level: "SMP", mode: "online", duration: 60, price: "70000" },
        { subject: "Bahasa Inggris", level: "SMA", mode: "online", duration: 60, price: "85000" }
      ]
    },
    why: ["Fokus pada satu pelajaran, sehingga mudah diingat orang tua", "Jadwal sore dan malam disebut, cocok untuk murid yang sekolah seharian", "Bimbel online bisa dicari dari kota mana saja"]
  }
];
