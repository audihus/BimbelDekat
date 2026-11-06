# Panduan deploy (Vercel + Supabase cloud)

Dokumen ini menyiapkan langkah menaikkan BimbelDekat ke internet. **Belum pernah dijalankan** terhadap proyek cloud sungguhan: setiap langkah di bawah harus diperiksa saat dikerjakan. Pilihan hosting dan alasannya ada di [riset hosting](./riset-hosting-2026-10-30.md).

Penanda: **[Anda]** butuh akun, pembayaran, atau keputusan Anda. **[Repo]** sudah disiapkan di kode.

## 1. Proyek Supabase [Anda]

1. Buat proyek di supabase.com, region **Singapura** (terdekat dengan Indonesia). Simpan kata sandi database di pengelola kata sandi.
2. Dari folder proyek: `npx supabase login`, lalu `npx supabase link --project-ref <ref>`.
3. Terapkan seluruh migrasi: `npx supabase db push`. Isi `supabase/migrations/` adalah satu-satunya sumber skema; jangan membuat tabel lewat dashboard.
4. **Jangan** menjalankan `scripts/seed-local.mjs` di cloud (skrip menolak alamat non-lokal). Data contoh hanya untuk lokal.
5. Authentication → URL Configuration: isi **Site URL** dengan alamat produksi, dan tambahkan `<alamat>/auth/callback` ke **Redirect URLs**.
6. Authentication → Providers → Email: aktifkan konfirmasi email dan perubahan email dengan konfirmasi ganda. Sesuaikan panjang minimal kata sandi dengan aturan aplikasi.
7. Authentication → SMTP: pasang penyedia email produksi (Resend, Brevo, Postmark, atau sejenis). Email bawaan Supabase hanya untuk uji dan terbatas penerimanya. Periksa bahwa email verifikasi dan lupa kata sandi benar-benar sampai (dan tidak masuk spam).
8. Project Settings → API: salin URL, **publishable key**, dan **secret key** (rahasia: hanya untuk server).
9. Paket: Free tidak punya cadangan harian dan proyek dijeda bila tidak aktif seminggu. Untuk data nyata pakai paket Pro, lalu **uji pemulihan cadangan** sekali (PRD: cadangan maksimal 30 hari, dan penghapusan akun harus diterapkan ulang saat pemulihan).

## 2. Proyek Vercel [Anda]

1. Import repo GitHub `audihus/BimbelDekat`, framework Next.js. Cabang produksi: `main`.
2. Settings → Environment Variables (Production):

| Variabel | Isi |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL proyek Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | publishable key |
| `SUPABASE_SECRET_KEY` | secret key (jangan diberi awalan `NEXT_PUBLIC_`) |
| `NEXT_PUBLIC_SITE_URL` | alamat publik, mis. `https://bimbeldekat.id` (wajib; aplikasi menolak berjalan di produksi tanpa ini) |
| `GUARDIAN_TOKEN_SECRET` | acak baru: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `SESSION_ENCRYPTION_KEY` | acak baru, 64 karakter heksadesimal (perintah yang sama) |
| `CRON_SECRET` | acak baru, minimal 16 karakter (lihat bagian 3) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | email bantuan (tampil di halaman Kontak dan tombol Laporkan iklan) |
| `NEXT_PUBLIC_CONTACT_WHATSAPP` | opsional, nomor WhatsApp bantuan |

Nilai `GUARDIAN_TOKEN_SECRET` dan `SESSION_ENCRYPTION_KEY` **tidak boleh** sama dengan yang lokal. Mengganti `SESSION_ENCRYPTION_KEY` setelah ada pengguna membuat semua sesi login tidak berlaku.

   Isi variabel `NEXT_PUBLIC_*` juga untuk lingkungan **Preview** bila Anda memakai deployment pratinjau; tanpa `NEXT_PUBLIC_SITE_URL` build produksi sengaja gagal.
3. Deploy. Build memakai `next/font/google`, jadi butuh akses internet (aman di Vercel).
4. Domain: Settings → Domains. Perbarui `NEXT_PUBLIC_SITE_URL` dan Redirect URL Supabase bila domainnya berubah, lalu deploy ulang.

## 3. Penghapusan akun terjadwal [Repo]

`vercel.json` menjadwalkan `GET /api/cron/process-deletions` setiap hari pukul 20.00 UTC (03.00 WIB). Vercel mengirim `Authorization: Bearer <CRON_SECRET>`; rute menjawab 401 bila rahasia kosong, pendek, atau salah. Cron hanya berjalan di deployment produksi. Setelah deploy, periksa di Vercel → Logs bahwa baris `cron.process_deletions` muncul dengan jumlah akun yang dihapus.

## 4. Sebelum membuka untuk pengguna sungguhan

- [ ] Semua variabel di atas terisi; `NEXT_PUBLIC_SITE_URL` memakai `https://`.
- [ ] Daftar guru baru, verifikasi email, masuk, lupa kata sandi: seluruhnya berhasil dengan email nyata.
- [ ] Buat akun pengelola (admin): daftar seperti guru biasa, lalu di SQL Editor Supabase jalankan `update public.accounts set role='admin' where id='<id akun>'` (sama seperti `scripts/seed-local.mjs`). Jangan memakai akun contoh lokal.
- [ ] Jalankan butir uji manual di [panduan pengujian](./PANDUAN_PENGUJIAN.md) terhadap alamat produksi.
- [ ] Naskah [Kebijakan Privasi](../src/app/privasi/page.tsx) ditinjau orang yang paham UU Pelindungan Data Pribadi; data murid termasuk data anak.
- [ ] Uji pemulihan cadangan sekali.
- [ ] Tinjauan keamanan independen (RLS, sesi kustom, pembatas percobaan). Pengujian bawaan repo bukan pengganti.
- [ ] Periksa ketersediaan nama BimbelDekat: domain, merek (PDKI DJKI), dan nama di toko aplikasi.

## 5. Yang belum ada

Kode pemulihan akun sekali pakai (FR14), foto profil, pemantauan galat (hanya log JSON di Vercel), dan Content-Security-Policy (header keamanan dasar dan HSTS sudah ada di `next.config.ts`).
