# Platform Les Privat

Tempat guru les mandiri memasang iklan dan ditemukan calon murid (profil, penawaran, pilihan wilayah, tombol WhatsApp, tautan yang bisa dibagikan). Pencatatan murid, jadwal (kalender), dan pembayaran tersedia sebagai fitur opsional. Implementasi lokal masih berlangsung; daftar kebutuhan dan keputusan produk ada di [PRD](./PRD_Platform_Les_Privat_v0_2.md).

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

Langkah lengkap beserta daftar uji manual di browser ada di [panduan pengujian](./docs/PANDUAN_PENGUJIAN.md). Cara memakai aplikasinya ada di [panduan pengguna](./docs/PANDUAN_PENGGUNA.md).

- `npm test`: aturan domain, validasi, pencarian, enkripsi sesi, penyaringan log, pembatas percobaan, wilayah, kalender, dokumen unduhan, dan kelengkapan iklan.
- `npm run test:db`: transaksi, hak akses, hapus akun, ekspor, moderasi, dan pembatas pada PostgreSQL lokal melalui Docker.
- `npm run typecheck`: pemeriksaan tipe TypeScript.
- `npm run build`: build Next.js.
- `npx playwright test`: pemeriksaan integrasi lewat HTTP (login, isolasi data, pembatas, aksi akun, halaman pengelola, wilayah, kalender, Beranda iklan); memerlukan Supabase lokal dan konfigurasi `.env.local`.
- `node scripts/process-deletions.mjs`: menghapus akun yang permintaan penghapusannya sudah lewat 7 hari (belum dijadwalkan otomatis).

Di Windows, Docker Desktop kadang menahan atau me-reset permintaan ke Supabase lokal ("fetch failed" atau "aborted due to timeout"). Penyebab di mesin pengembang: `~/.wslconfig` membatasi WSL hanya `memory=1GB`, sehingga penerus port Docker ke Windows tersendat; setelah dinaikkan ke `4GB` (lalu `wsl --shutdown` dan buka ulang Docker Desktop), macet hilang pada pengukuran. Bila terulang, naikkan batas itu. Kode lokal juga mengulang permintaan sebagai lapisan kedua.

## Pekerjaan yang belum selesai

Alur pemulihan dengan kode sekali pakai, sumber pilihan wilayah lengkap, foto profil, saluran lapor profil/bantuan, penjadwalan otomatis penghapusan akun, serta pemulihan cadangan masih harus diselesaikan dan diuji. Pengujian browser menyeluruh baru berupa daftar uji manual; belum ada tes otomatis di browser. Belum ada tinjauan keamanan independen, sehingga aplikasi belum boleh dipakai dengan data nyata. Penyedia email produksi, biaya, konfigurasi Vercel/Supabase produksi, dan deployment belum ditetapkan.
