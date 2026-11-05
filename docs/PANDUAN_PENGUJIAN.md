# Panduan Pengujian Platform Les Privat

Panduan ini membantu Anda menguji aplikasi langkah demi langkah. Ada dua bagian:

1. **Pengujian otomatis**: komputer yang menjalankan, Anda hanya membaca hasilnya (bagian 2).
2. **Pengujian manual di browser**: hanya manusia yang bisa menilai tampilan, email, dan unduhan (bagian 3).

> **Penting.** Semua pengujian memakai Supabase **lokal** di komputer Anda dan akun contoh `@example.test`. Tidak ada layanan online yang disentuh. Jangan memasukkan data murid sungguhan.

## 1. Persiapan

Perintah dijalankan di folder proyek (`F:\Porto\Les`).

| Langkah | Perintah | Hasil yang diharapkan |
| --- | --- | --- |
| 1 | Buka **Docker Desktop**, tunggu ikon hijau | Docker berjalan |
| 2 | `npx supabase start --network-id les-privat-dev --exclude studio,realtime,storage-api,imgproxy,edge-runtime,logflare,vector,supavisor` | Muncul daftar alamat dan kunci lokal. **Jika gagal "Connection terminated unexpectedly", jalankan sekali lagi.** Ini gangguan Docker Desktop di Windows, bukan masalah kode. |
| 3 | `node scripts/local-env.mjs` (hanya bila `.env.local` belum ada) | "Konfigurasi lokal tersimpan" |
| 4 | `node scripts/seed-local.mjs` | "Data contoh lokal siap" |
| 5 | `npm run dev -- --port 3000` (biarkan terbuka) | "Ready", lalu buka `http://127.0.0.1:3000` |

**Gunakan `127.0.0.1`, jangan `localhost`.** Pemeriksaan keamanan asal permintaan memakai alamat itu.

**Akun contoh:** `rina@example.test` (guru), `budi@example.test` (guru), `admin@example.test` (pengelola). Kata sandi semuanya `ContohLesPrivat!2026`.

**Kotak email uji (Mailpit):** `http://127.0.0.1:55324`. Semua email dari aplikasi (verifikasi, lupa kata sandi, ganti email) masuk ke sini, bukan ke internet.

## 2. Pengujian otomatis

Jalankan berurutan. Server dev (langkah 5) harus hidup untuk tes e2e.

| Perintah | Yang diuji | Hasil yang diharapkan |
| --- | --- | --- |
| `npm run typecheck` | Kesalahan tipe TypeScript | Tanpa keluaran error |
| `npm test` | Aturan murni: penyaringan log, pembatas, domain, enkripsi sesi | `Tests 53 passed` |
| `npm run test:db` | Basis data nyata: hak akses, jatah, hapus akun, ekspor, moderasi, pembatas | `17 database checks passed` |
| `npx playwright test` | Aplikasi nyata lewat HTTP: login, isolasi data, pembatas, aksi akun, admin | `passed` untuk semua |
| `npm run build` | Build produksi | Selesai tanpa error |
| `npm run lint` | Gaya dan kebiasaan kode | Lihat catatan di bawah |

**Jika tes gagal sesekali lalu lolos saat diulang:** itu hampir pasti gangguan Docker Desktop di Windows (permintaan ke Supabase kadang tertahan atau di-reset), bukan bug. Ulangi sekali. Jika gagal **dua kali di tempat yang sama**, laporkan pesan lengkapnya.

**Pencegahan (penting):** pastikan `C:\Users\<nama>\.wslconfig` tidak membatasi memori terlalu kecil. Di komputer ini batas `memory=1GB` membuat 6 dari 14 permintaan macet; setelah dinaikkan ke `memory=4GB`, 0 dari 14 macet dan seluruh tes e2e turun dari 2,6 menit menjadi 35 detik. Setelah mengubahnya jalankan `wsl --shutdown` lalu buka ulang Docker Desktop (semua container ikut berhenti sebentar).

**Catatan lint:** ada 3 error dan 2 peringatan lama (sebelum pekerjaan ini) di `dashboard`, `murid/[id]`, `guardian-view`, `command-form`, dan `postcss.config.mjs`. Itu belum diperbaiki karena di luar permintaan; bukan berasal dari kode baru.

## 3. Pengujian manual di browser

Centang tiap butir. Jika hasilnya berbeda dari "Harus terlihat", catat langkah dan layar yang muncul.

### A. Daftar dan verifikasi email
1. Buka `http://127.0.0.1:3000/daftar`. Isi nama, email baru (misal `uji1@example.test`), kata sandi **15 karakter atau lebih**. Klik **Buat akun**.
   - Harus terlihat: pesan "Periksa email untuk mengonfirmasi akun".
2. Coba **Masuk** dengan akun itu **sebelum** verifikasi.
   - Harus terlihat: "Email atau kata sandi belum sesuai, atau email belum diverifikasi."
3. Buka Mailpit (`http://127.0.0.1:55324`), buka email konfirmasi, klik tautannya.
4. Masuk lagi.
   - Harus terlihat: halaman **Ringkasan** dengan sapaan nama Anda.

### B. Lupa kata sandi (penting: belum ada tes otomatis untuk alur browser ini)
1. Masuk sebagai `rina@example.test` di **dua** jendela browser berbeda (atau satu biasa, satu jendela pribadi).
2. Di jendela ketiga/keluar, buka `/lupa-kata-sandi`, isi `rina@example.test`, kirim.
   - Harus terlihat: "Jika email tersebut terdaftar, tautan pemulihan akan dikirim."
