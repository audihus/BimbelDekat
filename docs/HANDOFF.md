# Ringkasan konteks Platform Les Privat

## Tugas berikutnya

Audi menyetujui Q38 setelah penjelasan dan ilustrasi: "oke satu database bersama dulu". Permintaan terbaru adalah "lanjutkan implementasi yang sempat terhenti". Pekerjaan beralih ke implementasi lokal berdasarkan PRD dan Q1–Q38; jangan mengulang grilling yang sudah selesai atau melakukan deployment/pembelian. Desain dan rencana implementasi dicatat di docs/superpowers; kemajuan teknis harus diperbarui sesuai bukti pemeriksaan.

Riset terbaru ada di [riset hosting 30 Oktober 2026](./riset-hosting-2026-10-30.md). Metadata Vercel menunjukkan satu proyek `portofolio` dengan framework Next.js; paket akun belum diketahui. Metadata dibaca melalui tool Vercel `list_teams`, `get_team`, `list_projects`, dan `get_project`, tanpa mengambil env vars, token, berkas aplikasi, atau data tagihan. Akun yang sama dapat dipakai untuk proyek aplikasi les terpisah.

Vercel menjadi pilihan awal hosting aplikasi. Q33 menetapkan arsitektur monolitik: satu proyek aplikasi menangani tampilan dan proses server, dengan kode dibagi menurut fitur; database merupakan layanan tersendiri. Q34 menetapkan PostgreSQL di Supabase. Q35 menetapkan versi awal memerlukan internet untuk membaca data terbaru dan menyimpan perubahan, tanpa pencatatan offline dengan sinkronisasi. Q36 menetapkan Next.js + TypeScript dan Q37 menetapkan Supabase Auth untuk dasar akun dengan pengaman aplikasi tambahan sesuai PRD. Penyimpanan berkas dan susunan database bersama atau terpisah per guru belum dipilih. Railway dan Render sudah dibandingkan sebagai alternatif; tidak perlu menanyakan ulang pilihan hosting. Tidak ada pembelian, pembuatan resource, atau deployment yang dilakukan. Biaya bulanan saat online perlu dibahas, tanpa menjadikannya penghalang pembangunan lokal.

## Melanjutkan grilling tech stack setelah compact

- Nomor keputusan terakhir Q37. Q33 monolitik, Q34 PostgreSQL di Supabase, Q35 memerlukan internet, Q36 Next.js + TypeScript, dan Q37 Supabase Auth sudah ditetapkan. Q1 sampai Q32 juga sudah ditetapkan sesuai jawaban masing-masing, termasuk penolakan Q21 dan Q26. Jangan mengulang persetujuannya.
- Framework dan bahasa sudah dipilih: Next.js + TypeScript. Jangan menyimpulkan Audi menguasai Next.js hanya karena proyek portofolionya memakai framework itu.
- Database beserta penyedianya dan layanan akun sudah dipilih: PostgreSQL di Supabase serta Supabase Auth. Email produksi, pekerjaan otomatis, dan susunan database bersama atau terpisah untuk guru belum dipilih. Keputusan turunannya mengikuti pilihan yang sudah ditetapkan; jangan menanyakan keputusan yang masih bergantung pada jawaban lain dalam putaran yang sama.
- Q38 sudah disetujui setelah penjelasan dan ilustrasi: satu database bersama untuk seluruh guru dengan isolasi data privat per ruang kerja. Permintaan terbaru adalah implementasi, bukan putaran pertanyaan baru. Q39 belum diajukan.
- Riset Supabase Auth ada dalam dokumen riset hosting. Alur dasar email/kata sandi didukung, tetapi global sign-out tidak otomatis membatalkan access token lama; time-box bawaan bukan batas berbeda per peran yang tepat pada setiap permintaan. Recovery codes MFA eksperimental juga bukan otomatis pemulihan Q27 tanpa kata sandi/email. Auth sudah dipilih, tetapi seluruh aturan PRD tetap perlu desain dan pengujian aplikasi; jangan menganggapnya tersedia lengkap dari konfigurasi bawaan.
- Pertanyaan terakhir tentang biaya bulanan saat online belum dijawab. Vercel Hobby untuk penggunaan pribadi nonkomersial; Pro mulai US$20 per bulan untuk satu pengembang dengan kredit penggunaan US$20. Supabase Pro mulai US$25 dengan proyek pertama termasuk. US$45 per bulan hanya contoh biaya dasar keduanya, bukan anggaran yang disetujui atau total semua layanan.
- Cadangan harian Supabase Pro secara bawaan tersedia tujuh hari. PRD menetapkan batas simpan maksimal 30 hari, bukan kewajiban menyediakan riwayat penuh 30 hari; jangan otomatis menyimpulkan tujuh hari melanggar Q32. Rancangan pemulihan dan penerapan ulang penghapusan tetap diperlukan. Domain, email, penyimpanan cadangan, dan pemakaian tambahan belum dihitung. Rujuk sumber bertanggal dalam riset dan verifikasi ulang bila informasi harga atau layanan diperlukan.
- Bangun dan coba lokal terlebih dahulu; pemilihan paket berbayar sebelum online tidak menjadi syarat pembangunan lokal. Belum ada kode aplikasi, dependency, database, Git, atau bukti pengujian.

