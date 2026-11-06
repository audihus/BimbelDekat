# BimbelDekat

**Bimbel privat di sekitar Anda.** Tempat guru bimbel privat mandiri memasang iklan, dan tempat orang tua menemukan guru lalu menghubunginya lewat WhatsApp.

## Masalah

- **Guru privat mandiri sulit ditemukan.** Murid baru biasanya datang dari mulut ke mulut atau grup WhatsApp, sehingga jangkauannya terbatas.
- **Orang tua sulit membandingkan guru.** Tarif, wilayah, dan ketersediaan guru tersebar di banyak chat, dan tidak ada tempat yang menyatukannya.
- **Pencatatan murid sering berantakan.** Jadwal, sisa pertemuan, dan pembayaran dicatat di buku atau riwayat chat.

## Solusi

BimbelDekat mengutamakan **iklan guru**. Pencatatan murid hanya pelengkap dan sengaja dibuat sangat ringkas.

| Untuk | Yang didapat |
| --- | --- |
| **Orang tua** (`/`) | Cari bimbel menurut pelajaran, kelas, dan lokasi; lihat tarif dan wilayah; hubungi guru lewat satu tombol WhatsApp. Tanpa akun. |
| **Guru** (`/untuk-guru`) | Iklan bimbel yang ditinjau sebelum tayang, tautan pribadi untuk dibagikan, statistik kunjungan dan klik WhatsApp, serta tiga contoh iklan sebagai acuan. |
| **Guru (opsional)** | Catatan murid, paket pertemuan, jadwal kalender, dan pembayaran. Orang tua dapat melihat ringkasannya lewat tautan berlaku 7 hari, tanpa akun. |

Pembayaran diatur langsung antara orang tua dan guru, di luar aplikasi.

## Teknologi

Next.js 16, React 19, TypeScript, Tailwind 4, Zod 4, dan Supabase (PostgreSQL + Auth). Seluruh perubahan data lewat satu perintah RPC (`app_command`) dengan aturan bisnis dan hak akses (RLS) di basis data. Rincian arsitektur ada di [CLAUDE.md](./CLAUDE.md), kebutuhan produk di [PRD](./PRD_Platform_Les_Privat_v0_2.md), istilah di [GLOSSARY.md](./GLOSSARY.md), dan gaya tampilan di [docs/DESAIN.md](./docs/DESAIN.md).

## Menjalankan di komputer

Persyaratan: Node.js 22+, npm, dan Docker Desktop yang sedang berjalan.

```bash
npm install
docker network create les-privat-dev            # sekali saja
npx supabase start --network-id les-privat-dev --exclude studio,realtime,storage-api,imgproxy,edge-runtime,logflare,vector,supavisor
node scripts/local-env.mjs                      # membuat .env.local (tanpa menampilkan kunci)
node scripts/seed-local.mjs                     # data contoh, hanya untuk Supabase lokal
npm run dev -- --port 3000
```

Buka `http://127.0.0.1:3000`. Akun contoh lokal: `rina@example.test` (guru), `budi@example.test` (guru), `admin@example.test` (pengelola), kata sandi `ContohLesPrivat!2026`. Kotak email uji ada di `http://127.0.0.1:55324`. Akun dan kunci ini hanya untuk lokal.

## Pengujian

```bash
npm run typecheck      # tipe TypeScript
npm test               # tes unit (tanpa layanan)
npm run test:db        # SQL, hak akses, dan konkurensi di PostgreSQL lokal
npx playwright test    # integrasi HTTP dan alur browser (butuh Supabase lokal)
npm run build
```

Cara menaikkan ke internet ada di [docs/DEPLOY.md](./docs/DEPLOY.md). Daftar uji manual di browser ada di [docs/PANDUAN_PENGUJIAN.md](./docs/PANDUAN_PENGUJIAN.md), dan cara memakai aplikasi di [docs/PANDUAN_PENGGUNA.md](./docs/PANDUAN_PENGGUNA.md).

Di Windows, Docker Desktop kadang menahan permintaan pertama ke Supabase lokal ("fetch failed" atau timeout). Pada mesin pengembang, penyebabnya batas memori WSL (`~/.wslconfig`); naikkan ke `memory=4GB` lalu jalankan `wsl --shutdown`.

## Status

Aplikasi **belum siap untuk data nyata**. Belum ada tinjauan keamanan independen, dan belum diuji di perangkat nyata. Belum selesai:

- kode pemulihan akun sekali pakai dan foto profil;
- membuat proyek Supabase dan Vercel produksi, email produksi, dan uji pemulihan cadangan (langkah di [docs/DEPLOY.md](./docs/DEPLOY.md); kodenya sudah disiapkan: penghapusan akun terjadwal lewat Vercel Cron, halaman Privasi dan Kontak, robots dan sitemap);
- peninjauan naskah Kebijakan Privasi oleh orang yang paham hukum;
- pemeriksaan ketersediaan nama BimbelDekat (domain, merek, toko aplikasi).
