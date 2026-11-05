# Panduan Pengguna Platform Les Privat

Panduan ini menjelaskan cara memakai aplikasi sesuai kondisi kode saat ini (versi lokal, November 2026). Isinya dibagi menurut siapa yang memakai:

- **Guru les** (pengguna utama): bagian 3 sampai 11.
- **Orang tua / calon murid / wali**: bagian 12 dan 13.
- **Pengelola (admin)**: bagian 14.
- **Orang yang menjalankan aplikasi di komputer**: Lampiran A.

> **Status penting.** Aplikasi masih dalam pengembangan lokal dan belum dipasang online. Jangan memasukkan data murid sungguhan sampai pemeriksaan keamanan dan uji pemulihan data selesai. Bagian yang belum tersedia dicantumkan jujur di bagian 15.

---

## 1. Gambaran singkat

Platform Les Privat membantu guru les mandiri (SD sampai SMA, les individual, minimal mingguan) merapikan:

| Kebutuhan | Fitur |
| --- | --- |
| Siapa saja murid saya? | Daftar murid, arsip, catatan, kontak wali |
| Berapa jatah pertemuan yang tersisa? | Paket pertemuan per murid |
| Kapan saya mengajar? | Jadwal, anti-bentrok, penjadwalan ulang |
| Siapa yang sudah bayar? | Catatan pembayaran manual per paket |
| Bagaimana wali tahu perkembangannya? | Tautan ringkasan untuk wali (tanpa akun) |
| Bagaimana calon murid menemukan saya? | Profil publik di direktori guru |

Ada tiga macam pengguna:

1. **Guru**: punya akun dan *ruang kerja* pribadi. Hanya guru itu yang dapat melihat catatan muridnya.
2. **Pengunjung / orang tua**: mencari guru di direktori dan membuka ringkasan lewat tautan, tanpa akun.
3. **Pengelola**: memeriksa profil publik guru. Pengelola **tidak** dapat membaca catatan murid guru.

Aplikasi ini hanya **mencatat**. Uang tidak mengalir lewat aplikasi, WhatsApp tidak mengirim pesan otomatis, dan pembayaran dilakukan di luar aplikasi.

## 2. Istilah penting

| Istilah | Artinya |
| --- | --- |
| **Ruang kerja** | Tempat privat milik satu guru berisi murid, paket, jadwal, dan pembayaran. |
| **Profil publik** | Halaman promosi guru yang bisa dicari orang. Berbeda dari ruang kerja. |
| **Paket pertemuan** | Kesepakatan les untuk satu murid: nama/pelajaran, jumlah pertemuan (jatah), dan harga. Satu murid boleh punya beberapa paket (misalnya Matematika dan Bahasa Inggris), masing-masing dihitung sendiri. |
| **Jatah** | Jumlah pertemuan yang menjadi hak murid dalam satu paket (bukan uang). |
| **Les selesai** | Pertemuan yang benar-benar berlangsung. Mengurangi jatah 1. |
| **Batal tanpa potong jatah** | Pertemuan dibatalkan, jatah tetap. |
| **Batal dengan potong jatah** | Pertemuan dibatalkan tetapi jatah tetap berkurang 1 karena kesepakatan dengan wali. Ini **bukan** les selesai. |
| **Paket habis** | Semua jatah terpakai. |
| **Paket ditutup** | Paket diakhiri lebih awal. Sisa jatah tetap tercatat sebagai "belum dipakai", dan paket tidak bisa dipakai untuk pertemuan baru. |
| **Murid diarsipkan** | Murid dikeluarkan dari daftar aktif tanpa menghapus riwayat. |
| **Tautan wali** | Tautan baca-saja ke ringkasan satu murid. Berlaku 7 hari. |
| **Status menerima murid** | Apakah guru menerima murid baru. Terpisah dari apakah profil terlihat di direktori. |

---

## 3. Mulai cepat untuk guru (sekitar 10 menit)

