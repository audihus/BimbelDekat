# Riset hosting dan pilihan teknologi

Tanggal pemeriksaan: 30 Oktober 2026. Status: hasil riset; Audi memilih Vercel sebagai pilihan awal hosting aplikasi, kemudian menetapkan arsitektur monolitik (Q33), PostgreSQL di Supabase (Q34), penggunaan yang memerlukan internet (Q35), Next.js + TypeScript (Q36), serta Supabase Auth (Q37). Susunan database bersama atau terpisah untuk guru (Q38), layanan pendukung, paket layanan, biaya, dan deployment belum dipilih atau disetujui.

## Akun Vercel yang sudah ada

Pemeriksaan metadata melalui tool baca Vercel `list_teams`, `get_team`, `list_projects`, dan `get_project` menemukan satu proyek bernama `portofolio` dengan framework `nextjs`. Paket Hobby atau Pro dan URL produksi tidak tersedia pada respons yang dibaca. Tidak ada environment variable, token, berkas aplikasi, atau tagihan pribadi yang diambil.

Akun yang sama dapat dipakai untuk proyek aplikasi les yang terpisah. Proyek baru mempunyai konfigurasi dan alamatnya sendiri; penggunaan tetap mengikuti kuota serta penagihan team. Ini tidak memerlukan penggantian proyek portofolio. Lihat [dokumentasi proyek Vercel](https://vercel.com/docs/projects) dan [penggunaan lintas proyek](https://vercel.com/docs/pricing/manage-and-optimize-usage).

## Pilihan yang dibandingkan

| Hosting | Contoh bahasa/framework | Biaya dasar dan cakupan |
| --- | --- | --- |
| Vercel | Next.js dengan JavaScript atau TypeScript | Hobby US$0 untuk penggunaan pribadi nonkomersial. Pro mulai US$20 per bulan untuk satu kursi pengembang, dengan kredit pemakaian US$20; pemakaian tambahan dapat ditagihkan. Database dihitung terpisah. |
| Railway | Laravel dengan PHP; aplikasi dan PostgreSQL dapat dikelola dalam satu platform | Hobby minimum US$5 per bulan termasuk kredit pemakaian US$5. Pro minimum US$20 termasuk kredit pemakaian US$20. Biaya akhir mengikuti pemakaian aplikasi, database, dan layanan lain. |
| Render | JavaScript/TypeScript melalui Node.js, Python, Ruby, Go, Rust, Elixir; PHP/Laravel melalui Docker | Aplikasi dan database dibayar sebagai layanan terpisah. Contoh resmi Render September 2026 mencantumkan web kecil US$7 dan PostgreSQL kecil US$6 per bulan, sekitar US$13 sebelum layanan tambahan. Angka ini estimasi komponen kecil, bukan penawaran lengkap aplikasi. |

Rujukan: [Next.js di Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs), [Vercel Pro](https://vercel.com/docs/plans/pro-plan), [ketentuan Hobby](https://vercel.com/legal/terms), [harga Railway](https://railway.com/pricing), [Laravel di Railway](https://docs.railway.com/guides/laravel), [bahasa yang didukung Render](https://render.com/docs/language-support), [contoh biaya Render](https://render.com/articles/production-rails-hosting-guide), dan [halaman harga Render](https://render.com/pricing).

## Rekomendasi awal

Usulan awal untuk kondisi proyek ini: Next.js sebagai framework aplikasi, TypeScript sebagai bahasa kode, dan PostgreSQL sebagai database, dengan Supabase sebagai calon penyedia database serta fasilitas akun/penyimpanan. Audi kemudian memilih Vercel sebagai hosting awal, arsitektur monolitik, PostgreSQL di Supabase, Next.js + TypeScript, serta Supabase Auth. Layanan penyimpanan berkas dan paket berbayar belum dipilih.

Next.js dapat menangani tampilan dan proses aplikasi dalam satu proyek. Proyek Next.js di Vercel yang sudah ada menunjukkan bahwa alur deployment tersebut sudah pernah dipakai. Pilihan ini tetap memerlukan penerapan pemeriksaan akses per guru, hitungan paket yang aman, dan aturan keamanan yang sudah tercatat di PRD; layanan hosting tidak otomatis menerapkan aturan bisnis tersebut.

## Perkiraan biaya dan hal yang perlu dihitung

- [Supabase](https://supabase.com/pricing) mempunyai paket Free dan Pro mulai US$25 per bulan dengan proyek pertama termasuk; proyek tambahan mulai US$10 per bulan. Database Free memiliki batas pemakaian dan dapat dijeda setelah satu minggu tidak aktif.
- Contoh konfigurasi berbayar untuk satu pengembang dan satu proyek database: Vercel Pro US$20 + Supabase Pro US$25 = US$45 per bulan sebagai biaya dasar. Ini bukan biaya minimum semua konfigurasi atau jaminan total tagihan. Jika team Vercel sudah Pro, tidak otomatis perlu membayar biaya platform kedua hanya untuk menambahkan proyek; penggunaan tambahan tetap diperhitungkan.
- Vercel Hobby ditujukan untuk penggunaan pribadi nonkomersial. Jika aplikasi digunakan sebagai layanan usaha/komersial, pemilihan paket mengikuti [ketentuan Vercel](https://vercel.com/legal/terms); jangan menjanjikan penggunaan komersial tetap gratis.
- [Cadangan harian Supabase Pro](https://supabase.com/docs/guides/platform/backups) tersedia selama tujuh hari. PRD menetapkan masa simpan maksimal 30 hari, bukan kewajiban menyediakan riwayat penuh 30 hari; jangan otomatis menyatakan cadangan tujuh hari melanggar keputusan tersebut. Rancangan pemulihan, penerapan ulang penghapusan, dan cadangan tambahan bila diperlukan tetap harus ditetapkan. Cadangan database juga tidak otomatis mencadangkan berkas Storage.
- Domain, pengiriman email verifikasi/pemulihan, penyimpanan cadangan, pekerjaan otomatis, pajak, dan pemakaian di atas kuota perlu dimasukkan ketika menyusun biaya sebelum online. Nominal rupiah belum dihitung; seluruh angka di atas dalam dolar AS dan dapat berubah.
- Pembangunan tetap dimulai secara lokal sesuai keputusan sebelumnya. Pemilihan dan pembayaran layanan online tidak menjadi syarat untuk mulai menulis aplikasi lokal.

## Kesesuaian calon layanan akun

Supabase Auth dipilih pada Q37 untuk dasar akun, dengan tambahan pada aplikasi agar memenuhi aturan PRD. Pemeriksaan dokumentasi resmi pada 30 Oktober 2026 menemukan:

- [Email dan kata sandi](https://supabase.com/docs/guides/auth/passwords), verifikasi email, serta pemulihan kata sandi melalui email didukung. Konfirmasi perubahan email melalui alamat lama dan baru tersedia melalui [double confirmation](https://supabase.com/docs/guides/local-development/cli/config#auth.email.double_confirm_changes).
- [Global sign-out](https://supabase.com/docs/guides/auth/signout) mencabut refresh token, tetapi access token yang sudah diterbitkan masih berlaku sampai kedaluwarsa. Fitur ini saja belum memenuhi penghentian akses privat segera.
- [Batas waktu sesi bawaan](https://supabase.com/docs/guides/auth/sessions) tersedia pada paket Pro ke atas, dikonfigurasi pada tingkat proyek, dan diperiksa saat refresh. Batas absolut guru tujuh hari serta pengelola delapan jam tetap memerlukan pemeriksaan aplikasi yang mengikuti awal login, validitas sesi, dan status akun; waktu penerbitan token yang diperbarui tidak boleh dianggap awal login baru.
- Dokumentasi mempunyai [recovery codes eksperimental untuk MFA](https://supabase.com/docs/reference/javascript/auth-mfa-recovery-codes-verify). Alur tersebut menaikkan tingkat autentikasi sesi yang sudah ada; jangan menganggapnya memenuhi kode pemulihan Q27 ketika kata sandi dan email tidak tersedia. Pemulihan Q27 tetap perlu dirancang tersendiri tanpa mengubah penolakan kewajiban MFA.
- Jika data diakses melalui server aplikasi, akses langsung dari browser tidak boleh melewati pemeriksaan yang sama. [Dokumentasi keamanan database](https://supabase.com/docs/guides/database/secure-data) dan [Data API](https://supabase.com/docs/guides/api/securing-your-api) menjelaskan grants, RLS, dan pilihan menonaktifkan Data API bila tidak dipakai. Kunci rahasia yang dapat melewati RLS hanya berada di server.
- [SMTP produksi](https://supabase.com/docs/guides/auth/auth-smtp) perlu dipilih terpisah; pengiriman email bawaan ditujukan untuk pengujian dengan penerima terbatas.

Inferensi asisten yang mendasari rekomendasi: Supabase Auth layak menjadi layanan identitas dasar, dengan pengaman tambahan pada aplikasi untuk seluruh aturan PRD. Audi kemudian menyetujui pemakaiannya pada Q37. Belum ada pengaturan, kode, atau pengujian yang dilakukan.

## Keputusan berikutnya

Audi sudah menetapkan Q33 monolitik, Q34 PostgreSQL di Supabase, Q35 penggunaan yang memerlukan internet, Q36 Next.js + TypeScript, dan Q37 Supabase Auth. Q38 tentang satu database bersama dengan isolasi data privat setiap guru belum diputuskan: Audi meminta penjelasan dan ilustrasi. Paket Vercel/Supabase, layanan pendukung, serta anggaran bulanan saat online juga belum dipilih. Pertanyaan anggaran terakhir belum dijawab. Bahas pilihan yang masih terbuka tanpa menanyakan ulang keputusan yang sudah final; anggaran online tidak menjadi penghalang pembangunan lokal.
