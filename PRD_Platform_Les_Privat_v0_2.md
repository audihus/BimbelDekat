# PRD Platform Les Privat

Versi 0.2 | Draf untuk diskusi | Diperbarui 30 Oktober 2026  
Pemilik produk: Audi Husen Mustofa  
Nama aplikasi: belum ditetapkan

## 1 Tujuan produk

Membantu guru les privat di seluruh Indonesia mendapatkan calon murid dan mengelola kegiatan les melalui satu aplikasi web.

Produk terdiri dari direktori profil guru yang dapat dicari publik dan ruang kerja privat untuk setiap guru. Ruang kerja menyediakan pengelolaan murid, paket pertemuan, jadwal, kehadiran, dan catatan pembayaran.

Tujuan awal adalah penggunaan rutin pada les nyata. Keberhasilan tidak dinilai hanya dari jumlah pendaftaran atau tampilan profil. Guru perlu memperoleh manfaat meskipun calon murid baru belum datang dari direktori.

## 2 Keputusan dan asumsi

| Topik | Status | Isi |
| --- | --- | --- |
| Pelanggan utama | Ditetapkan dalam diskusi | Guru les privat. Orang tua atau calon murid juga menjadi pengguna sisi pencarian. |
| Model produk | Ditetapkan dalam diskusi | SaaS dengan banyak ruang kerja guru, ditambah halaman promosi dan pencarian guru. |
| Multi tenant | Ditetapkan dalam diskusi | Data operasional masing-masing guru dipisahkan. Profil yang sengaja dipublikasikan dapat dicari lintas guru. |
| Kontak calon murid | Usulan MVP | Tombol WhatsApp. Percakapan berlangsung di WhatsApp; pengguna sendiri yang mengirim pesan. |
| Cakupan wilayah | Ditetapkan dalam diskusi | Seluruh Indonesia sejak versi awal. Pendaftaran dan penggunaan tidak dibatasi satu kota. |
| Segmen pertama | Ditetapkan dalam diskusi | Guru mandiri pelajaran SD sampai SMA di seluruh Indonesia, dengan les individual, memakai paket sejumlah pertemuan, dan mengajar minimal mingguan. |
| Cara masuk guru | Ditetapkan dalam diskusi | Guru mendaftar dan masuk menggunakan email serta kata sandi, dengan fasilitas lupa kata sandi. |
| Verifikasi email | Ditetapkan dalam diskusi | Guru mengeklik tautan verifikasi dari emailnya sebelum memasukkan data murid sungguhan atau mengajukan profil publik. Pengembangan lokal tetap dapat memakai akun dan data contoh. |
| Perubahan email | Ditetapkan dalam diskusi | Perubahan email biasa membutuhkan kata sandi yang sah serta konfirmasi melalui email lama dan email baru. Jika email lama tidak dapat diakses, gunakan alur pemulihan dengan kode cadangan. |
| Pengaman masuk tambahan | Tidak diperlukan pada versi awal | Audi menolak usulan kode tambahan saat masuk pada Q21. Versi awal menggunakan email dan kata sandi, dengan verifikasi email yang disetujui pada Q20. |
| Mengakhiri login perangkat | Ditetapkan dalam diskusi | Guru dapat memakai tombol keluar dari semua perangkat melalui perangkat lain. Pemulihan kata sandi yang berhasil otomatis mencabut semua login yang sedang aktif pada akun itu. |
| Pemeriksaan tindakan penting | Ditetapkan dalam diskusi | Guru memasukkan ulang kata sandi sebelum mengganti email, mengganti kata sandi dari pengaturan, mengekspor seluruh data, atau meminta penghapusan akun. |
| Keluar setelah 30 menit tidak aktif | Ditolak | Tidak menerapkan usulan keluar otomatis setelah 30 menit tanpa aktivitas. Batas keseluruhan lama login mengikuti Q29. |
| Batas keseluruhan lama login | Ditetapkan dalam diskusi | Guru dapat tetap masuk pada perangkat yang sama hingga tujuh hari sejak login; akun pengelola hingga delapan jam. Setelah batas tersebut, pengguna harus masuk kembali. |
| Kode pemulihan | Ditetapkan dalam diskusi | Disediakan kode pemulihan sekali pakai untuk disimpan guru di tempat aman selain HP-nya, sebagai jalan pemulihan ketika kata sandi lupa dan email tidak dapat dibuka. |
| Permintaan penghapusan akun | Ditetapkan dalam diskusi | Guru mempunyai waktu tujuh hari untuk membatalkan sebelum penghapusan diproses. Profil publik langsung disembunyikan dan tautan wali langsung dicabut saat permintaan dibuat. Selama menunggu, akses terbatas pada mengunduh data atau membatalkan permintaan; penggunaan normal kembali setelah dibatalkan, dengan pengaktifan profil secara manual dan tautan wali baru. |
| Masa simpan cadangan | Ditetapkan dalam diskusi | Cadangan harian disimpan bergulir maksimal 30 hari sejak dibuat, kemudian dihapus. Salinan lama mungkin masih memuat data akun yang sudah dihapus; proses pemulihan harus menerapkan kembali penghapusan sebelum data dapat diakses. |
| Bantuan versi awal | Ditetapkan dalam diskusi | Guru menjelaskan masalah atau menunjukkan gambar layar dengan data pribadi ditutupi. Pengelola membantu melalui laporan tersebut; versi awal tidak menyediakan fitur izin akses sementara untuk membuka catatan privat guru. |
| Mulai pembangunan | Ditetapkan dalam diskusi | Buat aplikasinya terlebih dahulu berdasarkan PRD dan keputusan lanjutan. Wawancara guru dan bukti masalah bukan syarat untuk memulai atau melanjutkan pembangunan. |
| Pengembangan awal | Ditetapkan dalam diskusi | Aplikasi dibuat dan dicoba di komputer terlebih dahulu. Biaya menjalankan aplikasi secara online dibahas sebelum dipasang online. |
| Hosting aplikasi | Pilihan awal pengguna | Vercel, menggunakan proyek aplikasi les yang terpisah dari proyek portofolio. Paket Vercel dan anggaran belum dipilih. |
| Arsitektur aplikasi | Ditetapkan dalam diskusi | Monolitik: tampilan dan proses server berada dalam satu proyek aplikasi, dengan kode dibagi menurut fitur. Database tetap merupakan layanan tersendiri. |
| Framework dan bahasa | Ditetapkan dalam diskusi | Next.js dan TypeScript. |
| Database | Ditetapkan dalam diskusi | PostgreSQL di Supabase. Layanan penyimpanan berkas dan paket berbayar belum dipilih. |
| Susunan database | Ditetapkan dalam diskusi | Satu database bersama untuk seluruh guru pada versi awal, dengan identitas ruang kerja pada catatan privat serta pemeriksaan akses di server dan database. |
| Layanan akun | Ditetapkan dalam diskusi | Supabase Auth untuk dasar pengelolaan akun, dengan pengaman aplikasi tambahan agar seluruh aturan keamanan dalam PRD tetap dipenuhi. |
| Koneksi penggunaan | Ditetapkan dalam diskusi | Saat sudah dipasang online, versi awal memerlukan internet untuk membaca data terbaru dan menyimpan perubahan; pencatatan offline dengan sinkronisasi ditunda. |
| Catatan les | Ditetapkan dalam diskusi | Bedakan les selesai, batal tanpa potong jatah, dan batal dengan potong jatah. Pemotongan saat batal harus dikonfirmasi guru. |
| Beberapa paket per murid | Ditetapkan dalam diskusi | Satu murid dapat memiliki beberapa paket terpisah pada guru yang sama, misalnya Matematika dan Bahasa Inggris. Setiap paket memiliki hitungan jatah dan pembayaran sendiri; setiap sesi memilih satu paket. |
| Masa berlaku paket | Ditetapkan dalam diskusi | Pada versi awal, jatah yang belum dipakai tidak otomatis hangus karena berganti bulan atau melewati tanggal tertentu. |
| Penutupan paket lebih awal | Ditetapkan dalam diskusi | Guru dapat menutup paket sesuai kesepakatan dengan wali sebelum semua jatah dipakai. Sisa pertemuan tetap dicatat sebagai belum dipakai; pengembalian uang dicatat terpisah sesuai jumlah yang benar-benar dikembalikan. |
| Pengarsipan murid | Ditetapkan dalam diskusi | Murid dikeluarkan dari daftar aktif, jadwal mendatang dibatalkan tanpa potong jatah, dan tautan wali dicabut. Riwayat les, sisa jatah, dan pembayaran tetap tersimpan; murid dapat diaktifkan kembali. |
| Pembatalan oleh guru | Ditetapkan dalam diskusi | Selalu masuk batal tanpa potong jatah. |
| Jadwal bertabrakan | Ditetapkan dalam diskusi | Jadwal aktif guru yang sama tidak boleh bertumpang tindih. Jadwal baru atau perubahan yang berbenturan ditolak dan waktunya harus diganti. |
| Kelebihan bayar | Ditetapkan dalam diskusi | Penerimaan dicatat sesuai uang yang diterima meskipun melebihi harga paket. Kelebihan ditampilkan terpisah; pengembaliannya dicatat bila dilakukan. |
| Les berikutnya saat jatah habis | Ditetapkan dalam diskusi | Guru mencatat paket baru untuk les lanjutan sebelum menandainya selesai. Paket lama tetap tersimpan sebagai riwayat yang sudah habis; pembayaran paket baru boleh menyusul. |
| Ringkasan wali | Ditetapkan dalam diskusi | Dibuka melalui tautan tanpa akun untuk satu relasi guru dan murid. Tautan berlaku tujuh hari dan dapat dicabut guru; konsekuensi meneruskan tautan dijelaskan sebelum dibagikan. |
| Rincian ringkasan wali | Ditetapkan dalam diskusi | Audi tidak memerlukan pembatasan jenis data pada Q23: alamat, nomor telepon, dan catatan terkait murid dapat ikut terlihat bila memang dicatat untuk relasi tersebut. Akses tetap hanya baca untuk satu relasi; keputusan ini tidak mewajibkan pengumpulan data tambahan. |
| Perubahan profil terbit | Ditetapkan dalam diskusi | Perubahan nomor WhatsApp atau informasi layanan diperiksa pengelola sebelum ditampilkan ke publik. Profil lama tetap terlihat sampai perubahan disetujui; guru dapat menyembunyikan profil sementara bila diperlukan. |
| Status tidak menerima murid | Ditetapkan dalam diskusi | Profil tetap muncul dalam hasil pencarian dan dapat dibuka melalui tautan, dengan keterangan sedang tidak menerima murid baru. Status ini terpisah dari status penerbitan profil. |
| Penawaran les | Ditetapkan dalam diskusi | Satu profil dapat memuat beberapa penawaran dengan pelajaran, jenjang, mode online atau tatap muka, durasi, dan tarif masing-masing. |
| Pencocokan wilayah tatap muka | Ditetapkan dalam diskusi | Pencarian mengikuti daerah yang bersedia didatangi guru untuk mengajar di tempat murid. Guru dapat ditemukan untuk daerah layanan tersebut meskipun tinggal di daerah lain. |
| Pencarian wilayah | Usulan MVP | Provinsi, kabupaten atau kota, kecamatan, dan mode online atau tatap muka. |
| Pilot | Usulan setelah aplikasi siap | Lima guru dengan murid aktif selama empat minggu setelah onboarding. Peserta dapat berasal dari berbagai kota; ketersediaan peserta bukan syarat pembangunan aplikasi. |
| Biaya pilot | Usulan | Gratis selama periode uji yang disepakati. Tidak ada tagihan atau perpanjangan berbayar otomatis. |
| Akses pengguna awal | Belum tersedia | Audi belum mempunyai guru yang dapat dijadikan peserta uji coba. Pembangunan tetap dilanjutkan terlebih dahulu. |
| Solusi teknis dan biaya | Sebagian ditetapkan | Hosting awal Vercel, arsitektur monolitik, Next.js + TypeScript, satu database PostgreSQL bersama di Supabase, dan Supabase Auth telah dipilih. Layanan pendukung, waktu pengerjaan, serta batas biaya online masih terbuka. |