1. **Daftar** di halaman `Daftar`, lalu klik tautan verifikasi di email Anda.
2. **Masuk** dengan email dan kata sandi.
3. Buka **Murid**, isi formulir *Tambah murid*, lalu klik *Simpan murid*.
4. Buka halaman murid itu, lalu *Tambah paket baru*: nama paket, jumlah pertemuan, harga.
5. Buka **Jadwal**, lalu *Tambah pertemuan*: pilih murid dan paket, tentukan mulai dan selesai.
6. Setelah les berlangsung, klik **Tandai les selesai** pada pertemuan itu. Jatah berkurang 1.
7. Saat wali membayar, buka halaman murid dan isi *Pembayaran manual*.

---

## 4. Akun: daftar, masuk, keluar, pemulihan

### 4.1 Mendaftar

1. Buka halaman **Daftar** (dari beranda: tombol *Buat ruang kerja*).
2. Isi **Nama Anda**, **Alamat email**, dan **Kata sandi**.
3. Kata sandi **minimal 15 karakter**. Kalimat yang mudah diingat boleh dipakai, misalnya `kucing saya suka tidur siang`. Tidak perlu simbol rumit.
4. Klik **Buat akun**. Pesan "Periksa email untuk mengonfirmasi akun" muncul.
5. Buka email Anda (cek juga folder spam) dan klik tautan konfirmasi.

**Akun belum bisa dipakai sebelum emailnya diverifikasi.** Jika Anda mencoba masuk sebelum verifikasi, aplikasi menolak dengan pesan "Email atau kata sandi belum sesuai, atau email belum diverifikasi."

### 4.2 Masuk

1. Buka halaman **Masuk**.
2. Isi email dan kata sandi, lalu klik **Masuk ke ruang kerja**.
3. Anda diarahkan ke **Ringkasan**.

**Berapa lama login berlaku?** Login guru berlaku **maksimal 7 hari** sejak Anda masuk di perangkat itu, dihitung dari saat masuk. Memakai aplikasi terus-menerus tidak memperpanjangnya. Setelah 7 hari Anda diminta masuk lagi. Aplikasi **tidak** mengeluarkan Anda hanya karena diam beberapa menit.

### 4.3 Lupa kata sandi

1. Di halaman Masuk, klik **Lupa kata sandi?**.
2. Isi email, lalu klik **Kirim tautan pemulihan**. Pesan selalu sama baik email terdaftar maupun tidak (demi keamanan).
3. Buka email, klik tautan pemulihan, lalu isi **kata sandi baru** (minimal 15 karakter).
4. Klik **Simpan kata sandi**. Anda dibawa ke halaman Masuk.

**Perhatikan:** setelah kata sandi diganti lewat pemulihan, **semua login lama di semua perangkat dicabut**. Anda harus masuk lagi di semua perangkat. Data les tidak hilang. Tautan pemulihan hanya berlaku sementara; jika kedaluwarsa, minta lagi.

### 4.4 Keluar

- **Keluar** (tombol di bagian bawah menu samping): keluar dari perangkat yang sedang dipakai.
- **Keluar dari semua perangkat** (halaman **Akun**, bagian *Login dan keamanan*): dipakai jika HP atau laptop hilang. Masuk dari perangkat lain, buka Akun, lalu klik tombol itu.

### 4.5 Zona waktu

Di halaman **Akun**, bagian *Zona waktu*, pilih **WIB**, **WITA**, atau **WIT**, lalu klik *Simpan zona waktu*. Semua jadwal akan ditampilkan sesuai pilihan itu. Mengubah zona waktu hanya mengubah tampilan, bukan waktu pelaksanaan les atau jatah.

---

## 5. Mengenal tampilan ruang kerja

Menu ada di sisi kiri (komputer) atau bar bawah (ponsel):

| Menu | Isi |
| --- | --- |
| **Ringkasan** | Angka penting dan hal yang perlu diperhatikan |
| **Murid** | Daftar murid, pencarian, penambahan |
| **Jadwal** | Semua pertemuan dan hasilnya |
| **Profil publik** | Mengelola profil di direktori |
| **Akun** | Informasi akun, zona waktu, keamanan |

### Halaman Ringkasan