Sesi awal memakai `grill-with-docs`, yang menggabungkan `grilling` dan `domain-modeling`; diskusi keamanan dilanjutkan dengan `grill-me`/`grilling`. Keputusan sampai Q32 sudah dicatat sesuai jawaban masing-masing. Q31 sempat diminta ditunda, kemudian Audi meminta penjelasan dan menyetujui contoh alurnya; Q31 kini final, bukan pertanyaan terbuka. Pada 30 Oktober 2026, Audi meminta melanjutkan pekerjaan yang terhenti; yang dilanjutkan adalah pembaruan spesifikasi keamanan. Belum ada kode aplikasi. Gunakan bahasa Indonesia sederhana dan contoh konkret. Audi beberapa kali meminta istilah teknis dijelaskan dengan bahasa sehari-hari.

Ajukan satu putaran berisi keputusan yang dapat dijawab tanpa bergantung pada jawaban lain yang masih terbuka, disertai rekomendasi. Catat jawaban yang disetujui dalam PRD dan istilah yang sudah jelas dalam glossary. Jangan menganggap rekomendasi atau jawaban "belum paham" sebagai persetujuan. Jangan menanyakan ulang keputusan yang sudah disetujui.

## Workspace dan sumber utama

- Workspace: `F:\Porto\Les`, Windows PowerShell.
- [PRD](../PRD_Platform_Les_Privat_v0_2.md): spesifikasi lengkap dan keputusan hasil diskusi.
- [Glosarium](../GLOSSARY.md): istilah domain yang sudah diperjelas.
- [ADR akses wali](./adr/0001-akses-ringkasan-wali-melalui-tautan.md): alasan menggunakan tautan tanpa akun.
- [Riset hosting](./riset-hosting-2026-10-30.md): metadata Vercel yang dibaca, dukungan teknologi, contoh biaya, rekomendasi awal, dan keterbatasan cadangan 30 hari.
- Belum ada kode aplikasi, framework, database, Git, atau bukti pengujian keamanan. Pemeriksaan terakhir tidak menemukan `AGENTS.md` yang berlaku.

## Arah produk yang sudah disepakati

- Aplikasi web untuk guru les mandiri SD sampai SMA, les individual memakai paket pertemuan, dan mengajar minimal mingguan. Cakupan seluruh Indonesia.
- Satu guru mempunyai satu ruang kerja privat dengan satu pemilik, ditambah profil publik yang dapat dicari orang tua.
- Buat aplikasinya terlebih dahulu dan coba di komputer. Audi belum mempunyai guru untuk uji coba. Wawancara, perekrutan, dan bukti masalah bukan syarat memulai atau melanjutkan pembangunan.
- Biaya menjalankan aplikasi online dibahas sebelum dipasang online. Usulan lima guru selama empat minggu tetap rencana setelah aplikasi siap, bukan keputusan wajib atau gerbang pembangunan.
- Guru mendaftar dan masuk memakai email serta kata sandi, dengan fasilitas lupa kata sandi. Q20 disetujui: guru wajib mengeklik tautan verifikasi email sebelum memasukkan data murid sungguhan atau mengajukan profil publik; akun serta data contoh tetap dapat dipakai untuk pembangunan lokal. Q21 dijawab "gak perlu": kode masuk tambahan tidak dimasukkan ke versi awal.

## Aturan penggunaan yang sudah tercatat