Masalah, kesediaan membayar, dan target angka dalam PRD ini belum merupakan hasil riset pasar. Semua ketentuan berstatus usulan dapat direvisi setelah diskusi dan observasi pengguna.

### Cakupan seluruh Indonesia

Guru dapat mendaftar dari wilayah mana pun di Indonesia. Profil menyimpan lokasi umum dan area layanan tatap muka yang ditetapkan guru. Untuk les online, calon murid dapat mencari guru lintas kota tanpa dipaksa berada di kota yang sama.

Untuk les tatap muka, pencarian mencocokkan daerah yang dicari orang tua dengan daerah yang bersedia didatangi guru. Contoh: guru yang tinggal di Bekasi tetapi bersedia mengajar di Depok dapat muncul saat orang tua mencari guru untuk Depok. Lokasi umum guru dan area layanan tatap muka merupakan informasi yang berbeda.

Data pilihan wilayah mencakup seluruh provinsi serta kabupaten atau kota di Indonesia, dengan kecamatan untuk memperjelas area layanan. Sumber data wilayah nasional dan cara memperbaruinya perlu ditetapkan saat implementasi. Tidak ada pemeriksaan akses yang membatasi aplikasi pada satu kota peluncuran.

### Arti pilot

Pilot berarti uji coba awal: beberapa guru mencoba aplikasi yang sudah bisa digunakan untuk kegiatan les mereka. Dari pemakaian itu, kita melihat bagian yang mudah, yang membingungkan, dan yang perlu diperbaiki.

Usulan pilot adalah lima guru selama empat minggu. Jumlah peserta dan durasi ini masih dapat diubah. Guru peserta dapat berasal dari berbagai kota; pilot membatasi skala pendampingan dan evaluasi awal, sementara cakupan layanan aplikasi tetap seluruh Indonesia.

Saat ini belum ada guru yang dapat dijadikan peserta uji coba. Aplikasi dibuat dan dicoba di komputer terlebih dahulu; perekrutan peserta tidak menjadi syarat pembangunan.

## 3 Masalah yang ingin diuji

**Masalah operasional.** Jadwal dan perubahan sesi mungkin tersebar di chat, buku, atau spreadsheet. Guru perlu menghitung ulang kehadiran, sisa paket, dan pembayaran ketika menyusun rekap.

**Masalah mendapatkan murid.** Guru mungkin mengandalkan kenalan dan unggahan di grup. Calon orang tua perlu menemukan pengajar yang sesuai pelajaran, jenjang, lokasi, tarif, dan cara mengajar.

Kertas atau WhatsApp sendiri bukan bukti ada masalah. Bukti yang dicari adalah kejadian nyata seperti selisih hitungan sesi, jadwal bertabrakan, waktu rekap yang lama, atau calon murid yang tidak memperoleh informasi yang dibutuhkan.

| Pengguna | Tugas yang ingin diselesaikan | Hasil yang diharapkan |
| --- | --- | --- |
| Guru | Mengetahui siapa yang diajar hari ini dan sisa paketnya | Persiapan mengajar dan rekap lebih mudah |
| Guru | Menjelaskan layanan kepada calon murid | Satu profil yang dapat dibagikan dan mudah dipahami |
| Orang tua atau calon murid dewasa | Menemukan guru dan bertanya tentang les | Informasi cukup untuk memilih siapa yang dihubungi |
| Orang tua | Mengecek jadwal dan sisa paket anaknya | Hitungan yang konsisten dengan catatan guru |
| Pengelola platform | Membantu guru mulai menggunakan dan mengevaluasi manfaat | Keputusan pengembangan berdasarkan penggunaan nyata |

Untuk pilot les sekolah, komunikasi calon murid diarahkan kepada orang tua atau wali. Akun murid anak tidak termasuk MVP.

## 4 Fokus dan lingkup MVP

**Nilai operasional utama:** guru dapat mencatat sesi yang terlaksana dan mendapatkan sisa paket yang benar.

**Nilai promosi utama:** guru dapat membagikan profil dan dihubungi calon murid.

P0 adalah usulan fitur utama versi awal. P1 dievaluasi setelah versi awal dapat digunakan. Pembangunan fitur tidak menunggu uji coba bersama guru.

| Prioritas | Kemampuan |
| --- | --- |
| P0 | Akun guru, pemulihan akses, dan satu ruang kerja per guru |
| P0 | Data murid, paket pertemuan, jadwal, kehadiran, dan pembayaran manual |
| P0 | Ringkasan terbatas yang dapat dibagikan kepada wali |
| P0 | Profil publik dengan tarif, durasi, area layanan di Indonesia, dan status menerima murid |
| P0 | Pencarian guru lintas Indonesia, filter wilayah dan mode mengajar, serta kontak WhatsApp |
| P0 | Moderasi profil, saluran bantuan, serta pencatatan penggunaan inti |
| P1 | Jadwal mingguan berulang, pengingat otomatis, impor massal |
| P1 | Akun wali lengkap, materi atau catatan perkembangan belajar |
| P1 | Statistik promosi pada dashboard guru dan paket langganan berbayar |

### Di luar MVP

Obrolan internal, pembayaran melalui platform, komisi per les, pemesanan slot otomatis, video call, rating publik, kelas kelompok, lembaga dengan banyak pengajar, penggajian guru, dan pencocokan menggunakan AI.

MVP menyediakan direktori dan alat pengelolaan. Kesepakatan les dilakukan langsung antara guru dan calon murid. Pengembangan transaksi di platform memerlukan keputusan produk tambahan.

## 5 Alur pengguna

### Guru mulai menggunakan

1. Guru mendaftar dan memperoleh ruang kerja, lalu mengeklik tautan verifikasi yang dikirim ke emailnya sebelum memakai data murid sungguhan.
2. Guru menambahkan satu murid yang sudah diajar.
3. Guru mencatat paket aktif beserta jumlah sesi yang sudah terpakai sebelum memakai aplikasi.
4. Guru membuat jadwal berikutnya.
5. Setelah les, guru menandai sesi terlaksana.
6. Aplikasi memperbarui sisa paket; guru dapat membagikan ringkasannya kepada wali.

