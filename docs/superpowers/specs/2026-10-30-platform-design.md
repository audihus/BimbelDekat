# Rancangan implementasi Platform Les Privat

Sumber perilaku: [PRD v0.2](../../../PRD_Platform_Les_Privat_v0_2.md), termasuk FR01–FR17 dan 38 skenario penerimaan. Audi meminta implementasi lokal setelah menyetujui Q1–Q38 sesuai jawaban masing-masing. Pilihan teknis kecil di bawah merupakan keputusan implementer, bukan tambahan persetujuan pengguna.

## Tujuan dan batas

Aplikasi web untuk guru les mandiri Indonesia: ruang kerja privat, murid, paket, jadwal, kehadiran, pembayaran manual, ringkasan wali, dan direktori guru yang dimoderasi. Bangun dan coba lokal tanpa menunggu perekrutan guru. Tidak ada deployment, pembelian, atau pembuatan layanan berbayar pada pekerjaan ini.

## Pendekatan yang dibandingkan dan dipilih

- Satu aplikasi yang dibagi menurut fitur dibanding tampilan/backend terpisah: Audi memilih monolitik pada Q33 untuk pengelolaan yang lebih sederhana.
- Database terpisah per guru dibanding satu database bersama: Audi memilih database bersama pada Q38 setelah penjelasan; isolasi data privat tetap wajib.
- Layanan akun tersendiri dibanding Supabase Auth: Audi memilih Supabase Auth pada Q37, dengan pengaman aplikasi tambahan sesuai PRD.

## Susunan

Next.js dan TypeScript menangani halaman serta proses server. PostgreSQL dan Supabase Auth berjalan lokal melalui Supabase CLI/Docker. Pada produksi, aplikasi direncanakan di Vercel dan database di Supabase; paket dan anggaran tetap terbuka. Kode dibagi menurut fitur dan menggunakan fungsi database untuk perubahan bisnis yang harus atomik.

Server memvalidasi identitas, sesi, kepemilikan ruang kerja, status akun, dan input. Database menegakkan kepemilikan, relasi, serta transaksi; akses langsung tidak boleh melewati aturan bisnis. Admin produk tidak mempunyai akses operasional privat guru. Rahasia hanya berada di lingkungan server.

Cookie browser berupa identitas sesi acak HttpOnly, bukan JWT/refresh token Supabase. Token penyedia dienkripsi AES-256-GCM di tabel privat dan hanya dipakai server. Pemisahan ini membuat pemeriksaan ulang kata sandi serta pencabutan sesi aplikasi tetap berada pada server; kredensial penyedia tidak dikirim ke browser. Waktu login tetap mengikuti awal sesi Supabase yang sah, bukan waktu refresh.

## Aturan yang mengikat

- Login guru maksimal tujuh hari dan admin delapan jam sejak login; aktivitas tidak memperpanjangnya. Tidak ada logout setelah 30 menit tidak aktif atau kewajiban MFA.
- Verifikasi email sebelum data nyata atau pengajuan profil; lokal dapat menggunakan akun dan data contoh terpisah.
- Satu murid dapat memiliki beberapa paket. Jatah, harga, uang diterima, dan pengembalian merupakan catatan terpisah.
- Penyelesaian les dan pembayaran harus idempoten. Pembatalan oleh guru tidak memotong jatah. Pembatalan berbayar memerlukan konfirmasi dan alasan.
- Jadwal aktif satu guru tidak bertabrakan. Paket tidak kedaluwarsa otomatis. Penutupan menyimpan sisa belum terpakai.
- Arsip murid membatalkan jadwal mendatang tanpa potong jatah dan mencabut tautan wali; riwayat dipertahankan.
- Ringkasan wali hanya satu relasi, hanya baca, berlaku tujuh hari, dapat dicabut. Token acak, tidak diindeks, dan tidak masuk log.
- Profil penuh tetap ditemukan dengan label tidak menerima murid. Perubahan kontak/layanan terbit menunggu moderasi; versi publik lama bertahan.
- Tindakan penting memerlukan kata sandi ulang. Pemulihan sekali pakai tidak mengharuskan akses email lama. Perubahan email biasa memerlukan konfirmasi lama dan baru.
- Penghapusan mempunyai masa batal tujuh hari; selama menunggu hanya ekspor atau batal yang diizinkan. Pemulihan cadangan tidak boleh membangkitkan akun/tautan yang dicabut.

## Keputusan implementer

- npm dan lockfile untuk dependensi, Vitest untuk aturan domain, serta pengujian SQL pada PostgreSQL lokal untuk transaksi dan isolasi.
- Semua nominal rupiah berupa bilangan bulat, tanpa perhitungan pecahan floating point pada uang.
- Zona waktu guru WIB/WITA/WIT; waktu pelaksanaan disimpan sebagai instan dengan zona tampilan terpisah.
- Tampilan awal berbahasa Indonesia dan mengutamakan ponsel, dengan nama deskriptif "Les Privat" sampai nama produk dipilih.
- Pengiriman email lokal menggunakan kotak surat pengujian Supabase. Penyedia email/domain produksi ditentukan sebelum online.
- Skema database dan perubahannya disimpan dalam migrasi yang dapat direproduksi; data contoh tidak berisi data pribadi nyata.

## Bukti dan batas penyelesaian

Kemajuan dicatat dalam rencana/ledger. Lulus unit test saja tidak membuktikan isolasi atau integrasi Auth; pemeriksaan PostgreSQL, build, dan alur pengguna diperlukan. Backup/pemulihan produksi, pengiriman email produksi, dan biaya hosting tidak dinyatakan siap tanpa konfigurasi serta bukti terpisah.