3. Buka Mailpit, klik tautan pemulihan, isi kata sandi baru (15+ karakter), simpan.
   - Harus terlihat: halaman Masuk dengan pesan kata sandi berhasil diganti.
4. Muat ulang kedua jendela yang tadi sudah masuk.
   - Harus terlihat: **keduanya dikeluarkan** ke halaman Masuk (semua login lama dicabut).
5. Kembalikan kata sandi `rina@example.test` ke `ContohLesPrivat!2026` lewat langkah yang sama, atau jalankan ulang `node scripts/seed-local.mjs` setelah menghapus akunnya.

### C. Pembatas percobaan login
1. Di halaman Masuk, isi email `budi@example.test` dengan kata sandi **salah** sebanyak 5 kali.
   - Harus terlihat: tiap kali "Email atau kata sandi belum sesuai…".
2. Percobaan ke-6, bahkan dengan kata sandi **benar**.
   - Harus terlihat: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." (angka menit boleh sedikit berbeda)
3. Untuk mengulang tanpa menunggu 15 menit: `docker exec -i supabase_db_les-privat-local psql -U postgres -d postgres -c "delete from private.rate_events"`.

### D. Halaman Akun (login sebagai guru)
1. **Unduh data:** buka **Akun**, masukkan kata sandi di *Unduh data Anda*, klik **Unduh data**.
   - Harus terlihat: berkas `les-privat-ekspor-TANGGAL.json` terunduh. Buka dengan Notepad: hanya berisi murid Anda, tidak ada murid guru lain.
   - Kata sandi salah harus menampilkan "Kata sandi belum sesuai."
2. **Ubah kata sandi:** isi kata sandi lama dan baru (15+).
   - Harus terlihat: dialihkan ke Masuk dengan pesan semua login dicabut. Login lama di jendela lain juga mati.
3. **Ubah email** (butuh dua langkah konfirmasi):
   - Isi email baru dan kata sandi, kirim. Harus terlihat: pesan tautan dikirim ke email lama dan baru.
   - Di Mailpit akan ada **dua** email (satu ke alamat lama, satu ke alamat baru). Klik tautan **satu** email saja, lalu lihat halaman Akun: email **belum** berubah.
   - Klik tautan email yang **kedua**, lalu masuk ulang: email Anda kini yang baru.
4. **Hapus akun** (pakai akun uji buatan sendiri, bukan `rina`/`budi`):
   - Centang kotak, masukkan kata sandi, klik **Minta penghapusan akun**.
   - Harus terlihat: halaman Akun berubah menjadi spanduk "Akun menunggu penghapusan" dengan tanggal; menu hanya **Akun**; hanya ada tombol **Unduh data** dan **Batalkan penghapusan akun**.
   - Buka `/murid` atau `/dashboard`: tidak menampilkan data Anda.
   - Klik **Batalkan penghapusan akun**: menu lengkap kembali. Profil publik tetap tersembunyi (sesuai aturan).

### E. Halaman pengelola
1. Masuk sebagai `admin@example.test`.
   - Harus terlihat: menu hanya **Moderasi** dan **Akun**.
2. Di jendela lain, masuk sebagai guru uji, buka **Profil publik**, isi nama, nomor WhatsApp (mis. `081234567890`), satu penawaran, lalu **Ajukan pemeriksaan**.
3. Kembali ke halaman **Moderasi** pengelola, muat ulang.
   - Harus terlihat: pengajuan di bagian *Menunggu pemeriksaan* dengan tombol **Setujui dan terbitkan** dan **Tolak**.
4. Klik **Tolak** dengan kotak alasan **kosong**.
   - Harus terlihat: "Tuliskan alasannya."
5. Tolak dengan alasan, lalu lihat halaman **Profil publik** guru.
   - Harus terlihat: "Pengajuan belum disetujui: (alasan Anda)". Profil **tidak** ada di `/cari`.
6. Guru ajukan lagi, pengelola **Setujui**. Buka `/cari`.
   - Harus terlihat: guru itu muncul di hasil pencarian.
7. Pengelola klik **Sembunyikan dari direktori** (dengan alasan): guru hilang dari `/cari`. Lalu **Tampilkan kembali** (dengan alasan): muncul lagi.
8. Sebagai guru biasa, buka `http://127.0.0.1:3000/admin`.
   - Harus terlihat: Anda dialihkan ke Ringkasan, tidak melihat antrean.

### F. Tampilan ponsel
Di Chrome: tekan `F12`, klik ikon ponsel (Toggle device toolbar), pilih lebar sekitar **375 px**. Buka **Akun**, **Moderasi**, dan **Masuk**.
- Harus terlihat: tidak ada gulir ke samping, tombol dapat ditekan, menu bawah terlihat, teks terbaca.

## 4. Yang belum bisa diuji (belum dibuat)

Kode pemulihan sekali pakai, penjadwalan otomatis penghapusan akun di server produksi, foto profil, lapor profil/bantuan, dan uji pemulihan cadangan. Jangan menganggap fitur-fitur ini ada.

Menjalankan penghapusan akun yang sudah lewat 7 hari secara manual: `node scripts/process-deletions.mjs`.

## 5. Jika ada yang tidak beres

- Lihat jendela tempat `npm run dev` berjalan: setiap baris berformat JSON dengan `level` dan `event`. Pesan 500 kepada pengguna memuat `(Kode: abcd1234)`; cari kode itu di log untuk melihat penyebab sebenarnya.
- Kata sandi dan token tidak pernah tampil di log; email tampil tersamar (`r***@example.test`).
- Setelah mengubah `supabase/config.toml`: `npx supabase stop` lalu `start` lagi.