Data awal dapat dimasukkan bersama pendiri saat onboarding. Aktivitas rutin berikutnya perlu dilakukan sendiri oleh guru agar penggunaan dapat dinilai.

### Guru mempromosikan layanan

1. Guru melengkapi profil dan memilih untuk memublikasikannya.
2. Pengelola memeriksa kelengkapan dan kontak saat pilot.
3. Profil muncul di direktori dan mempunyai tautan yang bisa dibagikan.
4. Guru memperbarui status menerima murid ketika kapasitas berubah.

Status sedang tidak menerima murid baru tidak menyembunyikan profil dari pencarian; keterangan tersebut ditampilkan pada hasil pencarian dan halaman profil. Jika nomor WhatsApp atau informasi layanan pada profil terbit diubah, profil lama tetap terlihat sampai pengelola menyetujui perubahan. Guru dapat menyembunyikan profil sementara bila diperlukan.

### Orang tua menemukan guru

1. Orang tua mencari berdasarkan pelajaran, jenjang, provinsi, kabupaten atau kota, kecamatan, atau online/offline. Untuk les tatap muka, filter wilayah mengikuti daerah yang bersedia didatangi guru. Untuk les online, lokasi guru tidak menjadi pembatas kecuali dipilih sebagai filter oleh pengguna.
2. Orang tua membaca profil, tarif beserta durasinya, dan area layanan.
3. Tombol kontak membuka WhatsApp dengan pesan awal yang dapat diubah.
4. Orang tua sendiri mengirim pesan dan berdiskusi dengan guru.
5. Jika les disepakati, guru menambahkan murid ke ruang kerjanya dan mencatat sumber perkenalan.

Klik WhatsApp belum membuktikan pesan terkirim, percakapan terjadi, atau murid bergabung.

## 6 Kebutuhan fungsional

| ID | Kebutuhan P0 | Kriteria penerimaan |
| --- | --- | --- |
| FR01 | Akun dan ruang kerja | Guru mendaftar dan masuk menggunakan email serta kata sandi, dapat keluar dari satu atau semua perangkat, dan dapat memulihkan akses melalui fasilitas lupa kata sandi. Pemulihan kata sandi yang berhasil otomatis mencabut seluruh login aktif pada akun itu. Kepemilikan email dibuktikan melalui tautan verifikasi sebelum memasukkan data murid sungguhan atau mengajukan profil publik. Kode masuk tambahan tidak diperlukan pada versi awal. Semua data operasional terikat pada ruang kerjanya. Perubahan identitas pada permintaan tidak membuka akses ke guru lain. |
| FR02 | Data murid | Guru dapat menambah, mengubah, mencari, mengarsipkan, dan mengaktifkan kembali murid. Pengarsipan membatalkan jadwal mendatang tanpa potong jatah dan mencabut tautan wali; riwayat les, sisa jatah, dan pembayaran tetap tersimpan. Data minimal adalah nama panggilan, jenjang, dan kontak wali bila diperlukan. Kontak tidak diwajibkan untuk mulai mencatat sesi. |
| FR03 | Paket pertemuan | Paket memuat nama atau pelajaran, jumlah sesi, harga kesepakatan, dan saldo pembukaan. Satu murid dapat memiliki beberapa paket dengan hitungan jatah dan pembayaran terpisah. Saldo pembukaan ditampilkan terpisah dari sesi yang dicatat setelah onboarding. Jatah tidak otomatis hangus berdasarkan tanggal. Ketika jatah habis, guru mencatat paket baru untuk les lanjutan; pembayaran boleh menyusul dan riwayat paket lama dipertahankan. Guru dapat menutup paket lebih awal sesuai kesepakatan, dengan sisa jatah tetap dicatat sebagai belum dipakai dan pengembalian uang dicatat terpisah. |
| FR04 | Jadwal | Guru dapat membuat, mengubah, dan membatalkan sesi individual. Pembuatan atau perubahan jadwal ditolak jika bertumpang tindih dengan jadwal aktif guru yang sama. Sesi menampilkan murid, satu paket yang dipilih, waktu, dan mode mengajar. |
| FR05 | Kehadiran dan saldo | Catatan membedakan les selesai, batal tanpa potong jatah, dan batal dengan potong jatah. Les selesai mengurangi jatah tepat satu kali; pembatalan yang memotong jatah harus dikonfirmasi guru dengan alasan. Pembatalan oleh guru selalu tanpa potong jatah. Penjadwalan ulang mempertahankan identitas sesi. Koreksi mengembalikan atau menyesuaikan jatah dengan riwayat alasan. |
| FR06 | Pembayaran manual | Guru mencatat pembayaran sebagian, penuh, atau melebihi harga paket sesuai uang yang diterima. Total diterima, sisa pembayaran, dan kelebihan bayar dihitung per paket dari catatan. Koreksi atau pengembalian dicatat sebagai perubahan beralasan, bukan penghapusan diam-diam. |
| FR07 | Ringkasan untuk wali | Guru membuat tautan tanpa akun untuk membaca satu relasi guru dan murid. Ringkasan menampilkan jadwal, penggunaan paket, dan pembayaran yang relevan; alamat, nomor telepon, dan catatan terkait murid dapat ikut terlihat bila dicatat untuk relasi itu, sesuai penolakan pembatasan pada Q23. Tautan berlaku tujuh hari dan dapat dicabut guru. Sebelum dibagikan, guru diberi penjelasan bahwa siapa pun yang memegang tautan yang masih berlaku dapat membaca ringkasan tersebut. |
| FR08 | Profil publik | Memuat nama tampilan, foto opsional, deskripsi, metode, provinsi, kabupaten atau kota, area layanan tatap muka, status menerima murid, dan satu atau beberapa penawaran les. Setiap penawaran memuat pelajaran, jenjang, mode online atau tatap muka, durasi, dan tarifnya sendiri. Lokasi dari seluruh Indonesia dapat dipilih. Profil baru dimulai sebagai draf. |
| FR09 | Direktori | Hanya profil terbit yang ditampilkan. Profil yang sedang tidak menerima murid baru tetap muncul, dengan keterangan yang terlihat di hasil pencarian dan halaman profil. Profil draf, menunggu penerbitan awal, dijeda guru, atau disembunyikan pengelola tidak masuk hasil pencarian. Filter pelajaran, jenjang, provinsi, kabupaten atau kota, kecamatan, dan mode berfungsi. Pencarian tatap muka mencocokkan wilayah yang dicari dengan area yang bersedia didatangi guru. Filter lokasi bersifat pilihan; les online dapat dicari lintas Indonesia. Jika tidak ada hasil, tampilkan keadaan kosong dan pilihan memperluas filter. |
| FR10 | Kontak WhatsApp | Menggunakan kontak publik yang dipilih guru. Tombol membuka WhatsApp atau jalur web yang sesuai. Tidak mengirim pesan otomatis dan tidak memuat data murid dari ruang kerja. |
| FR11 | Sumber murid | Saat menambah murid, guru dapat memilih sudah menjadi murid sebelumnya, tautan profil, pencarian website, sumber lain, atau tidak diketahui. Isian ini merupakan laporan guru. |
| FR12 | Moderasi dan bantuan | Pengelola dapat meninjau, menerbitkan, atau menyembunyikan profil dengan alasan. Perubahan nomor WhatsApp atau informasi layanan pada profil terbit menunggu pemeriksaan; profil lama tetap tampil sampai perubahan disetujui. Guru dapat menyembunyikan profil sementara bila diperlukan. Pengguna dapat melaporkan profil dan meminta bantuan melalui saluran yang terlihat. Bantuan memakai penjelasan masalah atau gambar layar dengan data pribadi ditutupi; fitur akses bantuan sementara ke catatan privat guru ditunda. |
| FR13 | Perlindungan tindakan penting | Pada alur pengaturan akun, guru harus memasukkan ulang kata sandi sebelum mengganti email, mengganti kata sandi, mengekspor seluruh data, atau meminta penghapusan akun. Kata sandi yang tidak sah tidak mengizinkan tindakan tersebut. Alur pemulihan saat kata sandi lupa mengikuti pembuktian akses tersendiri. |
| FR14 | Kode pemulihan akun | Guru memperoleh kode pemulihan sekali pakai untuk disimpan di tempat aman selain HP-nya. Kode dapat dipakai untuk memulihkan akun ketika kata sandi lupa dan email tidak dapat dibuka. Kode yang tidak sah atau sudah terpakai tidak dapat digunakan untuk memulihkan akses. |
| FR15 | Permintaan penghapusan akun | Guru dapat meminta penghapusan akun setelah pemeriksaan kata sandi. Profil langsung disembunyikan dan tautan wali langsung dicabut. Permintaan dapat dibatalkan selama tujuh hari sebelum penghapusan diproses. Selama menunggu, akses dibatasi pada mengunduh data atau membatalkan permintaan; penambahan dan perubahan catatan les ditolak. Setelah dibatalkan, penggunaan normal kembali, profil perlu diaktifkan kembali oleh guru sesuai aturan penerbitan, dan tautan wali dibuat baru karena tautan lama tetap dicabut. Cadangan mengikuti masa simpan maksimal 30 hari sejak dibuat. |
| FR16 | Batas keseluruhan lama login | Login guru pada perangkat yang sama berlaku maksimal tujuh hari sejak login; login pengelola maksimal delapan jam. Setelah batas berakhir, akses privat memerlukan login kembali. Tidak menerapkan batas keluar otomatis setelah 30 menit tanpa aktivitas. Pencabutan login dapat mengakhiri akses lebih awal. |
| FR17 | Perubahan email akun | Perubahan email biasa hanya berlaku setelah kata sandi diperiksa serta konfirmasi diterima dari email lama dan baru. Sebelum keduanya dikonfirmasi, email lama tetap menjadi email akun. Jika email lama tidak dapat diakses, pemilik memakai alur pemulihan kode cadangan; admin tidak memperoleh jalur penggantian email tanpa pembuktian akses. |

