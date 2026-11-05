# Platform Les Privat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membuat aplikasi les lokal yang bekerja berdasarkan PRD dan keputusan Q1–Q38, dengan pengujian aturan bisnis dan batas akses.

**Architecture:** Monolitik Next.js + TypeScript dengan Supabase Auth dan satu database PostgreSQL bersama. Perubahan bisnis dilakukan secara atomik dan idempoten; akses privat dibatasi per ruang kerja.

**Tech Stack:** Next.js, React, TypeScript, Supabase, npm, Vitest, PostgreSQL lokal, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-30-platform-design.md` dan `PRD_Platform_Les_Privat_v0_2.md`.

## Global Constraints

- Guru tujuh hari dan pengelola delapan jam sejak login; tidak ada logout idle 30 menit atau kewajiban kode masuk tambahan.
- Tautan wali tujuh hari, hanya satu relasi, dapat dicabut; arsip dan permintaan penghapusan mencabutnya.
- Masa batal penghapusan tujuh hari; akses selama menunggu hanya ekspor dan pembatalan.
- Backup harian maksimal 30 hari sejak dibuat; pemulihan menerapkan ulang penghapusan dan pencabutan akses.
- Tidak ada deployment atau pembelian. Rahasia tidak disimpan di Git atau log.
- Perubahan aturan kritis harus diuji; persetujuan produk bukan bukti keamanan.

## Review Focus

- Pengiriman ulang atau bersamaan tidak menggandakan pemakaian jatah maupun uang.
- Mengganti ID atau memanggil database langsung tidak membuka ruang kerja guru lain.
- JWT yang belum kedaluwarsa tidak mempertahankan akses setelah sesi dicabut atau akun dibatasi.
- Kegagalan koneksi mempertahankan isian dan tidak menampilkan sukses tanpa konfirmasi.
- Jadwal dekat pergantian tanggal di WIB/WITA/WIT tetap menunjuk instan yang sama.

## Task 1: Fondasi dan aturan domain

**Files:** `package.json`, konfigurasi Next/TypeScript/Vitest, `src/lib/domain/*.ts`, `tests/domain.test.ts`.

**Interfaces:** Fungsi murni menghitung sisa paket, saldo pembayaran, perubahan hasil les, tumpang tindih jadwal, dan masa berlaku sesi. Konsumen berikutnya memakai tipe domain yang sama.

- [ ] Buat konfigurasi minimal dan tes perilaku: les selesai tepat sekali, batal oleh guru tanpa jatah, koreksi beralasan, pembayaran berlebih, penutupan tanpa menghanguskan sisa, serta batas sesi absolut.
- [ ] Jalankan `npm test`; pastikan fitur yang belum tersedia menghasilkan kegagalan yang relevan.
- [ ] Implementasikan aturan domain sampai tes lulus.
- [ ] Jalankan unit test dan typecheck; catat bukti di ledger.

## Task 2: Database bersama dan transaksi

**Files:** `supabase/config.toml`, `supabase/migrations/*.sql`, `supabase/tests/*.sql`, `scripts/db-test.mjs`.

**Interfaces:** Tabel akun/ruang kerja/murid/paket/les/perubahan jatah/pembayaran/tautan/profil; fungsi baca dan perintah transaksi yang memakai identitas terverifikasi, request ID, dan ruang kerja pemilik.

- [ ] Tulis tes SQL penolakan akses silang, idempotensi, benturan jadwal, jatah habis, penutupan paket, dan arsip murid.
- [ ] Jalankan tes pada PostgreSQL lokal dan amati kegagalan sebelum menerapkan fungsi terkait.
- [ ] Terapkan skema, RLS/grants, transaksi, dan riwayat tanpa jalur tulis yang melewati aturan.
- [ ] Jalankan seluruh tes database, termasuk permintaan bersamaan.

## Task 3: Akun dan sesi

**Files:** `src/lib/supabase/*`, `src/features/auth/*`, halaman masuk/daftar/pemulihan, penanganan callback.

**Interfaces:** Identitas dari Supabase, konteks ruang kerja milik akun, pemeriksaan sesi absolut/pencabutan/status akun, serta pemeriksaan ulang kata sandi untuk tindakan penting.

- [ ] Uji sesi guru/admin pada batas waktu, sesi dicabut, email belum terverifikasi, dan akun menunggu penghapusan.
- [ ] Implementasikan daftar/masuk/keluar, verifikasi, lupa kata sandi, dan callback dengan tujuan redirect yang aman.
- [ ] Hubungkan pemeriksaan sesi ke setiap akses privat dan uji lewat Auth lokal.

## Task 4: Ruang kerja operasional

**Files:** `src/app/(workspace)/*`, `src/features/workspace/*`, proses server untuk murid/paket/jadwal/pembayaran.

**Interfaces:** Formulir memanggil perintah transaksi Task 2 melalui server dengan validasi, request ID, dan pesan kesalahan Indonesia.

- [ ] Uji alur tambah murid/paket/jadwal, tandai selesai, pembayaran sebagian/berlebih, reschedule, pembatalan, penutupan, dan arsip.
- [ ] Implementasikan dashboard, daftar/detail murid, paket, jadwal, dan pembayaran yang dapat dipakai dari ponsel.
- [ ] Pastikan kegagalan tidak menghilangkan isian atau menggandakan catatan.

## Task 5: Wali dan direktori

**Files:** `src/features/guardian/*`, `src/features/directory/*`, halaman direktori/profil/wali/admin, fungsi database publik.

**Interfaces:** Token wali acak dengan hash tersimpan dan proyeksi satu relasi; profil publik memakai versi yang disetujui serta penawaran/area layanan terpisah.

- [ ] Uji token kedaluwarsa/dicabut, arsip, penerusan tautan, dan pembatasan satu relasi.
- [ ] Uji profil menunggu, perubahan belum disetujui, label tidak menerima murid, dan pencarian area layanan.
- [ ] Implementasikan halaman serta moderasi tanpa akses admin ke catatan privat.

## Task 6: Pengaturan dan siklus akun

**Files:** `src/features/account/*`, halaman pengaturan, fungsi database untuk ekspor/penghapusan/pemulihan.

**Interfaces:** Verifikasi kata sandi sebelum tindakan penting; kode pemulihan tersimpan sebagai hash dan sekali pakai; ekspor hanya ruang kerja sendiri; penghapusan membatasi akses segera.

- [ ] Uji kode salah/terpakai, kegagalan di tengah pemulihan, pembatasan selama penghapusan, serta pembatalan yang tidak memulihkan tautan lama.
- [ ] Implementasikan ekspor, perubahan email/password, keluar semua perangkat, kode pemulihan, dan penghapusan/cancel.
- [ ] Catat kebutuhan operasional backup/pemulihan sebelum data nyata tanpa mengklaim konfigurasi produksi telah tersedia.

## Task 7: Pemeriksaan menyeluruh dan dokumentasi

**Files:** `tests/e2e/*`, `playwright.config.ts`, `README.md`, `.env.example`, panduan Supabase lokal, ledger.

- [ ] Jalankan unit test, database test, typecheck/lint, build, dan alur browser lokal.
- [ ] Tinjau khusus isolasi, idempotensi, revokasi, zona waktu, dan kebocoran rahasia; perbaiki temuan penting dengan tes regresi.
- [ ] Dokumentasikan cara menjalankan, bukti yang lulus, serta keterbatasan nyata tanpa menyatakan siap produksi bila masih ada pekerjaan wajib.

## Execution record

Pengguna meminta langsung melanjutkan implementasi. Eksekusi lokal dilakukan di sesi ini. Subagent fact-finding gagal karena batas penggunaan; fakta lingkungan diperiksa langsung dan review mandiri akan dinyatakan bila reviewer terpisah tetap tidak tersedia. Tidak ada push, merge, publish, atau pembelian yang diizinkan oleh rencana ini.