- **Murid aktif**: jumlah murid yang tidak diarsipkan.
- **Jadwal mendatang**: pertemuan berstatus terjadwal yang belum lewat.
- **Paket hampir habis**: paket aktif dengan sisa 1 pertemuan atau kurang.
- **Sisa pembayaran**: total kekurangan bayar dari semua paket.
- **Pertemuan mendatang**: lima pertemuan terdekat.
- **Perlu diperhatikan**: daftar paket yang hampir atau sudah habis. Klik untuk membuka murid terkait dan mencatat paket baru.
- Tombol **Tambah murid** ada di kanan atas.

---

## 6. Mengelola murid

### 6.1 Menambah murid

Halaman **Murid**, panel *Tambah murid*:

| Isian | Keterangan |
| --- | --- |
| **Nama panggilan murid** (wajib) | Nama singkat sudah cukup. |
| **Jenjang** | SD, SMP, atau SMA. |
| **Nomor wali** (opsional) | Tidak wajib untuk mulai mencatat. |
| **Awal mengenal murid** | Sudah menjadi murid sebelumnya, tautan profil, pencarian website, sumber lain, atau tidak diketahui. Hanya laporan Anda sendiri. |
| **Alamat dan catatan** (opsional) | Buka bagian *Alamat dan catatan opsional*. |

Klik **Simpan murid**. Pesan "Perubahan tersimpan" menandakan berhasil.

> **Hati-hati:** alamat, nomor wali, dan catatan **ikut terlihat** oleh siapa pun yang memegang tautan wali untuk murid itu. Isi hanya yang memang boleh dilihat wali.

### 6.2 Mencari dan menyaring

- Ketik nama di kotak **Cari nama murid**, lalu klik *Cari*.
- Pilih **Aktif** atau **Diarsipkan** untuk berpindah daftar.

### 6.3 Membuka dan mengubah murid

Klik nama murid untuk membuka halamannya. Di sana ada paket, pembayaran, tautan wali, jadwal, dan riwayat pembayaran. Untuk mengubah nama, jenjang, nomor wali, alamat, atau catatan, buka bagian **Informasi murid**, ubah, lalu klik *Simpan informasi*.

### 6.4 Mengarsipkan murid

Gunakan jika murid berhenti les. Di **Informasi murid**, klik **Arsipkan murid**. Akibatnya:

- Murid pindah dari daftar aktif.
- Semua **jadwal mendatang dibatalkan tanpa potong jatah**.
- Semua **tautan wali dicabut**.
- Riwayat les, sisa jatah, dan pembayaran **tetap tersimpan**.

### 6.5 Mengaktifkan kembali murid

Buka tab **Diarsipkan**, buka murid, lalu klik **Aktifkan kembali murid**. Jadwal yang sudah dibatalkan dan tautan yang sudah dicabut **tidak** pulih otomatis. Buat jadwal dan tautan baru bila perlu.

---

## 7. Paket pertemuan

### 7.1 Membuat paket

Di halaman murid, buka **Tambah paket baru**:

| Isian | Keterangan |
| --- | --- |
| **Nama paket / pelajaran** | Misalnya "Matematika". |
| **Jumlah pertemuan** | Jatah total paket, misalnya 8. |
| **Sudah terpakai sebelum aplikasi** | Isi jika murid sudah les beberapa kali sebelum Anda mencatat di aplikasi. Tidak boleh melebihi jumlah pertemuan. |
| **Harga kesepakatan (Rp)** | Angka bulat tanpa titik atau koma, misalnya `400000`. |

Pembayaran boleh menyusul. Jatah **tidak hangus** karena tanggal atau pergantian bulan.

**Contoh:** paket 8 pertemuan, sudah terpakai 3 sebelum aplikasi, lalu 2 les selesai di aplikasi. Sisa = 8 − 3 − 2 = **3**. Sisa itu tetap 3 meskipun bulan berganti.

### 7.2 Membaca kartu paket

Tiap paket menampilkan sisa jatah (misal `5 / 8 tersisa`), pemakaian sebelum aplikasi, harga kesepakatan, jumlah diterima bersih, dan lencana **Lunas** / **Sisa bayar** / **Kelebihan**.