Tombol dan hasil penyimpanan harus memberi kepastian apakah tindakan berhasil. Pengiriman ulang formulir tidak boleh menggandakan murid, pembayaran, atau pencatatan kehadiran tanpa sengaja.

## 7 Aturan bisnis inti

### Identitas guru dan profil

- Satu tutor mandiri memiliki satu ruang kerja dengan satu pemilik pada MVP.
- Guru wajib memverifikasi email sebelum memasukkan data murid sungguhan atau mengajukan profil publik. Pembuatan dan percobaan aplikasi lokal tetap dapat menggunakan akun serta data contoh.
- Guru dapat mengakhiri login pada semua perangkat dari perangkat lain yang masih dapat dipakai. Pemulihan kata sandi yang berhasil otomatis mencabut semua login aktif pada akun tersebut; perangkat harus masuk lagi untuk mengakses data. Mengakhiri login tidak menghapus data murid atau riwayat les.
- Guru memasukkan ulang kata sandi sebelum mengganti email, mengganti kata sandi dari pengaturan, mengunduh seluruh data, atau meminta penghapusan akun. Pemulihan ketika kata sandi lupa menggunakan alur pembuktian akses tersendiri.
- Usulan keluar otomatis setelah 30 menit tanpa aktivitas ditolak. Batas keseluruhan lama login adalah tujuh hari sejak login untuk guru pada perangkat yang sama dan delapan jam untuk akun pengelola; setelah itu harus masuk kembali. Aktivitas tidak memperpanjang batas keseluruhan tersebut.
- Perubahan email biasa membutuhkan kata sandi yang sah dan konfirmasi dari email lama serta email baru. Email lama tetap menjadi email akun sampai kedua konfirmasi selesai. Jika email lama tidak dapat diakses, pemulihan menggunakan kode cadangan.
- Kode pemulihan sekali pakai disediakan agar guru dapat memulihkan akun ketika kata sandi lupa dan email tidak dapat dibuka. Guru diarahkan menyimpannya di tempat aman selain HP yang dipakai sehari-hari.
- Permintaan penghapusan akun langsung menyembunyikan profil publik dan mencabut tautan wali. Guru mempunyai waktu tujuh hari untuk membatalkan sebelum penghapusan diproses. Selama menunggu, guru hanya dapat mengunduh data atau membatalkan permintaan; penambahan dan perubahan catatan les dihentikan. Setelah pembatalan, penggunaan normal kembali, tetapi profil tidak otomatis terbit dan tautan wali lama tetap dicabut. Guru mengaktifkan kembali profil sesuai aturan penerbitan dan membuat tautan wali baru bila diperlukan. Salinan cadangan mengikuti aturan maksimal 30 hari sejak dibuat pada bagian 10.
- Guru secara eksplisit memilih informasi yang diterbitkan dan menyetujui penggunaan nomor kontak publik.
- Alamat rumah lengkap, data murid, dan kalender rinci tidak ditampilkan di direktori.
- Profil memiliki status draf, menunggu peninjauan, terbit, dijeda oleh guru, atau disembunyikan pengelola.
- Status menerima murid baru terpisah dari status penerbitan. Profil terbit yang sedang tidak menerima murid baru tetap muncul dalam pencarian, dengan keterangan yang terlihat, dan tetap dapat dibuka melalui tautan.
- Perubahan nomor WhatsApp atau informasi layanan pada profil terbit diperiksa pengelola sebelum ditampilkan. Selama menunggu persetujuan, informasi publik yang lama tetap terlihat; guru dapat menjeda profil bila ingin menyembunyikannya sementara.
- Satu profil dapat memuat beberapa penawaran les, masing-masing dengan pelajaran, jenjang, mode, durasi, dan tarif. Contoh penawaran dalam satu profil: Matematika SD Rp75.000 untuk 60 menit dan Matematika SMA Rp100.000 untuk 90 menit. Tarif penawaran menjelaskan layanan publik; harga paket untuk murid dicatat berdasarkan kesepakatan lesnya.
- Area layanan tatap muka adalah daerah yang bersedia didatangi guru untuk mengajar di tempat murid. Pencarian tatap muka mengikuti area tersebut, terpisah dari lokasi umum tempat guru tinggal.
- Pemeriksaan kontak tidak boleh ditampilkan sebagai jaminan kualitas mengajar atau validasi seluruh kualifikasi.
- Urutan awal memakai aturan sederhana dan transparan. Klaim rekomendasi, rating, atau jumlah murid tidak dibuat tanpa data.

### Sesi dan paket

Satu murid dapat memiliki beberapa paket terpisah pada guru yang sama, misalnya paket Matematika dan paket Bahasa Inggris. Setiap sesi menggunakan satu paket yang dipilih guru, dan setiap paket memiliki hitungan jatah serta pembayaran sendiri.

Pada versi awal, jatah yang belum dipakai tidak otomatis hangus karena berganti bulan atau melewati tanggal tertentu. Sisa jatah tetap dapat digunakan sampai terpakai selama paket belum ditutup secara eksplisit sesuai kesepakatan.

Status sesi adalah terjadwal, terlaksana, atau dibatalkan. Penundaan memindahkan jadwal sesi yang sama. Lewatnya waktu jadwal tidak otomatis membuktikan sesi terlaksana.

Catatan yang dilihat guru dan wali membedakan tiga hasil: **les selesai**, **batal tanpa potong jatah**, dan **batal dengan potong jatah**. Pembatalan yang memotong jatah tidak dihitung sebagai les yang benar-benar berlangsung. Sesi yang belum mempunyai hasil tetap ditampilkan sebagai terjadwal.

Paket dihitung sebagai:

**Sisa jatah pertemuan = jatah awal - pemakaian jatah sebelum memakai aplikasi - pemakaian jatah setelah memakai aplikasi + koreksi jatah.**

Contoh ilustratif: paket delapan pertemuan, tiga sudah terpakai sebelum aplikasi, lalu dua sesi baru terlaksana. Sisa paket menjadi tiga. Memindahkan satu jadwal mendatang tidak mengubahnya.

Sesi terjadwal tidak mengurangi saldo. Sesi terlaksana mengurangi satu. Untuk pembatalan, kebijakan guru harus dicatat; bila pembatalan menghabiskan kuota, guru mengonfirmasinya secara eksplisit dan alasannya tersimpan. Kebijakan berlaku pada paket terkait dan tidak mengubah catatan lama secara diam-diam.

Jika guru yang membatalkan, pertemuan selalu dicatat sebagai batal tanpa potong jatah.

Pemakaian jatah mencakup les selesai dan pembatalan yang disepakati memotong jatah. Sebagai contoh, satu pembatalan yang memotong jatah dari paket delapan pertemuan menyisakan tujuh, dengan jumlah les yang benar-benar berlangsung tetap nol.

Satu sesi tidak dapat menggunakan kuota dari dua paket. Pengarsipan murid mempertahankan riwayat.

Ketika seluruh jatah sudah terpakai dan murid melanjutkan les, guru mencatat paket baru sebelum menandai pertemuan berikutnya selesai. Paket lama tetap tersimpan dengan sisa nol sebagai riwayat yang sudah habis; pertemuan lanjutan menggunakan paket baru. Paket baru tidak harus dibayar terlebih dahulu, dan pembayaran dicatat ketika diterima. Pencatatan ini tidak membuat sisa jatah paket lama menjadi negatif.

Contoh: paket pertama berisi delapan pertemuan yang semuanya sudah terpakai. Guru mencatat paket kedua berisi delapan pertemuan; setelah satu les lanjutan selesai, sisa paket kedua menjadi tujuh dan sisa paket pertama tetap nol.

Pembuatan dan perubahan jadwal ditolak bila waktunya bertumpang tindih dengan jadwal aktif guru yang sama. Guru harus memilih waktu yang tidak berbenturan.

### Penutupan paket dan pengarsipan murid

Guru dapat menutup paket lebih awal sesuai kesepakatan dengan wali. Paket ditandai ditutup dan tidak lagi digunakan untuk pertemuan baru; sisa jatah tetap dicatat sebagai belum dipakai, bukan dianggap sebagai les selesai atau pemakaian jatah. Contoh: paket delapan pertemuan yang baru dipakai tiga dapat ditutup dengan catatan lima pertemuan belum dipakai.

