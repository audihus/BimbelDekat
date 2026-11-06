# BimbelDekat

Istilah yang dipakai di tampilan aplikasi. Sejak 5 November 2026 istilahnya sengaja diganti ke bahasa sehari-hari karena pemakainya guru bimbel privat dan orang tua pencari guru. **Maknanya tidak berubah** dari [PRD versi 0.2](./PRD_Platform_Les_Privat_v0_2.md); yang berganti hanya katanya. Nama di basis data dan kode (mis. `package`, `quota`, `guardian`) tetap seperti semula. Pesan galat yang datang langsung dari basis data (fungsi SQL lama) masih memakai istilah lama sampai migrasi pesan dibuat.

**Nama dan kata "bimbel".** Aplikasi bernama **BimbelDekat** (dulu "Les Privat"), dan kata *les* di tampilan diganti *bimbel* (mis. "iklan bimbel", "paket bimbel", "guru bimbel"). Kolom _Dulu_ di bawah mencatat istilah lama sebelum perubahan istilah 5 November 2026, jadi masih memuat kata *les*.

## Language

**Guru**:
Pengajar bimbel privat mandiri yang menjadi pelanggan utama.
_Dulu_: Guru. _Hindari_: Tutor sebagai istilah utama.

**Iklan** (halaman "Iklan saya"):
Informasi bimbel dan kontak yang sengaja diterbitkan guru agar dilihat orang tua. Iklan baru dan perubahannya dicek tim kami sebelum tayang.
_Dulu_: Profil publik. _Hindari_: Profil guru untuk menyebut catatan pribadi guru.

**Bimbel yang diajarkan**:
Pilihan bimbel di iklan: pelajaran, kelas, cara belajar (online atau tatap muka), lama, dan tarif sendiri. Satu iklan boleh punya beberapa.
_Dulu_: Penawaran les. _Hindari_: Paket bimbel untuk menyebut ini; paket adalah kesepakatan dengan satu murid.

**Menerima murid baru / Sedang penuh**:
Keterangan apakah guru masih menerima murid baru. Terpisah dari status tayang iklan.
_Dulu_: Status menerima murid. _Hindari_: Iklan dijeda untuk menyebut guru sedang penuh.

**Wilayah yang bisa didatangi**:
Daerah yang bersedia didatangi guru untuk mengajar di rumah murid. Boleh berbeda dari tempat tinggal guru.
_Dulu_: Area layanan tatap muka. _Hindari_: Alamat guru sebagai sinonim.

**Sedang dicek tim kami**:
Iklan yang sudah dikirim guru dan menunggu pemeriksaan sebelum tayang.
_Dulu_: Menunggu pemeriksaan.

**Murid**:
Orang yang ikut bimbel, dengan catatannya sendiri milik guru yang mengajarnya. Orang yang sama bisa punya catatan terpisah pada guru lain.
_Hindari_: Akun murid; murid tidak punya akun.

**Murid berhenti bimbel**:
Murid yang dikeluarkan dari daftar "Masih bimbel". Riwayat, sisa pertemuan, dan pembayarannya tetap tersimpan; bisa diaktifkan lagi.
_Dulu_: Murid diarsipkan. _Hindari_: Murid dihapus.

**Orang tua**:
Orang tua atau penanggung jawab murid yang berhubungan dengan guru soal bimbel.
_Dulu_: Wali. _Hindari_: Pemegang tautan sebagai sinonim; memegang tautan tidak membuktikan hubungan dengan murid.

**Paket bimbel**:
Kesepakatan bimbel untuk satu murid: jumlah pertemuan, harga, dan aturan pembatalan. Satu murid boleh punya beberapa paket.
_Dulu_: Paket pertemuan. _Hindari_: Pembayaran sebagai sinonim paket; uang masuk dan jumlah pertemuan adalah dua hal.

**Paket habis**:
Paket yang semua pertemuannya sudah terpakai.
_Hindari_: Paket diakhiri untuk menyebut paket habis.

**Paket diakhiri**:
Paket yang dihentikan lebih awal atas kesepakatan dengan orang tua; sisa pertemuannya tetap tercatat belum dipakai.
_Dulu_: Paket ditutup. _Hindari_: Paket habis atau bimbel selesai untuk paket yang masih punya sisa.

**Sisa pertemuan**:
Jumlah pertemuan yang masih menjadi hak murid di satu paket.
_Dulu_: Jatah pertemuan. _Hindari_: Saldo tanpa menjelaskan bahwa yang dihitung adalah pertemuan, bukan uang.

**Berkurangnya sisa pertemuan**:
Sisa pertemuan turun karena pertemuan sudah selesai atau pembatalan yang disepakati tetap dihitung.
_Dulu_: Pemakaian jatah. _Hindari_: Kehadiran sebagai sinonim; pembatalan juga bisa mengurangi.

**Pertemuan**:
Satu kali bimbel antara guru dan murid. Statusnya akan datang, sudah selesai, atau batal. Memindahkan jadwal tetap pertemuan yang sama.
_Dulu_: Sesi. _Hindari_: Paket untuk menyebut satu pertemuan.

**Sudah selesai**:
Pertemuan yang benar-benar berlangsung.
_Dulu_: Les selesai. _Hindari_: Sisa pertemuan berkurang sebagai sinonim; pembatalan yang tetap dihitung bukan pertemuan yang berlangsung.

**Batal (pertemuan tidak berkurang)**:
Pertemuan dibatalkan tanpa mengurangi sisa pertemuan murid.
_Dulu_: Batal tanpa potong jatah.

**Batal (pertemuan tetap dihitung)**:
Pertemuan dibatalkan tetapi tetap mengurangi sisa pertemuan sesuai kesepakatan. Tidak dihitung sebagai pertemuan yang berlangsung.
_Dulu_: Batal dengan potong jatah.

**Bayar lebih**:
Uang bersih yang diterima untuk satu paket melebihi harga paket.
_Dulu_: Kelebihan bayar. _Hindari_: Sisa pertemuan atau pendapatan tambahan.

**Belum dibayar**:
Harga paket dikurangi uang yang sudah diterima.
_Dulu_: Sisa pembayaran.

**Tautan untuk orang tua**:
Tautan untuk melihat ringkasan bimbel satu murid tanpa membuat akun. Siapa pun yang memegangnya bisa membaca selama tautan masih berlaku (tujuh hari).
_Dulu_: Tautan wali. _Hindari_: Akun orang tua.

**Uji coba awal**:
Pemakaian aplikasi oleh sejumlah kecil guru pada bimbel nyata untuk mengetahui bagian yang perlu diperbaiki.
_Hindari_: Pilot tanpa penjelasan.