### 7.3 Penyesuaian paket

Buka **Penyesuaian paket** pada kartu paket:

- **Koreksi jatah**: isi perubahan (`+2` atau `-1`) dan **alasan wajib**. Koreksi yang membuat jatah negatif atau melebihi batas ditolak.
- **Harga kesepakatan baru**: isi harga baru dan **alasan wajib**. Perubahan tercatat di riwayat.
- **Tutup paket**: isi kesepakatan penutupan dengan wali. Sisa jatah tetap tercatat sebagai belum dipakai. Penutupan **tidak mengubah uang atau harga**. Jika ada pengembalian uang, catat terpisah di *Pembayaran manual*.

### 7.4 Ketika paket habis

Jika jatah 0, aplikasi menolak menandai les selesai dengan pesan "Jatah paket habis. Catat paket baru untuk les lanjutan." Buat paket baru (boleh belum dibayar). Paket lama tetap menjadi riwayat dengan sisa 0.

---

## 8. Jadwal pertemuan

### 8.1 Menambah pertemuan

Halaman **Jadwal**, buka **Tambah pertemuan**:

1. Pilih **Murid dan paket** (daftar menampilkan sisa jatah). Hanya paket aktif milik murid aktif yang muncul. Jika kosong, buat paket dulu.
2. Pilih **Cara mengajar**: Online atau Tatap muka.
3. Isi **Mulai** dan **Selesai** (waktu mengikuti zona waktu Anda).
4. Klik **Simpan jadwal**.

**Anti-bentrok:** aplikasi menolak pertemuan yang waktunya tumpang tindih dengan pertemuan aktif Anda yang lain (pesan: "Jadwal bertabrakan dengan les lain"). Pertemuan yang saling bersebelahan, misalnya selesai 14.00 dan mulai 14.00, boleh. Waktu selesai harus setelah waktu mulai.

### 8.2 Menandai les selesai

Di daftar **Belum diberi hasil**, klik **Tandai les selesai** setelah les berlangsung. Jatah paket berkurang **tepat 1**. Klik dua kali atau kirim ulang tidak akan memotong jatah dua kali.

### 8.3 Memindahkan jadwal

Pada pertemuan terjadwal, buka **Ubah atau batalkan**, ubah waktu mulai/selesai (dan paket jika perlu), lalu klik **Pindahkan jadwal**. Pertemuan yang sama dipertahankan dan jatah tidak berubah.

### 8.4 Membatalkan pertemuan

Buka **Ubah atau batalkan**, bagian *Batalkan pertemuan*:

| Pilihan | Hasil |
| --- | --- |
| Dibatalkan **guru** | Selalu **tanpa potong jatah**. |
| Dibatalkan **murid / wali**, tanpa potong jatah | Jatah tetap. |
| Dibatalkan **murid / wali**, **potong jatah** | Jatah berkurang 1, **alasan wajib** diisi. Pilih ini hanya jika sudah disepakati dengan wali. |

Pertemuan yang dibatalkan dengan potong jatah **tidak dihitung sebagai les selesai**.

### 8.5 Mengoreksi hasil

Salah menandai? Buka **Riwayat pertemuan**, pilih pertemuan, buka **Koreksi hasil pertemuan**, pilih hasil yang benar (les selesai, batal tanpa potong, batal dengan potong, atau kembali terjadwal), isi **alasan** (wajib), lalu simpan. Jatah disesuaikan dan alasan tercatat.

---

## 9. Pembayaran manual

Di halaman murid, kotak **Pembayaran manual**:

| Isian | Keterangan |
| --- | --- |
| **Paket** | Pembayaran dicatat per paket. |
| **Jenis catatan** | *Uang diterima*, *Uang dikembalikan*, atau *Koreksi (+ / −)*. |
| **Nominal rupiah bulat** | Tanpa titik, koma, atau "Rp". Misalnya `450000`. Untuk "diterima" dan "dikembalikan" isi angka positif. Koreksi boleh positif atau negatif. |
| **Waktu pembayaran** | Opsional. |
| **Catatan / alasan** | Wajib untuk pengembalian dan koreksi. |