Pengembalian uang dicatat terpisah sesuai jumlah yang benar-benar dikembalikan. Penutupan paket tidak otomatis mengubah harga kesepakatan atau catatan penerimaan uang; bila harga kesepakatan berubah, guru mencatat penyesuaian harga dengan alasan seperti aturan pembayaran yang sudah ada.

Saat murid diarsipkan, murid dikeluarkan dari daftar aktif, jadwal mendatang yang masih terjadwal dibatalkan tanpa potong jatah, dan tautan wali yang masih berlaku dicabut. Riwayat les, sisa jatah, dan pembayaran tetap tersimpan. Pengarsipan tidak otomatis memotong sisa jatah, mengubah pembayaran, atau menutup paket.

Guru dapat mengaktifkan kembali data murid yang kembali les. Jadwal yang sudah dibatalkan dan tautan yang sudah dicabut tidak diaktifkan kembali secara otomatis; guru membuat jadwal atau tautan baru bila diperlukan.

### Pembayaran

Harga paket, penerimaan uang, dan jumlah sesi yang diberikan adalah catatan berbeda. Paket delapan sesi yang baru dibayar sebagian tetap memiliki hitungan jatah berdasarkan pemakaiannya, termasuk pembatalan yang disepakati memotong jatah.

Status belum dibayar, dibayar sebagian, atau lunas berasal dari catatan penerimaan bersih dibandingkan harga kesepakatan. Catatan manual tidak diberi label sebagai pembayaran terverifikasi bank.

Jika uang yang diterima melebihi harga paket, aplikasi tetap mencatat jumlah sebenarnya dan menampilkan kelebihan bayar secara terpisah. Contoh: harga paket Rp400.000 dengan penerimaan Rp450.000 menunjukkan sisa pembayaran nol dan kelebihan Rp50.000. Bila kelebihan dikembalikan, guru mencatat pengembalian tersebut sehingga penerimaan bersih dan kelebihan diperbarui sesuai catatan.

Penyesuaian harga, koreksi pembayaran, dan pengembalian harus memiliki alasan dan riwayat. Aplikasi membantu pencatatan; proses transfer uang tetap dilakukan di luar platform pada MVP.

### Akses ringkasan

Tautan berlaku tujuh hari, dan guru dapat menerbitkan ulang atau mencabutnya. Wali cukup membuka tautan tanpa membuat akun. Siapa pun yang memegang tautan yang masih berlaku dapat membaca ringkasan, termasuk orang yang menerima tautan terusan; guru diberi penjelasan ini sebelum membagikannya. Token tidak boleh dapat ditebak dari nomor urut murid. Halaman tidak diindeks mesin pencari.

Satu wali dapat mempunyai relasi dengan beberapa guru, tetapi tautan MVP hanya membuka satu relasi. Data murid dari guru berbeda tidak digabung otomatis berdasarkan kesamaan nama atau nomor telepon.

Pembatasan jenis informasi yang diusulkan pada Q23 tidak diperlukan. Selain jadwal, penggunaan paket, dan pembayaran, alamat, nomor telepon, dan catatan terkait murid dapat ditampilkan bila memang dicatat untuk relasi tersebut. Keputusan ini tidak menambah kewajiban mengumpulkan data itu. Tautan tetap hanya memberikan hak baca atas satu relasi, bukan akses untuk mengubah catatan, membaca murid lain, atau melihat rahasia akun. Penerima tautan terusan dapat membaca rincian yang sama selama tautan masih berlaku.

## 8 Multi tenant dan hak akses

Profil publik merupakan bagian yang sengaja dibuka. Data operasional tetap memiliki batas kepemilikan per ruang kerja.

| Data atau tindakan | Pengunjung | Guru pemilik | Guru lain | Pemegang tautan wali | Admin aplikasi |
| --- | --- | --- | --- | --- | --- |
| Melihat profil terbit | Ya | Ya | Ya | Ya | Ya |
| Mengubah profil guru | Tidak | Miliknya | Tidak | Tidak | Moderasi status dengan catatan |
| Mengelola murid, sesi, paket, pembayaran | Tidak | Miliknya | Tidak | Tidak | Tidak pada MVP |
| Melihat ringkasan murid | Tidak | Miliknya | Tidak | Relasi yang diberi akses | Tidak pada MVP |
| Melihat laporan penggunaan agregat | Tidak | P1 untuk miliknya | Tidak | Tidak | Ya, dengan data minimal |

Pemeriksaan akses dilakukan pada server untuk baca, ubah, hapus, ekspor, dan akses berkas. Menyembunyikan tombol di antarmuka belum cukup.

Pada MVP, admin produk membantu melalui laporan masalah atau gambar layar dengan data pribadi ditutupi, tanpa fitur untuk membuka catatan privat guru. Jika akses bantuan sementara ditambahkan pada versi berikutnya, rancangan harus menetapkan izin terbatas, alasan, dan riwayat sebelum fitur tersebut digunakan. Pendekatan deployment dan database diputuskan dalam rancangan teknis; label tenant pada data saja tidak dianggap cukup untuk menjamin isolasi.

## 9 Data minimum

| Entitas | Isi pokok |
| --- | --- |
| Akun dan ruang kerja | Identitas pemilik, keanggotaan, status akun |
| Profil publik | Informasi guru, lokasi umum guru, area layanan tatap muka berupa daerah yang bersedia didatangi, kontak publik, status terbit, status menerima murid, dan pengajuan perubahan informasi publik |
| Penawaran les | Profil guru, pelajaran, jenjang, mode online atau tatap muka, durasi, dan tarif |
| Wilayah dan zona waktu | Data wilayah Indonesia beserta hubungan antarwilayah; zona waktu guru dan tampilan wali |
| Murid | Identitas lokal dalam ruang kerja, jenjang, kontak wali opsional, sumber perkenalan, status aktif atau diarsipkan |
| Paket | Murid, nama atau pelajaran, kuota, pemakaian awal, harga, aturan pembatalan, catatan penutupan dan jatah tersisa yang belum dipakai; tanpa penghangusan jatah otomatis berdasarkan tanggal pada versi awal |
| Sesi | Murid, paket, waktu, mode, status, konsumsi kuota |
| Perubahan saldo | Nilai perubahan, alasan, pembuat, waktu, referensi sesi bila ada |
| Catatan pembayaran | Nominal, jenis pembayaran atau koreksi, tanggal, paket, alasan |
| Tautan wali | Relasi yang diizinkan, masa berlaku, status pencabutan |
| Aktivitas produk | Jenis tindakan, pengenal minimal, waktu; tanpa isi pesan WhatsApp |

Tanggal lahir anak, dokumen identitas, informasi sekolah terperinci, dan rekaman pelajaran tidak diperlukan untuk MVP.

## 10 Pengalaman dan mutu layanan

- Versi awal dibuat dan dicoba di komputer terlebih dahulu. Biaya menjalankan aplikasi secara online dibahas sebelum dipasang online.
- Saat dipasang online, versi awal memerlukan koneksi internet untuk membaca data terbaru dan menyimpan perubahan. Pencatatan tanpa internet dengan sinkronisasi setelah tersambung kembali tidak termasuk versi awal; aturan mempertahankan isian dan konfirmasi penyimpanan saat koneksi gagal tetap berlaku.
- Antarmuka mengutamakan ponsel. Tambah sesi, tandai terlaksana, dan lihat saldo mudah dijangkau dari halaman awal.
- Guru dapat mencoba dengan data contoh yang terpisah, lalu beralih ke data nyata. Data contoh tidak dihitung sebagai adopsi.
- Sesudah pengenalan singkat, target tugas menandai satu sesi dan melihat saldo adalah paling lama satu menit.
- Penambahan murid pertama, paket, dan jadwal ditargetkan selesai dalam sepuluh menit saat uji kegunaan.
- Formulir mempertahankan isian saat koneksi gagal dan menjelaskan tindakan pemulihan. Konfirmasi berhasil hanya muncul setelah tersimpan.
- Zona waktu jadwal mendukung WIB, WITA, dan WIT. Jadwal menampilkan zona waktu guru dan menyesuaikan tampilan wali bila berbeda. Satu sesi tetap menunjuk waktu pelaksanaan yang sama; perubahan tampilan zona waktu tidak membuat sesi baru atau mengubah saldo.
- Label formulir, fokus keyboard, ukuran teks, dan pesan kesalahan harus dapat dipahami pengguna.
- Target kapasitas uji awal adalah sepuluh ruang kerja dan total seratus murid. Ini batas skenario pengujian awal, bukan pembatasan bisnis jangka panjang.
- Riwayat perubahan penting, pencatatan error, backup harian, dan satu uji pemulihan tersedia sebelum data pilot digunakan.
- Cadangan harian disimpan bergulir maksimal 30 hari sejak dibuat, kemudian dihapus. Setelah penghapusan akun diproses, salinan lama dapat tetap berada dalam cadangan sampai masa simpannya berakhir. Saat cadangan dipakai memulihkan aplikasi, penghapusan akun dan aturan akses terkini harus diterapkan kembali sebelum data dapat diakses, agar data yang sudah dihapus tidak muncul lagi.
- Log tidak menyimpan kata sandi, token tautan wali, isi pesan, atau nomor telepon lengkap.
- Tersedia ekspor data milik guru dan jalur permintaan penghapusan akun. Data privat tidak berubah menjadi publik ketika akun diarsipkan.