- Satu murid dapat mempunyai beberapa paket terpisah pada guru yang sama, misalnya Matematika dan Bahasa Inggris. Jatah dan pembayaran dihitung per paket. Satu pertemuan memakai satu paket yang dipilih guru.
- Pemakaian jatah sebelum memakai aplikasi dicatat terpisah dari catatan pertemuan setelahnya. Penandaan les selesai tidak boleh memotong jatah dua kali akibat pengiriman ulang.
- Bedakan terjadwal, les selesai, batal tanpa potong jatah, dan batal dengan potong jatah. Pembatalan yang memotong jatah bukan les yang benar-benar berlangsung; guru mengonfirmasi pemotongan dan alasannya. Jika guru yang membatalkan, jatah tidak dipotong.
- Jadwal aktif guru yang sama tidak boleh bertabrakan. Penjadwalan ulang mempertahankan identitas pertemuan dan tidak memotong jatah.
- Ketika paket habis, guru mencatat paket baru sebelum menandai les lanjutan selesai. Paket baru boleh belum dibayar. Paket lama tetap menjadi riwayat dengan sisa nol.
- Jatah tidak otomatis hangus berdasarkan tanggal atau pergantian bulan. Paket boleh ditutup lebih awal sesuai kesepakatan dengan wali; sisa pertemuan tetap tercatat sebagai belum dipakai dan paket tidak dipakai untuk pertemuan baru.
- Harga kesepakatan, pemakaian jatah, dan uang diterima merupakan catatan berbeda. Pembayaran manual boleh sebagian, penuh, atau berlebih; kelebihan ditampilkan. Pengembalian uang dan koreksi dicatat terpisah dengan riwayat/alasan. Penutupan paket tidak otomatis mengubah uang atau harga kesepakatan.
- Pengarsipan murid mengeluarkannya dari daftar aktif, membatalkan jadwal mendatang tanpa potong jatah, dan mencabut tautan wali. Riwayat, sisa jatah, serta pembayaran tetap tersimpan. Murid dapat diaktifkan lagi; jadwal yang dibatalkan dan tautan yang dicabut tidak otomatis dipulihkan.

## Profil publik dan akses wali

- Satu profil dapat menampilkan beberapa penawaran, masing-masing dengan pelajaran, jenjang, mode online/tatap muka, durasi, dan tarif.
- Profil baru berupa draf dan diperiksa pengelola sebelum terbit. Perubahan nomor WhatsApp atau informasi layanan diperiksa kembali; informasi publik lama tetap terlihat sampai perubahan disetujui. Guru dapat menjeda profil.
- PENTING: guru yang sedang tidak menerima murid baru TETAP muncul di pencarian dan halaman profil, dengan keterangan yang sesuai. Jangan menyamakan kapasitas menerima murid dengan status penerbitan profil.
- Pencarian tatap muka mengikuti daerah yang bersedia didatangi guru, terpisah dari tempat tinggalnya. Contoh: tinggal di Bekasi, bersedia mengajar di Depok, dapat ditemukan untuk Depok. Pencarian online dapat lintas Indonesia.
- Tombol WhatsApp hanya membuka percakapan; pengguna mengirim sendiri. Klik bukan bukti pesan, percakapan, atau murid bergabung.
- Tautan wali dibuka tanpa akun, hanya untuk satu relasi guru dan murid, berlaku tujuh hari, dapat dicabut, dan dicabut saat murid diarsipkan. Siapa pun yang memegang tautan yang masih berlaku dapat membaca ringkasannya, termasuk penerima tautan terusan; konsekuensi ini dijelaskan kepada guru.
- Ringkasan wali mencakup jadwal, penggunaan paket, dan pembayaran. Q23 diperjelas: "pembatasannya tidak perlu". Alamat, nomor telepon, dan catatan terkait murid dapat ikut terlihat bila memang dicatat untuk relasi itu; jangan menganggap data tersebut wajib dikumpulkan. Tetap hanya baca untuk satu relasi; penerima tautan terusan dapat membaca rincian yang sama selama tautan masih berlaku. Tidak membuka data murid lain atau rahasia akun.
- Di luar versi awal: akun murid anak, akun wali lengkap, pembayaran melalui platform, komisi les, obrolan internal, rating publik, kelas kelompok, dan lembaga dengan banyak pengajar.

## Keamanan: sudah menjadi persyaratan, belum diterapkan