Aplikasi menghitung otomatis per paket: **diterima bersih** (diterima dikurangi dikembalikan, ditambah koreksi), **sisa bayar**, dan **kelebihan**.

**Contoh:** harga Rp400.000, diterima Rp450.000, maka kelebihan Rp50.000. Jika kemudian dicatat pengembalian Rp50.000, kelebihan jadi 0. Jatah pertemuan tidak berubah sama sekali, karena uang dan jatah adalah catatan yang terpisah.

Catatan pembayaran tidak dihapus diam-diam. Kesalahan diperbaiki dengan catatan koreksi yang beralasan. Semua catatan muncul di tabel **Riwayat pembayaran**.

---

## 10. Tautan ringkasan untuk wali

Wali tidak perlu akun. Guru membagikan tautan, wali membuka dan membaca.

### 10.1 Membuat dan membagikan

1. Di halaman murid, kotak **Ringkasan untuk wali**, klik **Buat tautan wali**.
2. Tautan muncul. Klik **Salin tautan**, lalu kirim lewat WhatsApp atau cara lain.

> **Tautan hanya tampil sekali, saat dibuat.** Setelah Anda pindah halaman, tautannya tidak bisa ditampilkan lagi (aplikasi hanya menyimpan sidik jarinya demi keamanan). Jika hilang, cabut dan buat tautan baru.

### 10.2 Yang bisa dilihat pemegang tautan

Jadwal dan hasil pertemuan, paket (jatah dan harga), pembayaran, serta nomor wali, alamat, dan catatan yang Anda isi untuk murid itu. Pemegang tautan **tidak bisa mengubah apa pun** dan tidak bisa melihat murid lain.

### 10.3 Hal yang harus Anda ketahui sebelum membagikan

- Tautan berlaku **7 hari**.
- **Siapa pun yang memegang tautan** dapat membaca ringkasannya, termasuk orang yang menerima tautan terusan dari wali.
- Anda bisa **mencabut** kapan saja: di daftar tautan aktif, klik **Cabut tautan**.
- Tautan otomatis dicabut jika murid diarsipkan.
- Halaman ringkasan tidak diindeks mesin pencari.

---

## 11. Profil publik

Menu **Profil publik** mengatur halaman Anda di direktori guru.

### 11.1 Mengisi profil

| Bagian | Isian |
| --- | --- |
| **Informasi dasar** | Nama yang ditampilkan, nomor WhatsApp publik, provinsi dan kabupaten/kota tempat tinggal, dan "Tentang Anda dan cara mengajar" (maks. 3.000 karakter). |
| **Penawaran les** | Klik *Tambah penawaran*. Isi pelajaran, jenjang, cara mengajar (online/tatap muka), durasi (menit), dan tarif per pertemuan. Boleh banyak penawaran, masing-masing dengan harga sendiri. |
| **Daerah yang bersedia didatangi** | Klik *Tambah daerah* (provinsi, kabupaten/kota, kecamatan opsional). Dipakai untuk pencarian tatap muka dan boleh berbeda dari tempat tinggal. |

### 11.2 Simpan draf dan ajukan

- **Simpan draf**: menyimpan tanpa mengirim. Draf tidak tampil di direktori.
- **Ajukan pemeriksaan**: mengirim ke pengelola. Syaratnya nama minimal 2 huruf, nomor WhatsApp valid (8 sampai 20 karakter angka/`+`), dan minimal satu penawaran. Jika kurang, muncul pesan "Lengkapi nama, kontak WhatsApp, dan penawaran les sebelum mengajukan."

### 11.3 Status profil

Di bagian atas halaman terlihat status: *Terlihat di direktori* atau *Belum terlihat*, serta keterangan: menunggu pemeriksaan, ditolak (beserta alasannya), atau belum diajukan.