Target waktu tugas di atas adalah usulan yang perlu diuji, bukan hasil pengukuran yang sudah dicapai.

## 11 Mengukur aplikasi yang dipakai

### Ukuran utama

**Jumlah guru yang menggunakan aplikasi untuk mencatat sesi les nyata setiap minggu.**

Aktivitas membuka halaman atau login saja tidak dihitung sebagai penggunaan utama. Laporan membedakan tindakan guru sendiri dan tindakan pendiri yang mendampingi.

### Target pilot usulan

Target di bawah digunakan setelah aplikasi siap dan peserta tersedia. Angka peserta dan durasi uji coba tidak menjadi syarat pembangunan aplikasi.

| Ukuran | Definisi | Target awal |
| --- | --- | --- |
| Aktivasi | Guru memasukkan murid nyata, paket, jadwal, dan mencatat satu sesi terlaksana dalam tujuh hari sejak onboarding | Sedikitnya empat dari lima guru |
| Penggunaan minggu keempat | Guru yang sudah aktif mencatat setidaknya satu sesi nyata pada hari ke-22 sampai ke-28 | Sedikitnya tiga guru; laporkan juga jumlah yang sudah aktif |
| Tugas mandiri | Guru memperbarui sesi dan menemukan saldo tanpa pendiri mengoperasikan aplikasi | Dapat dilakukan oleh setiap peserta aktif |
| Manfaat rekap | Waktu tugas rekap yang sama dibandingkan dengan kondisi awal | Catat perubahan per guru; tetapkan target setelah baseline |
| Minat melanjutkan | Guru memilih melanjutkan pemakaian setelah pilot dan dapat menjelaskan manfaatnya | Sedikitnya tiga dari lima guru; konfirmasi lewat penggunaan lanjutan |
| Integritas data | Hitungan paket cocok dengan sampel catatan yang disepakati dan tidak ada akses lintas tenant yang tidak diizinkan | Wajib lulus sebelum peluncuran dan saat pilot |

Kriteria peserta awal: tutor mempunyai murid aktif dan kegiatan les setidaknya mingguan. Bila guru sedang libur atau tidak memiliki kesempatan mengajar, jelaskan pengaruhnya terhadap angka penggunaan.

Dengan lima peserta, angka ini dipakai untuk keputusan produk awal dan tidak dianggap mewakili seluruh pasar.

### Pengukuran promosi

Pisahkan tampilan profil, klik kontak, percakapan yang dikonfirmasi guru, dan murid baru yang dikonfirmasi guru. Guru dapat melaporkan sumber perkenalan; atribusi tersebut bukan verifikasi otomatis.

Catat kunjungan dari tautan yang dibagikan guru dan dari hasil pencarian secara terpisah. Aktivitas pengujian dan pengelola tidak dihitung sebagai permintaan nyata.

Tidak ada target jumlah murid baru yang dijanjikan sebelum tersedia baseline jumlah guru, kunjungan relevan, dan permintaan yang masuk.

## 12 Cara mendapatkan pengguna awal

Pembangunan aplikasi dimulai terlebih dahulu. Wawancara dan pengamatan pengguna dapat membantu perbaikan, tetapi tidak menjadi syarat pembangunan.

1. Bangun dan coba versi awal di komputer berdasarkan alur dan aturan yang disepakati dalam diskusi produk, tanpa menunggu guru untuk uji coba.
2. Setelah aplikasi dapat dicoba, cari guru yang bersedia menggunakannya. Bila belum ada kenalan, cari melalui komunitas guru daring dan jejaring berbagai daerah; pesan hanya dikirim oleh pemilik proyek setelah memilih calon yang tepat. Perekrutan tidak dibatasi satu kota.
3. Saat guru mencoba, pelajari contoh rekap, perubahan jadwal, dan cara menghitung sisa paket yang mereka gunakan. Bantu memasukkan data awal dengan persetujuan mereka.
4. Usulan pendampingan dimulai dari dua guru, lalu diperluas menjadi lima guru. Urutan dan jumlah ini masih perlu diputuskan.
5. Terbitkan profil guru yang setuju dan bantu mereka membagikan tautan melalui saluran yang biasa dipakai.
6. Amati beberapa orang tua mencari guru dan memahami profil, termasuk kebutuhan tatap muka setempat dan les online lintas kota. Gunakan temuan untuk memperbaiki informasi yang kurang.
7. Selama uji coba, catat alasan guru tetap memakai, berhenti, atau kembali ke pencatatan lama.

Waktu uji coba bersama guru bergantung pada ketersediaan peserta. Tanggal penyelesaian versi awal dan tanggal peluncuran belum ditetapkan.

## 13 Tahap rilis dan keputusan lanjut

Pembangunan versi awal tidak menunggu wawancara atau bukti masalah dari guru. Urutan uji bersama dua guru dan pilot lima guru di bawah ini masih berupa usulan, bukan syarat yang sudah disetujui untuk melanjutkan pembangunan fitur.

| Tahap | Hasil yang diuji | Syarat melanjutkan |
| --- | --- | --- |
| Pembangunan versi awal | Aplikasi dibangun dan dicoba di komputer berdasarkan PRD dan keputusan lanjutan | Alur dapat dicoba; hitungan dan batas akses diuji sebelum memakai data nyata |
| Uji alur inti (usulan) | Dua guru memakai data les nyata | Pencatatan sesi, saldo, dan akses data benar serta dapat dipakai mandiri |
| Pilot MVP (usulan) | Lima guru yang dapat berasal dari berbagai kota; direktori dan kontak bercakupan nasional aktif | Ukuran penggunaan, manfaat, dan hambatan tercatat selama empat minggu |
| Evaluasi | Penggunaan nyata dan wawancara akhir | Putuskan memperbaiki alur, mempersempit segmen, atau membuka akses lebih luas |
| Uji berbayar | Penawaran konkret dengan harga yang diinformasikan | Tutor menyatakan kesediaan membayar dan biaya layanan dapat dihitung |

Jika guru membuat profil tetapi tidak menggunakan pengelolaan les, selidiki apakah kebutuhan utamanya memang promosi atau alur operasional terlalu berat. Jika pengelolaan dipakai tetapi direktori sepi, evaluasi distribusi calon orang tua dan kecocokan lokasi.

## 14 Hipotesis pendapatan dan biaya

Opsi awal adalah langganan alat pengelolaan untuk guru. Promosi profil dapat menjadi layanan tambahan setelah platform mempunyai pengunjung yang relevan.

Harga belum ditetapkan. Dasarnya harus mencakup manfaat bagi guru, kemampuan membayar, biaya infrastruktur, dukungan, dan waktu onboarding. Tidak ada klaim penghematan atau peningkatan pendapatan sebelum diukur.

Selama MVP, platform tidak mengambil komisi les. Percakapan dan transaksi berlangsung di luar aplikasi sehingga pencatatan komisi belum menjadi dasar bisnis yang dapat diandalkan.

Catat biaya bulanan, biaya layanan pihak ketiga, dan waktu dukungan per guru. Sediakan ekspor agar guru tetap dapat membawa catatannya bila memilih berhenti.

## 15 Risiko dan respons produk

| Risiko | Respons yang diuji |
| --- | --- |
| Guru enggan memasukkan data awal | Mulai dari satu murid dan satu paket; tawarkan onboarding terbatas |
| Tidak ada alasan membuka aplikasi | Jadikan catatan sesi dan saldo sebagai alur utama; ukur penggunaan mingguan |
| Direktori tidak mempunyai pengunjung | Profil tetap berguna sebagai tautan yang dibagikan guru; perluas distribusi lewat jejaring berbagai daerah dengan pencarian wilayah yang relevan |
| Jumlah klik dianggap murid baru | Pisahkan metrik kontak, percakapan, dan pendaftaran |
| Kebijakan paket guru berbeda | Simpan aturan per paket dan amati kesesuaian sebelum menerima peserta |
| Guru lupa memperbarui catatan | Uji kemudahan pembaruan dan kebiasaan setelah mengajar sebelum menambah otomatisasi |
| Profil menyesatkan atau kontak tidak aktif | Peninjauan manual, pelaporan, dan kemampuan menyembunyikan profil |
| Data privat tercampur | Otorisasi server, uji lintas tenant, pembatasan tautan, serta riwayat akses |
| Cakupan membesar | Selesaikan ukuran manfaat utama sebelum mengambil fitur P1 |

## 16 Skenario penerimaan sebelum pilot