- Pemisahan data setiap guru dengan pemeriksaan akses di server, termasuk baca, ubah, hapus, ekspor, dan berkas. Mengubah ID tidak boleh membuka data guru lain.
- Q22 disetujui setelah penjelasan: tersedia tombol keluar dari semua perangkat; guru dapat menggunakannya setelah masuk dari laptop atau HP lain. Pemulihan kata sandi yang berhasil otomatis mencabut semua login aktif akun itu. Data les tetap tersimpan.
- Q24 disetujui setelah contoh diperjelas: pada versi awal pengelola membantu lewat laporan masalah atau gambar layar dengan data pribadi ditutupi; fitur izin akses sementara ke catatan privat guru ditunda. Admin tetap dapat meninjau profil publik, tetapi hak aplikasi tidak memberikan akses catatan privat guru. Jika akses bantuan khusus kelak dibuat, izin terbatas, alasan, dan riwayat harus dirancang terlebih dahulu.
- Q25 disetujui: guru memasukkan ulang kata sandi sebelum mengganti email, mengganti kata sandi dari pengaturan, mengekspor seluruh data, atau meminta penghapusan akun. Alur pemulihan ketika kata sandi lupa memakai pembuktian akses tersendiri.
- Q26 ditolak: tidak menerapkan usulan keluar otomatis setelah 30 menit tanpa aktivitas. Jangan mengembalikan aturan yang sama sebagai persyaratan. Q29 kemudian menetapkan batas keseluruhan lama login: guru tujuh hari pada perangkat yang sama dan pengelola delapan jam sejak login; aktivitas tidak menggeser batas akhir tersebut.
- Q27 disetujui: menyediakan kode pemulihan sekali pakai, disimpan guru di tempat aman selain HP-nya, untuk keadaan lupa kata sandi dan email tidak dapat diakses.
- Q28 disetujui: permintaan penghapusan mempunyai masa batal tujuh hari sebelum penghapusan diproses. Profil publik langsung disembunyikan dan tautan wali langsung dicabut. Q31 kemudian disetujui setelah contoh diperjelas: selama menunggu, guru hanya dapat mengunduh data atau membatalkan permintaan, tanpa menambah atau mengubah catatan les. Setelah pembatalan, penggunaan normal kembali; profil diaktifkan lagi oleh guru sesuai aturan penerbitan dan tautan wali dibuat baru. Tautan lama tetap dicabut. Masa simpan backup ditetapkan pada Q32.
- Q30 disetujui: perubahan email biasa memerlukan kata sandi yang sah dan konfirmasi dari email lama serta baru. Email lama tetap berlaku sampai kedua konfirmasi selesai. Bila email lama tidak dapat diakses, gunakan jalur pemulihan dengan kode cadangan Q27.
- Q32 disetujui: cadangan harian disimpan bergulir maksimal 30 hari sejak dibuat, kemudian dihapus. Salinan lama mungkin masih memuat data akun yang sudah dihapus; ketika dipakai untuk pemulihan, penghapusan serta aturan akses terkini harus diterapkan kembali sebelum data dibuka.
- Tautan wali tidak boleh dapat ditebak; halaman tidak diindeks. Log tidak memuat kata sandi, token tautan, isi pesan, atau nomor telepon lengkap.
- Riwayat perubahan, backup harian, uji pemulihan sebelum data nyata, ekspor milik guru, serta jalur penghapusan akun sudah tercantum dalam PRD.
- Semua poin ini masih persyaratan. Jangan menyatakan aplikasi sudah aman, terlindungi, atau lolos tes: kode aplikasi belum ada.

## Status pembahasan keamanan

Keputusan perilaku pengguna pada putaran Q20 sampai Q32 sudah ditetapkan. Q20, Q22, Q24, Q25, Q27, Q28, Q29, Q30, Q31, dan Q32 disetujui; Q21 dan Q26 ditolak; Q23 diperjelas. Jangan menanyakan ulang keputusan final atau otomatis mengembalikan kewajiban kode tambahan maupun batas tidak aktif 30 menit. Pembahasan tampilan belum dilanjutkan dan belum ada kode aplikasi atau bukti pengujian keamanan.

Pengaman teknis dasar seperti penyimpanan kata sandi, validasi, pembatasan percobaan login, dan pemeriksaan akses perlu dirancang serta diuji; jangan menjadikannya pertanyaan apakah pengguna ingin perlindungan dasar.

Rujukan primer yang telah dibuka untuk menyiapkan pembahasan: [autentikasi OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [verifikasi email](https://cheatsheetseries.owasp.org/cheatsheets/Email_Validation_and_Verification_Cheat_Sheet.html), [pemisahan tenant](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html), dan [pemulihan kata sandi](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html). Rujukan ini belum mengubah keputusan produk.

## Compact internal

Ringkasan ini disimpan sebagai pegangan setelah pemadatan konteks. Tidak tersedia alat dalam sesi ini untuk memicu compact internal secara langsung. Dokumentasi resmi menjelaskan perintah [`/compact`](https://learn.chatgpt.com/docs/developer-commands?surface=cli) untuk memadatkan konteks percakapan. Jangan menyatakan compact internal sudah dilakukan hanya karena file ini dibuat.