- Setelah disetujui pengelola, profil tampil di direktori.
- Perubahan pada profil yang sudah terbit **diperiksa lagi**, dan tampilan lama tetap terlihat sampai perubahan disetujui.
- Jika profil ditolak, baca alasan, perbaiki, lalu ajukan lagi.

### 11.4 Mengatur kehadiran di direktori

Setelah profil terbit, tersedia tombol:

- **Tandai tidak menerima murid / Tandai menerima murid**: profil **tetap muncul** di pencarian, hanya dengan keterangan "Sedang tidak menerima murid".
- **Jeda profil / Aktifkan profil**: *menyembunyikan* profil sementara dari direktori.
- **Lihat profil publik**: pratinjau halaman seperti yang dilihat pengunjung.

### 11.5 Tombol WhatsApp

Tombol "Hubungi melalui WhatsApp" hanya **membuka percakapan** dengan teks pembuka. Pengunjung sendiri yang mengirim pesannya. Klik tombol bukan berarti ada murid baru.

---

## 12. Panduan untuk orang tua / calon murid: mencari guru

Tidak perlu akun.

1. Buka **Cari guru** (`/cari`).
2. Isi filter yang diperlukan:
   - **Pelajaran atau nama guru**, contoh "Matematika".
   - **Jenjang**: SD, SMP, atau SMA.
   - **Cara belajar**: online atau tatap muka.
   - **Provinsi**, **Kabupaten/kota**, dan **Kecamatan** (kecamatan hanya untuk tatap muka). Semua opsional.
3. Klik **Cari guru**.

Cara kerja pencarian:

- **Online** dapat dicari lintas Indonesia.
- **Tatap muka** dicocokkan dengan **daerah yang bersedia didatangi guru**, bukan tempat tinggalnya. Guru yang tinggal di Bekasi tetapi bersedia mengajar di Depok akan muncul untuk pencarian Depok.
- Guru yang **sedang tidak menerima murid** tetap tampil dengan label kuning. Anda masih bisa menanyakan ketersediaan di lain waktu.
- Jika tidak ada hasil, kurangi filter wilayah atau pilih online.

Klik **Lihat profil** untuk membaca deskripsi, penawaran (pelajaran, jenjang, durasi, tarif per pertemuan), dan area layanan. Klik **Hubungi melalui WhatsApp** untuk menanyakan jadwal dan kesepakatan. Pesan Anda kirim sendiri.

## 13. Panduan untuk wali: membuka ringkasan les

1. Guru mengirim tautan yang berakhiran `/wali#...`. Buka tautan itu di browser.
2. Halaman menampilkan nama murid, tanggal tautan berakhir, paket (sisa pertemuan, harga, diterima, sisa bayar, kelebihan), jadwal dan hasil pertemuan, catatan uang, dan informasi yang dicatat guru.
3. Halaman **hanya untuk dibaca**. Jika ada kesalahan data, hubungi guru yang membagikan.

Jika muncul "Ringkasan belum dapat dibuka", kemungkinan tautan sudah berakhir (lewat 7 hari), dicabut guru, terpotong saat disalin (tautan harus lengkap, termasuk bagian setelah `#`), atau muridnya sudah diarsipkan. Minta tautan baru kepada guru.

---

## 14. Panduan untuk pengelola (admin)

Akun pengelola dibuat terpisah dari pendaftaran guru. Pendaftaran biasa selalu menghasilkan akun guru.

- Login pengelola berlaku **8 jam** sejak masuk, lalu harus masuk ulang.
- Menu pengelola bernama **Moderasi**, dengan keputusan **setujui**, **tolak** (alasan wajib), atau **sembunyikan** (alasan wajib). Setiap keputusan tercatat di riwayat audit.
- Pengelola **tidak punya akses** ke catatan privat guru (murid, paket, jadwal, pembayaran), baik lewat aplikasi maupun lewat basis data. Bantuan teknis memakai penjelasan masalah atau tangkapan layar yang datanya sudah ditutupi.

> **Catatan:** logika moderasi di basis data sudah ada, tetapi **halaman Moderasi di antarmuka belum dibuat**. Menu "Moderasi" saat ini mengarah ke halaman yang belum ada. Lihat bagian 15.

