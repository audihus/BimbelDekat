# Platform Les Privat

Aplikasi web untuk guru les mandiri. Implementasi lokal masih berlangsung; daftar kebutuhan dan keputusan produk ada di [PRD](./PRD_Platform_Les_Privat_v0_2.md).

## Menjalankan di komputer

Persyaratan: Node.js 22 atau lebih baru, npm, dan Docker Desktop yang sedang berjalan. Perintah di bawah dijalankan dari folder proyek.

1. Instal dependensi: `npm install`.
2. Buat jaringan Docker lokal sekali: `docker network create les-privat-dev`.
3. Jalankan Supabase lokal: `npx supabase start --network-id les-privat-dev --exclude studio,realtime,storage-api,imgproxy,edge-runtime,logflare,vector,supavisor`.
4. Buat konfigurasi lokal: `node scripts/local-env.mjs`. Skrip tidak menampilkan kunci dan tidak menimpa `.env.local` yang bukan dibuat untuk proyek ini.
5. Isi data contoh: `node scripts/seed-local.mjs`. Skrip hanya menerima alamat Supabase lokal proyek ini.
6. Jalankan aplikasi: `npm run dev -- --port 3000`, lalu buka `http://127.0.0.1:3000`.

Akun contoh lokal: `rina@example.test`, `budi@example.test`, dan `admin@example.test`. Kata sandi contoh: `ContohLesPrivat!2026`. Akun ini hanya untuk data contoh lokal.

Kotak email uji lokal tersedia di `http://127.0.0.1:55324`. Jangan memakai akun contoh atau kunci lokal untuk produksi.

## Pemeriksaan

- `npm test`: aturan domain, validasi, pencarian, dan enkripsi sesi.
- `npm run test:db`: transaksi dan akses pada PostgreSQL lokal melalui Docker.
- `npm run typecheck`: pemeriksaan tipe TypeScript.
- `npm run build`: build Next.js.
- `npx playwright test tests/e2e/api.spec.ts`: pemeriksaan integrasi API; memerlukan Supabase lokal dan konfigurasi `.env.local`.

## Pekerjaan yang belum selesai

Moderasi profil oleh pengelola, alur pemulihan dengan kode sekali pakai, perubahan email/kata sandi dengan pemeriksaan ulang, ekspor dan penghapusan akun, sumber pilihan wilayah lengkap, serta pekerjaan terjadwal dan pemulihan cadangan masih harus diselesaikan dan diuji. Integrasi akun dan pengujian browser menyeluruh masih memerlukan pemeriksaan sebelum dipakai dengan data nyata. Penyedia email produksi, biaya, konfigurasi Vercel/Supabase produksi, dan deployment belum ditetapkan.
