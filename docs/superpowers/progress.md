# Implementation ledger — plan: docs/superpowers/plans/2026-10-30-platform-mvp.md

- Q1–Q38 recorded according to user answers; latest instruction requests implementation.
- Environment: Node 26.5.0, npm 12.2.0, Docker server 29.6.1. No application or Git repository existed before this work.
- Execution: native in this workspace; fact-finding agent failed with a usage-limit error. No remote resource, purchase, or deployment.
- Task 1: domain/security input rules RED→GREEN; `npm test` passed 15 tests. Typecheck/build await UI routes.
- Task 2: PostgreSQL migrations applied locally. First integration run exposed ambiguous `reason` in the lesson update; the variable was renamed. The local database suite passed 11 checks on 2 November 2026.
- Task 3 and 4: account routes, opaque session storage, dashboard, students, packages, schedules, payments, and guardian summary have implementation. On 2 November 2026 all three API integration tests failed at login (HTTP 500 or 401, after about 30 seconds); diagnose the local Supabase/Auth connection and session creation before treating the application as usable. The session database function exists; its presence alone does not prove integration.
- Task 5: directory and teacher profile editor exist; the editor and account page were added on 2 November 2026 and typecheck passed. Administrator moderation UI is still outstanding.
- Task 6: a basic account page now provides time zone and global logout. Recovery code, full sensitive account actions, export, deletion, and backup restoration remain outstanding.
- Verification 2 November 2026: 21 unit tests, 11 database checks, TypeScript and Next.js build passed. API integration failed; do not use real student data or claim security end-to-end is verified.
- Ruling: use a dedicated `les-privat-dev` Docker network and Docker-executed psql for local SQL tests — Windows host TCP PostgreSQL connections were intermittent while internal SQL and HTTP API worked — no change to the production Supabase API architecture; local commands need Docker running.

## 5 November 2026: penyelesaian pemeriksaan, halaman pengelola, aksi akun, pembatas, log

Bukti yang dijalankan di mesin ini (Supabase lokal, Docker Desktop):

- **Penyebab tes login macet 30 detik (dicatat 2 Nov):** bukan bug aplikasi. Docker Desktop di Windows menahan atau me-reset permintaan HTTP pertama ke Supabase lokal. Diukur dengan probe terpisah: Kong sehat, sambungan TCP instan, tetapi permintaan HTTP setelah diam ±10 dtk kadang di-reset atau tertahan 30 dtk, juga di IPv6, jadi bukan soal IPv4/IPv6. Mitigasi: `src/lib/supabase/resilient-fetch.ts` (batas waktu per percobaan dan percobaan ulang, khusus alamat loopback; produksi tidak berubah). Tes kadang masih gagal sekali lalu lolos saat diulang: tercatat sebagai flaky, belum terbukti hilang total.
- **Asersi e2e isolasi diperbaiki:** sebelumnya memeriksa status 404, padahal Next.js mengalirkan halaman sehingga `notFound()` dapat berstatus 200. Kini yang diperiksa adalah data tidak bocor, dengan kontrol positif untuk pemilik. Probe terpisah membuktikan guru lain tidak melihat nama maupun catatan murid.
- **Log terstruktur** (`src/lib/log.ts`): satu baris JSON, kata sandi/token/telepon/alamat/catatan disembunyikan, email disamarkan; `errorResponse` tidak lagi menelan error server dan memberi kode acak yang cocok dengan log. Diperiksa pada keluaran server nyata: nol kemunculan kata sandi uji dan email mentah.
- **Pembatas percobaan** (`rate_check` di Postgres, `src/lib/rate-limit.ts`): login hanya menghitung percobaan gagal; daftar, lupa kata sandi, dan kirim ulang dihitung per panggilan; kunci di-HMAC. Batas awal masih titik awal yang perlu diputuskan pemilik produk (`POLICY`).
- **Aksi akun** (FR13, FR15, FR17, ekspor): kata sandi diminta ulang dan dibatasi per akun; ganti email terbukti lewat Mailpit hanya berlaku setelah email lama dan baru sama-sama dikonfirmasi; ganti kata sandi mencabut semua login; ekspor hanya data sendiri tanpa hash tautan; hapus akun menyembunyikan profil, mencabut tautan, menutup operasi, dapat dibatalkan 7 hari, dan `process_account_deletions()` hanya menghapus yang lewat 7 hari.
- **Halaman pengelola** (`/admin`) dengan tes e2e alur lengkap sampai profil muncul/hilang di `/cari`; keputusan `unhide` ditambahkan agar sembunyi dapat dibatalkan.
- **Pengujian terakhir:** 53 tes unit lolos; 17 pemeriksaan DB lolos; typecheck bersih; 16 dari 16 tes e2e lolos dalam satu run penuh (2,6 menit). Pada run penuh sebelumnya, 2 tes e2e dan 1 tes DB gagal karena gangguan Docker lalu lolos saat diulang; jadi hasil satu run belum menjamin run berikutnya. Lint: 3 error dan 2 peringatan lama, tidak ada dari kode baru. Uji mutasi: menghapus pencabutan tautan dari `request_account_deletion` membuat tes DB gagal; dipulihkan lalu hijau.

Belum dikerjakan dan belum terbukti: kode pemulihan sekali pakai (FR14, ditunda), penjadwalan produksi penghapusan akun (hosting belum diputuskan), uji pemulihan cadangan, alur lupa-kata-sandi lewat browser (belum ada tes otomatis; ada di panduan uji manual), tampilan ponsel, tinjauan keamanan independen. Jangan menyatakan aplikasi aman atau terverifikasi menyeluruh.

### Tambahan 5 November 2026: akar masalah gangguan Docker

- **Pengukuran sebelum:** lewat `127.0.0.1:55321` dari Windows, 6 dari 14 permintaan macet (termasuk 5 berturut-turut); langsung di dalam jaringan Docker, 0 dari 14. Jadi Supabase sehat dan yang bermasalah adalah penerus port Docker Desktop ke Windows. Perintah `wsl -d docker-desktop` juga kehabisan waktu (`WSAETIMEDOUT`).
- **Dugaan dan perubahan:** `~/.wslconfig` membatasi WSL ke `memory=1GB` (Docker hanya melihat ±0,9 GiB) padahal RAM komputer 13,9 GB. Dinaikkan ke `memory=4GB` (cadangan: `~/.wslconfig.bak-2026-11-05`), `wsl --shutdown`, Docker Desktop dibuka ulang; Docker kini melihat 3,83 GiB.
- **Pengukuran sesudah:** 0 dari 14 macet lewat port host (±8 ms); pola "diam 10 detik" 0 dari 14 (dulu 3 dari 7); seed berhasil sekali jalan; 53 tes unit, 17 cek DB, 16 dari 16 tes e2e lolos dalam 35 detik (dulu 2,6 menit).
- **Batas kepastian:** pengukuran sesudah dilakukan dalam sekitar 15 menit setelah restart, dan gejala dulu cenderung memburuk saat Docker menyala lama. Penyebab terbukti secara korelasi (satu perubahan, hasil sebelum/sesudah), bukan lewat membaca memori VM langsung. Lapisan pengulangan di `resilient-fetch.ts` dipertahankan sebagai cadangan.