---

## 15. Yang belum tersedia (jujur)

| Fitur | Keadaan |
| --- | --- |
| Halaman moderasi untuk pengelola | Belum ada antarmuka (hanya fungsi basis data). |
| Kode pemulihan sekali pakai | Belum ada. |
| Ganti email / ganti kata sandi dari pengaturan, dengan kata sandi diminta ulang | Belum ada di halaman Akun. Kata sandi hanya bisa diganti lewat *Lupa kata sandi*. |
| Ekspor seluruh data | Belum ada. |
| Permintaan penghapusan akun (masa batal 7 hari) | Belum ada tombolnya. Pembatasan akses saat status penghapusan sudah ada di server. |
| Foto profil guru | Belum ada. |
| Lapor profil / saluran bantuan di aplikasi | Belum ada. |
| Daftar wilayah Indonesia lengkap (pilihan dropdown) | Wilayah masih diketik manual. |
| Menyesuaikan zona waktu tampilan untuk wali | Wali melihat waktu dalam zona waktu guru. |
| Pencatatan tanpa internet | Tidak termasuk versi awal; internet diperlukan. |
| Pembayaran lewat platform, komisi, obrolan, rating publik, kelas kelompok, akun murid/wali | Di luar cakupan versi awal. |

Selain itu, pengujian otomatis alur masuk akun (Playwright) pada catatan terakhir belum lolos. Karena itu, perlakukan aplikasi sebagai **versi percobaan**.

---

## 16. Pesan yang sering muncul dan solusinya

| Pesan | Penyebab | Yang dilakukan |
| --- | --- | --- |
| Email atau kata sandi belum sesuai, atau email belum diverifikasi | Salah isian, atau tautan verifikasi belum diklik | Periksa isian dan email verifikasi (cek spam). |
| Lengkapi nama dan gunakan kata sandi minimal 15 karakter | Kata sandi pendek | Pakai kalimat 15 karakter atau lebih. |
| Silakan masuk kembali / Akses berakhir | Login lewat 7 hari, dicabut, atau kata sandi baru diganti | Masuk lagi. |
| Jadwal bertabrakan dengan les lain | Waktu tumpang tindih | Pilih waktu lain. |
| Jatah paket habis. Catat paket baru untuk les lanjutan | Sisa jatah 0 | Buat paket baru. |
| Paket sudah ditutup | Paket yang ditutup tidak bisa dipakai | Pilih paket aktif. |
| Murid sudah diarsipkan | Mencoba menambah jadwal/paket untuk murid arsip | Aktifkan kembali murid dulu. |
| Harga harus berupa rupiah bulat / Nominal harus berupa rupiah bulat | Ada titik, koma, atau "Rp" | Tulis angka saja, misalnya `400000`. |
| Tuliskan alasannya | Kolom alasan kosong | Isi alasan. |
| Potong jatah memerlukan alasan dan tidak berlaku jika guru membatalkan | Potong jatah dipilih tanpa alasan, atau yang membatalkan guru | Isi alasan, atau pilih "tanpa potong jatah". |
| Lengkapi nama, kontak WhatsApp, dan penawaran les sebelum mengajukan | Profil belum lengkap | Lengkapi lalu ajukan. |
| Profil harus disetujui pengelola terlebih dahulu | Tombol menerima murid / jeda dipakai sebelum profil terbit | Tunggu persetujuan. |
| Permintaan tidak berasal dari aplikasi ini | Aplikasi dibuka dari alamat yang berbeda dari yang dikonfigurasi | Buka lewat `http://127.0.0.1:3000`. |
| Isian terlalu panjang | Data melebihi 64 KB | Persingkat catatan. |
| Data belum tersimpan. Periksa isian atau coba kembali | Gangguan koneksi/server | Coba lagi. Mengirim ulang tidak menggandakan catatan. |

**Tentang kirim ulang:** setiap penyimpanan membawa kode unik. Jika koneksi putus dan Anda menekan tombol lagi dengan isian yang sama, aplikasi mengenali permintaan itu dan tidak membuat catatan ganda.

