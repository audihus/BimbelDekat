# Platform Les Privat

Istilah domain untuk layanan les privat dan pengelolaannya. Definisi awal mengikuti pengertian yang sudah dinyatakan dalam [PRD versi 0.2](./PRD_Platform_Les_Privat_v0_2.md).

## Language

**Guru**:
Pengajar les privat mandiri yang menjadi pelanggan utama platform dan memiliki ruang kerja sendiri.
_Avoid_: Tutor sebagai istilah utama yang bergantian dengan guru.

**Ruang kerja guru**:
Lingkup privat milik satu guru yang memuat catatan murid dan kegiatan lesnya. Pada MVP, satu ruang kerja dimiliki oleh satu guru.
_Avoid_: Profil guru untuk menyebut ruang kerja privat.

**Profil publik**:
Informasi layanan dan kontak yang secara sengaja diterbitkan guru untuk calon murid atau wali.
_Avoid_: Ruang kerja untuk menyebut halaman promosi guru.

**Penawaran les**:
Pilihan layanan yang ditampilkan pada profil guru, dengan pelajaran, jenjang, mode online atau tatap muka, durasi, dan tarifnya sendiri. Satu profil dapat mempunyai beberapa penawaran les.
_Avoid_: Paket pertemuan untuk menyebut informasi penawaran publik.

**Status menerima murid**:
Keterangan kesediaan guru menerima murid baru, yang terpisah dari status penerbitan profilnya.
_Avoid_: Status terbit atau profil dijeda untuk menyebut kesediaan menerima murid baru.

**Area layanan tatap muka**:
Daerah yang bersedia didatangi guru untuk mengajar langsung di tempat murid. Area ini dapat berbeda dari daerah tempat guru tinggal.
_Avoid_: Alamat guru sebagai sinonim area layanan tatap muka.

**Murid**:
Orang yang menerima les, dengan catatan tersendiri dalam ruang kerja guru yang mengajarnya. Orang yang sama dapat memiliki catatan murid terpisah pada guru berbeda.
_Avoid_: Akun murid untuk menyebut catatan murid.

**Murid diarsipkan**:
Murid yang dikeluarkan dari daftar murid aktif, dengan riwayat les, sisa jatah, dan pembayaran tetap tersimpan. Data murid dapat diaktifkan kembali jika ia kembali les.
_Avoid_: Murid dihapus untuk menyebut murid diarsipkan.

**Wali**:
Orang tua atau penanggung jawab murid yang berkomunikasi dengan guru mengenai kegiatan les murid tersebut.
_Avoid_: Pemegang tautan sebagai sinonim wali; kepemilikan tautan tidak membuktikan hubungan dengan murid.

**Paket pertemuan**:
Kesepakatan les untuk seorang murid yang memuat jatah sesi, harga kesepakatan, dan aturan pembatalan. Seorang murid dapat mempunyai beberapa paket dengan hitungan jatah dan pembayaran masing-masing.
_Avoid_: Pembayaran sebagai sinonim paket; penerimaan uang dan jatah sesi adalah hal berbeda.

**Paket habis**:
Paket yang seluruh jatah pertemuannya telah terpakai sesuai aturan les.
_Avoid_: Paket ditutup sebagai sinonim paket habis.

**Paket ditutup**:
Paket yang diakhiri lebih awal sesuai kesepakatan dengan wali, dengan sisa jatah tetap tercatat sebagai belum dipakai.
_Avoid_: Paket habis atau les selesai untuk menyebut penutupan paket yang masih memiliki jatah.

**Jatah pertemuan**:
Jumlah pertemuan les yang menjadi hak murid dalam satu paket.
_Avoid_: Saldo tanpa penjelasan bahwa yang dihitung adalah jatah pertemuan, bukan uang.

**Pemakaian jatah**:
Berkurangnya jatah pertemuan karena les selesai atau pembatalan yang disepakati memotong jatah.
_Avoid_: Kehadiran sebagai sinonim pemakaian jatah; pembatalan juga dapat memotong jatah.

**Sesi**:
Satu pertemuan les antara guru dan murid, yang dapat berstatus terjadwal, terlaksana, atau dibatalkan. Penjadwalan ulang tetap merujuk pada sesi yang sama.
_Avoid_: Paket untuk menyebut satu pertemuan.

**Les selesai**:
Pertemuan les yang benar-benar telah berlangsung antara guru dan murid.
_Avoid_: Jatah terpakai sebagai sinonim les selesai; pembatalan yang memotong jatah bukan les yang berlangsung.

**Batal tanpa potong jatah**:
Pertemuan yang dibatalkan tanpa mengurangi sisa jatah dalam paket murid.
_Avoid_: Batal tanpa menjelaskan pengaruhnya terhadap jatah pertemuan.

**Batal dengan potong jatah**:
Pertemuan yang dibatalkan tetapi tetap mengurangi jatah sesuai kesepakatan les. Pertemuan ini tidak dihitung sebagai les yang benar-benar berlangsung.
_Avoid_: Les selesai untuk menyebut pembatalan yang memotong jatah.

**Kelebihan bayar**:
Bagian penerimaan bersih untuk suatu paket yang melebihi harga kesepakatan paket tersebut.
_Avoid_: Sisa jatah atau pendapatan tambahan untuk menyebut kelebihan bayar.

**Tautan wali**:
Tautan untuk melihat ringkasan kegiatan les pada satu relasi guru dan murid tanpa membuat akun. Pemegang tautan dapat membaca ringkasan selama tautan masih berlaku.
_Avoid_: Akun wali untuk menyebut akses melalui tautan.

**Uji coba awal**:
Pemakaian aplikasi yang sudah dapat digunakan oleh sejumlah kecil guru pada kegiatan les nyata, untuk mengetahui bagian yang perlu diperbaiki.
_Avoid_: Pilot tanpa penjelasan bahwa artinya uji coba awal.
