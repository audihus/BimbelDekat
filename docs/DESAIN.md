# Pedoman desain BimbelDekat

Nuansa: **hangat & ramah**. Pemakainya guru bimbel privat dan orang tua, jadi tampilannya akrab, jelas, dan tidak seperti aplikasi kantor. Pedoman ini diturunkan dengan skill `ui-ux-pro-max` (kueri "local service marketplace warm trust", hasil pertamanya berupa palet ungu dan huruf anak-anak yang **tidak** dipakai karena tidak cocok), lalu kontrasnya dihitung ulang.

## Warna (token di `:root`, `src/app/globals.css`)
| Token | Nilai | Pakai untuk |
|---|---|---|
| `--background` | `#fff7ed` | latar halaman (krem) |
| `--foreground` | `#292524` | teks utama (kontras 14,3 di latar) |
| `--muted` | `#57534e` | teks pendukung (7,2) |
| `--primary` / `--primary-dark` | `#c2410c` / `#9a3412` | tombol utama, tautan, penekanan. Putih di atas `#c2410c` = 5,2:1. Oranye `#ea580c` dari skill **tidak** dipakai untuk tombol putih (hanya 3,6:1). |
| `--wa` | `#15803d` | **khusus** tombol WhatsApp dan status baik (putih di atasnya 5,0:1) |
| `--border` | `#f1e4d7` | garis halus hangat |

Satu aturan: oranye = tindakan milik **guru** (daftar, simpan, lanjut); hijau = menghubungi lewat WhatsApp dan hal yang berhasil/baik.

## Huruf
Plus Jakarta Sans (variabel) lewat `next/font`, dihosting sendiri saat build. Dasar 16 px, tinggi baris 1,65. Spasi huruf judul hanya sedikit negatif (-0,012 hingga -0,02em); nilai lebih rapat membuat huruf saling menempel.

## Bentuk dan sentuhan
Kartu radius 18 px, tombol/kolom 12 px, bayangan hangat lembut. Target sentuh ≥ 44 px (tombol 46 px, tombol besar 56 px). Fokus keyboard selalu terlihat (garis 3 px). Animasi mati bila pengguna meminta `prefers-reduced-motion`. Tidak ada emoji sebagai ikon (ikon lucide).

## Aturan isi (marketing)
- Tombol WhatsApp ada di kartu guru, di halaman profil, dan **menempel di bawah layar ponsel** pada profil. Pesan pembukanya terisi otomatis.
- Tidak ada angka, testimoni, atau jumlah guru karangan. Kartu contoh selalu berlabel "bukan guru sungguhan".
- Tidak menyebut harga atau "gratis" (model bisnis belum diputuskan).
- Bahasa awam: lihat tabel istilah di `GLOSSARY.md`.

## Daftar periksa sebelum menyerahkan halaman
Kontras 4,5:1; tidak ada gulir ke samping di 375 px; semua yang bisa ditekan ≥ 44 px; ada label untuk setiap kolom; tangkapan layar 1280 px dan 390 px sudah dilihat.

## Ilustrasi
Dibuat sendiri (SVG + HTML/CSS) di `src/components/illustrations.tsx` dengan palet di atas, tanpa gambar dari luar: `HeroArt` (ponsel berisi percakapan WhatsApp rekaan + kartu kecil + buku) dan `StepArt` (tiga gambar langkah). Semuanya `aria-hidden` karena hanya hiasan; ukurannya memakai satuan `cqw` sehingga ikut mengecil di ponsel. Isi percakapan adalah contoh rekaan, bukan testimoni.

## Tata letak: yang dilarang
Tidak ada elemen yang menimpa elemen lain (tanpa margin negatif di antara bagian halaman), dan nomor langkah selalu di dalam kartunya. Tiga langkah tetap tiga kolom sampai layar 800 px, lalu satu kolom (tidak pernah dua kolom dengan satu yatim).

## Dua halaman depan
`/` untuk orang tua dan `/untuk-guru` untuk guru, dipisah karena tujuan pengunjungnya berbeda. Kerangka sama: **Navbar → Hero → isi → Tanya jawab → Ajakan → Footer**. Navbar menempel di atas dan hanya memuat "Beranda", "Cari bimbel", dan "Untuk guru". Tombol kembali memakai `BackLink` (pil bergaris dengan panah), bukan tautan teks kecil. Teks sengaja baku dan singkat: satu kalimat pendek per penjelasan. Footer dua kolom (Untuk orang tua, Untuk guru) dan hanya menautkan halaman yang benar-benar ada; belum ada halaman Tentang, Kontak, atau Kebijakan Privasi. Judul guru: "Dapatkan murid baru untuk bimbel privat Anda."; judul orang tua: "Cari bimbel privat di dekat rumah Anda."