---

## 17. Tips privasi dan keamanan

- Pakai kata sandi unik yang panjang dan jangan dibagikan.
- Jangan membagikan tautan wali di grup. Kirim langsung ke wali yang bersangkutan, dan cabut jika tidak dipakai lagi.
- Isi hanya data murid yang diperlukan. Alamat dan catatan tidak wajib.
- Jika perangkat hilang: masuk dari perangkat lain dan pakai **Keluar dari semua perangkat**.
- Pada komputer bersama, selalu klik **Keluar** setelah selesai.
- Data guru lain tidak dapat dibuka dengan mengubah alamat halaman. Pemeriksaan hak akses dilakukan di server dan basis data.

## 18. Tanya jawab

**Apakah murid atau wali butuh akun?** Tidak. Wali cukup membuka tautan, murid bahkan tidak perlu apa-apa.

**Bisakah satu murid les dua pelajaran?** Bisa. Buat dua paket (misalnya Matematika dan Bahasa Inggris). Jatah dan pembayaran dihitung terpisah.

**Jatah saya hangus di akhir bulan?** Tidak. Jatah hanya berkurang karena les selesai atau pembatalan yang disepakati memotong jatah.

**Murid sudah les sebelum saya memakai aplikasi ini.** Isi "Sudah terpakai sebelum aplikasi" saat membuat paket supaya sisa jatahnya benar.

**Wali membayar lebih.** Catat apa adanya. Aplikasi menampilkan "Kelebihan". Jika dikembalikan, catat sebagai "Uang dikembalikan".

**Paket diakhiri di tengah jalan.** Pakai *Tutup paket*. Sisa jatah tetap tercatat dan uang tidak berubah otomatis.

**Guru batalkan karena sakit, apakah jatah terpotong?** Tidak. Pembatalan oleh guru selalu tanpa potong jatah.

**Salah mencatat les selesai.** Gunakan *Koreksi hasil pertemuan* dengan alasan. Jangan membuat catatan baru untuk menutupi.

**Profil saya tidak muncul di pencarian.** Periksa: sudah diajukan dan disetujui? Tidak sedang dijeda? Wilayah tatap muka sudah diisi pada *Daerah yang bersedia didatangi*?

**Apakah ada aplikasi HP?** Belum. Ini aplikasi web yang dirancang nyaman di layar ponsel.

---

## Lampiran A. Menjalankan aplikasi di komputer (untuk pengembang / uji coba)

Detail lengkap ada di `README.md`. Ringkasnya, dengan Node.js 22+ dan Docker Desktop yang menyala:

```
npm install
docker network create les-privat-dev
npx supabase start --network-id les-privat-dev --exclude studio,realtime,storage-api,imgproxy,edge-runtime,logflare,vector,supavisor
node scripts/local-env.mjs
node scripts/seed-local.mjs
npm run dev -- --port 3000
```

Buka `http://127.0.0.1:3000`. Gunakan **alamat itu**, bukan `localhost`, karena pemeriksaan asal permintaan memakai alamat yang dikonfigurasi.

**Akun contoh lokal** (hanya untuk data contoh, jangan dipakai di produksi):

| Peran | Email | Kata sandi |
| --- | --- | --- |
| Guru | `rina@example.test` | `ContohLesPrivat!2026` |
| Guru | `budi@example.test` | `ContohLesPrivat!2026` |
| Pengelola | `admin@example.test` | `ContohLesPrivat!2026` |

**Kotak email uji:** email verifikasi dan pemulihan dari Supabase lokal tidak dikirim ke internet. Bukalah di `http://127.0.0.1:55324`.

## Lampiran B. Alur ringkas satu paket les

```
Daftar -> verifikasi email -> masuk
   -> tambah murid -> buat paket (mis. 8 pertemuan, Rp400.000)
   -> jadwalkan pertemuan -> les berlangsung -> tandai selesai (jatah -1)
   -> wali membayar -> catat pembayaran
   -> bagikan tautan wali (7 hari)
   -> jatah habis -> buat paket baru -> lanjut
```