1. Guru A tidak bisa membaca, mengubah, menghapus, mengekspor, atau membuka berkas Guru B dengan mengganti ID atau parameter.
2. Pengunjung hanya melihat profil yang terbit; data murid tidak muncul di halaman publik maupun hasil pencarian.
3. Tautan wali A dapat dibuka tanpa akun, hanya menampilkan relasi yang diizinkan, berlaku tujuh hari, dan berhenti membuka ringkasan setelah kedaluwarsa atau dicabut. Sebelum dibagikan, guru diberi penjelasan akibat meneruskan tautan.
4. Paket delapan sesi dengan tiga sesi awal dan dua sesi baru terpakai menunjukkan sisa tiga.
5. Klik ganda pencatatan kehadiran mengurangi saldo satu kali. Koreksi mengembalikan jumlah yang tepat dan mempunyai riwayat.
6. Penjadwalan ulang mempertahankan satu sesi dan tidak mengurangi saldo. Pembuatan atau perubahan jadwal yang bertumpang tindih dengan jadwal aktif guru yang sama ditolak.
7. Les selesai, batal tanpa potong jatah, dan batal dengan potong jatah dapat dibedakan dalam catatan. Pembatalan mengikuti kebijakan paket dan memerlukan keputusan eksplisit bila mengurangi jatah; pembatalan yang memotong jatah tidak menambah jumlah les yang benar-benar berlangsung.
8. Pembayaran sebagian, pelunasan, dan koreksi menunjukkan jumlah yang benar tanpa mengubah saldo sesi.
9. Profil draf atau dijeda tidak muncul dalam pencarian. Tarif ditampilkan bersama durasi dan mode layanan.
10. Klik WhatsApp membuka kontak guru terkait dan tidak ditandai otomatis sebagai pesan terkirim atau murid baru.
11. Kehilangan koneksi tidak menghasilkan konfirmasi palsu atau catatan ganda saat pengguna mencoba ulang.
12. Ekspor milik guru dan pemulihan backup berhasil pada data uji sebelum dipakai untuk data nyata.
13. Guru dari wilayah berbeda di Indonesia dapat mendaftar dan menerbitkan profil tanpa pembatasan satu kota. Filter wilayah membedakan profil yang relevan dan pencarian online tidak memaksakan kecocokan kota.
14. Jadwal yang sama ditampilkan dengan benar pada WIB, WITA, dan WIT tanpa mengubah waktu pelaksanaan maupun saldo sesi.
15. Satu murid mempunyai paket Matematika dan Bahasa Inggris dengan sisa jatah serta pembayaran terpisah. Pencatatan sesi atau pembayaran pada satu paket tidak mengubah hitungan paket lainnya.
16. Sisa tiga pertemuan tetap tersedia setelah berganti bulan; jatah tidak hangus otomatis berdasarkan tanggal.
17. Pembatalan oleh guru tercatat sebagai batal tanpa potong jatah dan tidak mengurangi sisa paket.
18. Harga paket Rp400.000 dengan penerimaan Rp450.000 menampilkan jumlah diterima Rp450.000 dan kelebihan Rp50.000. Pengembalian Rp50.000 yang dicatat kemudian menghilangkan kelebihan tanpa mengubah jatah pertemuan.
19. Setelah delapan pertemuan pada paket pertama habis, guru mencatat paket kedua berisi delapan pertemuan yang belum dibayar. Satu les lanjutan yang ditandai selesai mengurangi paket kedua menjadi tujuh; paket pertama tetap nol dan riwayatnya tidak hilang.
20. Guru dapat mendaftar dan masuk dengan email serta kata sandi, keluar, dan menggunakan fasilitas lupa kata sandi untuk memulihkan akses.
21. Perubahan nomor WhatsApp atau informasi layanan pada profil terbit tidak mengganti informasi publik sebelum disetujui pengelola. Profil lama tetap terlihat selama pemeriksaan; guru dapat menjeda profil untuk menyembunyikannya sementara.
22. Profil terbit yang berstatus sedang tidak menerima murid baru tetap muncul dalam pencarian dan dapat dibuka melalui tautan, dengan keterangan yang sesuai.
23. Satu profil dapat menampilkan penawaran Matematika SD Rp75.000 untuk 60 menit dan Matematika SMA Rp100.000 untuk 90 menit dengan informasi masing-masing yang berbeda.
24. Guru yang tinggal di Bekasi dan menetapkan Depok sebagai area layanan tatap muka dapat muncul dalam pencarian guru untuk Depok. Pencarian mencocokkan area yang bersedia didatangi, bukan mewajibkan guru tinggal di daerah yang dicari.
25. Paket delapan pertemuan yang baru dipakai tiga dapat ditutup sesuai kesepakatan, dengan lima pertemuan tetap tercatat sebagai belum dipakai. Penutupan tidak menambah jumlah les selesai atau pemakaian jatah. Pengembalian uang dan penyesuaian harga, bila ada, dicatat terpisah sesuai kesepakatan dan kejadian sebenarnya.
26. Mengarsipkan murid membatalkan jadwal mendatang tanpa potong jatah, membebaskan waktu jadwal tersebut, dan mencabut tautan wali. Riwayat les, sisa jatah, dan pembayaran tetap ada. Mengaktifkan kembali murid tidak otomatis memulihkan jadwal yang dibatalkan atau tautan yang dicabut.
27. Pada penggunaan sungguhan, akun dengan email yang belum diverifikasi tidak dapat menambah murid atau mengajukan profil publik. Setelah guru mengeklik tautan verifikasi yang sah, kedua tindakan dapat dilakukan sesuai hak aksesnya. Percobaan lokal tetap dapat memakai akun dan data contoh.
28. Guru yang kehilangan HP dapat masuk melalui perangkat lain dan memilih keluar dari semua perangkat. Seluruh login aktif akun itu dicabut, termasuk pada HP yang hilang. Pemulihan kata sandi yang berhasil juga mencabut semua login aktif, dan akses berikutnya memerlukan masuk ulang. Data les tetap tersimpan.
29. Ringkasan untuk satu relasi dapat menampilkan alamat, nomor telepon, dan catatan murid yang dicatat pada relasi itu, selain jadwal, paket, dan pembayaran. Pemegang tautan tetap tidak dapat mengubah data atau mengakses relasi lain. Jika tautan diteruskan, penerimanya dapat membaca rincian yang sama selama tautan masih berlaku.
30. Saluran bantuan terlihat oleh guru. Pengelola dapat menerima penjelasan masalah atau gambar layar dengan data pribadi ditutupi, tetapi akun admin tidak mempunyai fitur atau hak akses aplikasi untuk membaca maupun mengubah catatan privat guru. Akses peninjauan profil publik tetap terpisah dari catatan privat.
31. Login yang sudah terbuka tidak cukup untuk mengganti email, mengganti kata sandi dari pengaturan, mengekspor seluruh data, atau meminta penghapusan akun. Guru harus memasukkan ulang kata sandi yang sah sebelum tindakan tersebut diizinkan.
32. Kode pemulihan yang sah dapat dipakai satu kali untuk memulihkan akun saat kata sandi lupa dan email tidak dapat dibuka. Kode tidak sah atau kode yang sama setelah digunakan tidak memulihkan akses. Pemulihan kata sandi yang berhasil tetap mencabut login aktif sesuai aturan Q22.
33. Permintaan penghapusan akun langsung menyembunyikan profil dan mencabut tautan wali. Guru dapat membatalkan permintaan selama tujuh hari; penghapusan tidak diproses sebelum masa batal tersebut berakhir. Guru diberi penjelasan bahwa salinan lama dalam cadangan mengikuti masa simpan maksimal 30 hari sejak cadangan dibuat.
34. Pengaturan login tidak menerapkan usulan keluar otomatis setelah 30 menit tanpa aktivitas. Penolakan aturan ini tidak menonaktifkan tombol keluar, pencabutan login saat pemulihan, atau pemeriksaan kata sandi untuk tindakan penting.
35. Login guru yang mencapai tujuh hari sejak dibuat dan login pengelola yang mencapai delapan jam tidak lagi dapat mengakses data privat sebelum masuk kembali. Aktivitas selama periode tersebut tidak menggeser batas akhirnya; pencabutan login lebih awal tetap berlaku.
36. Konfirmasi hanya dari email lama atau hanya dari email baru tidak menyelesaikan perubahan email biasa. Setelah kata sandi diperiksa dan kedua alamat dikonfirmasi, perubahan dapat berlaku. Pemulihan memakai kode cadangan tetap merupakan alur terpisah ketika email lama tidak dapat diakses.
37. Cadangan dihapus paling lambat setelah masa simpan 30 hari sejak dibuat. Pemulihan menggunakan cadangan lama tidak memunculkan kembali data akun yang sudah dihapus atau mengaktifkan kembali tautan yang sudah dicabut; aturan terkini diterapkan sebelum aplikasi dibuka untuk akses pengguna.
38. Selama tujuh hari masa batal penghapusan, guru dapat mengunduh data atau membatalkan permintaan, tetapi tidak dapat menambah maupun mengubah catatan les. Pembatasan ditegakkan di server. Setelah pembatalan, penggunaan normal kembali; profil tidak otomatis terbit dan tautan wali lama tetap tidak berlaku. Pengaktifan profil tetap mengikuti aturan penerbitan yang sudah ada.

## 17 Keputusan yang masih terbuka

- Keputusan perilaku keamanan pada Q20 sampai Q32 sudah dibahas dan ditetapkan sesuai jawaban Audi, termasuk penolakan pada Q21 dan Q26. Q31 disetujui setelah dijelaskan melalui contoh. Rincian penerapan dan pengujian teknis tetap perlu dikerjakan; keputusan produk tidak menjadi bukti bahwa pengaman sudah diterapkan.
- Pelajaran dan urutan jenjang yang diprioritaskan dalam cakupan SD sampai SMA.
- Sumber data wilayah Indonesia dan cara memperbaruinya.
- Calon guru yang bersedia mencoba aplikasi dan cara merekrutnya.
- Bukti masalah utama: rekap sesi, penjadwalan, pembayaran, atau perolehan murid.
- Kesesuaian aturan pembatalan, paket, dan tarif dengan praktik calon tutor.
- Batas biaya, paket Vercel, dan layanan pendukung untuk menjalankan aplikasi secara online; dibahas sebelum dipasang online.
- Pilihan awal hosting aplikasi adalah Vercel; Q33 menetapkan arsitektur monolitik, Q34 menetapkan PostgreSQL di Supabase, Q35 menetapkan penggunaan yang memerlukan internet, Q36 menetapkan Next.js + TypeScript, Q37 menetapkan Supabase Auth, dan Q38 menetapkan satu database bersama dengan isolasi data privat per guru. Layanan pendukung masih dibahas. Hasil pemeriksaan dan rekomendasi awal tersimpan di [riset hosting 30 Oktober 2026](./docs/riset-hosting-2026-10-30.md); pilihan tersebut belum merupakan persetujuan paket berbayar atau deployment.
- Waktu pengerjaan dan tanggal penyelesaian versi awal.
- Nama produk dan harga setelah pilot.

Keputusan terbuka tidak dianggap otomatis disetujui. Pembangunan versi awal dimulai berdasarkan PRD dan keputusan yang telah disepakati; rincian yang belum jelas tetap dibahas dalam diskusi lanjutan. Pemeriksaan hitungan dan batas akses tetap dilakukan sebelum memakai data nyata.

## 18 Dasar penyusunan

- Diskusi produk dengan Audi pada 29 Oktober 2026. Keputusan terbaru tentang direktori guru melengkapi konsep awal pengelolaan les.
- Revisi 0.2 mengikuti keputusan Audi bahwa cakupan layanan seluruh Indonesia. Penjelasan pilot diperjelas dan kebutuhan wilayah serta zona waktu ditambahkan.
- Keputusan lanjutan sesi grill-with-docs: segmen awal disetujui sebagai guru mandiri SD sampai SMA, les individual dengan paket pertemuan, dan mengajar minimal mingguan. Audi memilih membuat aplikasi terlebih dahulu tanpa menjadikan wawancara atau validasi masalah sebagai syarat pembangunan.
- Jawaban berikutnya menegaskan bahwa belum ada guru untuk uji coba. Catatan les selesai dan dua jenis pembatalan disetujui, begitu pula tautan wali tanpa akun yang berlaku tujuh hari dan dapat dicabut. Versi awal dibuat dan dicoba di komputer; biaya online dibahas sebelum dipasang online. Jumlah peserta, durasi uji coba, rincian aturan paket, dan tanggal penyelesaian belum ditetapkan.
- Putaran berikutnya menyetujui beberapa paket terpisah per murid (Q7), tidak ada penghangusan jatah otomatis berdasarkan tanggal pada versi awal (Q8), pembatalan oleh guru tanpa potong jatah (Q9), penolakan jadwal yang bertabrakan (Q11), dan pencatatan kelebihan bayar sesuai uang yang diterima (Q12).
- Setelah dijelaskan dengan contoh, Q10 disetujui: guru mencatat paket baru untuk les lanjutan ketika jatah lama habis, pembayaran boleh menyusul, dan riwayat paket lama tetap tersimpan.
- Q13, Q14, dan Q17 disetujui: masuk guru melalui email dan kata sandi dengan pemulihan akses; pemeriksaan ulang perubahan nomor WhatsApp atau informasi layanan sebelum tampil publik; serta beberapa penawaran bertarif berbeda dalam satu profil. Untuk Q15, Audi memilih agar guru yang sedang tidak menerima murid tetap muncul dalam pencarian dengan keterangan yang sesuai.
- Q16 kemudian disetujui setelah dijelaskan dengan contoh: guru dapat ditemukan berdasarkan daerah yang bersedia didatanginya untuk les tatap muka, meskipun tinggal di daerah lain.
- Q18 dan Q19 disetujui: paket dapat ditutup sebelum habis sesuai kesepakatan dengan wali, dengan sisa jatah belum dipakai dan pengembalian uang dicatat terpisah; pengarsipan murid membatalkan jadwal mendatang tanpa potong jatah, mencabut tautan wali, mempertahankan riwayat, dan memungkinkan data murid diaktifkan kembali.
- Setelah permintaan merangkum konteks, Audi melanjutkan pembahasan keamanan melalui skill grill-me; pembahasan tampilan ditunda. Ringkasan untuk melanjutkan sesi tersimpan di [docs/HANDOFF.md](./docs/HANDOFF.md).
- Putaran keamanan: Q20 disetujui (verifikasi email sebelum data murid sungguhan atau pengajuan profil publik); Q21 dijawab "gak perlu" (usulan kode masuk tambahan ditolak). Setelah dijelaskan, Q22 disetujui: tombol keluar dari semua perangkat dan pencabutan login otomatis setelah pemulihan kata sandi. Q23 diperjelas dengan jawaban "pembatasannya tidak perlu" sehingga pengecualian jenis data yang diusulkan tidak diterapkan; batas satu relasi dan hanya baca tetap berlaku. Setelah contoh bantuan diperjelas, Q24 disetujui: versi awal memakai laporan masalah atau gambar layar dengan data pribadi ditutupi; fitur izin akses sementara pengelola ke catatan privat guru ditunda.
- Putaran keamanan berikutnya: Q25 disetujui (memasukkan ulang kata sandi untuk tindakan penting); Q26 dijawab "tidak usah" (keluar otomatis setelah 30 menit tanpa aktivitas ditolak); Q27 disetujui (kode pemulihan sekali pakai); Q28 disetujui (masa batal tujuh hari sebelum penghapusan diproses, dengan penyembunyian profil serta pencabutan tautan wali segera). Keputusan tersebut dicatat saat pekerjaan dilanjutkan pada 30 Oktober 2026; kode aplikasi belum dibuat.
- Q29, Q30, dan Q32 disetujui: batas keseluruhan login guru tujuh hari dan pengelola delapan jam; perubahan email biasa dikonfirmasi melalui email lama dan baru; cadangan harian maksimal 30 hari sejak dibuat dan data yang sudah dihapus tidak dimunculkan kembali saat pemulihan.
- Setelah meminta penjelasan Q31 melalui contoh, Audi menyetujuinya: selama menunggu penghapusan, guru hanya dapat mengunduh data atau membatalkan permintaan. Pembatalan mengembalikan penggunaan normal; profil diaktifkan kembali secara manual sesuai aturan penerbitan, sedangkan tautan wali lama tetap dicabut dan diganti tautan baru bila diperlukan.
- Setelah riset hosting, Audi menyampaikan "kayaknya kita pake vercel aja" sebagai pilihan awal hosting aplikasi, lalu meminta compact sebelum melanjutkan grilling tech stack. Pada tahap itu, komponen stack lainnya belum disetujui.
- Setelah diskusi dilanjutkan ke tech stack dan software architecture, Audi menjawab Q33 "monolitik aja", Q34 "postgres supabase aja", dan Q35 "perlu internet". Arsitektur ditetapkan sebagai satu aplikasi yang dibagi menurut fitur, dengan PostgreSQL di Supabase dan penggunaan online yang memerlukan internet. Pada putaran itu, Next.js, TypeScript, dan Supabase Auth belum disetujui.
- Putaran berikutnya menetapkan Q36 Next.js dan TypeScript serta Q37 Supabase Auth untuk dasar akun, dengan pengaman aplikasi tambahan sesuai PRD. Q38 dijawab "gak paham coba jelasin sekalian kasih ilustrasinya ya"; pilihan satu database bersama dengan isolasi data guru masih usulan dan belum disetujui. Paket hosting, anggaran, serta deployment juga belum disetujui.
- Setelah Q38 dijelaskan dengan ilustrasi, Audi menjawab "oke satu database bersama dulu". Susunan database bersama ditetapkan untuk versi awal dengan isolasi data privat per guru. Audi kemudian meminta melanjutkan implementasi; pekerjaan beralih dari grilling ke pembangunan lokal berdasarkan keputusan Q1–Q38.
- Catatan sebelumnya: Lima Ide Website untuk Usaha Sekitar, bagian Les privat kecil.
- [Y Combinator tentang peluncuran kecil dan belajar dari pengguna](https://www.ycombinator.com/blog/ycs-essential-startup-advice/). Digunakan sebagai dasar pendekatan pilot dan iterasi.
- [Microsoft tentang pertimbangan multi tenant](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/checklist). Digunakan sebagai rujukan batas tenant dan pengujian isolasi; tidak menetapkan Azure sebagai penyedia aplikasi.

Fitur dan target yang masih berstatus usulan adalah rancangan produk untuk dibahas. Keputusan cakupan seluruh Indonesia telah ditetapkan. Rujukan eksternal tidak membuktikan adanya permintaan pasar bagi aplikasi ini.

