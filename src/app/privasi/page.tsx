import Link from "next/link";
import { PublicHeader,PublicFooter } from "@/components/ui";
import { APP_NAME } from "@/lib/brand";

export const metadata={title:"Kebijakan Privasi"};

// Menjelaskan data yang benar-benar disimpan aplikasi ini. Bila perilaku aplikasi berubah (data baru, layanan pihak ketiga baru), halaman ini harus ikut diubah.
export default function Privacy(){
  return <><PublicHeader/><main id="main" className="public-main"><article className="legal">
    <div className="page-heading"><p className="eyebrow">Kebijakan Privasi</p><h1>Data Anda dan cara kami menjaganya.</h1><p>Terakhir diperbarui: 7 November 2026.</p></div>

    <h2>Data yang kami simpan</h2>
    <ul>
      <li><strong>Akun guru:</strong> nama, alamat email, dan kata sandi. Kata sandi tidak disimpan sebagai teks biasa.</li>
      <li><strong>Profil guru:</strong> nama, foto (opsional), perkenalan, nomor WhatsApp, kota, wilayah, serta bimbel dan tarif. Data ini tampil untuk umum setelah ditinjau tim {APP_NAME}.</li>
      <li><strong>Catatan bimbel (opsional):</strong> nama dan kelas murid, nomor WhatsApp orang tua, alamat, catatan, paket, jadwal, dan pembayaran. Hanya guru pemilik akun yang dapat membukanya. Pengelola hanya meninjau profil guru dan tidak dapat melihat catatan ini.</li>
      <li><strong>Statistik profil:</strong> jumlah profil dibuka dan tombol WhatsApp ditekan. Alamat IP dan identitas pengunjung tidak disimpan.</li>
      <li><strong>Data teknis:</strong> cookie untuk menjaga login guru, serta catatan galat yang menyamarkan email, nomor telepon, dan alamat. Pembatas percobaan login memakai nilai samaran dari alamat IP dan email, bukan data aslinya.</li>
    </ul>
    <p>Orang tua yang mencari bimbel tidak perlu membuat akun, dan pencarian tidak disimpan sebagai data pribadi.</p>

    <h2>Penggunaan data</h2>
    <p>Data dipakai untuk menampilkan profil guru, menjalankan fitur catatan, dan menjaga keamanan. Kami tidak menjual data dan tidak memasang pelacak iklan pihak ketiga.</p>

    <h2>Layanan pihak lain</h2>
    <ul>
      <li><strong>Supabase:</strong> penyimpanan data dan sistem login.</li>
      <li><strong>Vercel:</strong> hosting aplikasi.</li>
      <li><strong>Penyedia email:</strong> pengiriman email verifikasi dan pemulihan kata sandi.</li>
      <li><strong>WhatsApp:</strong> tombol WhatsApp membuka aplikasi WhatsApp. Percakapan selanjutnya berlangsung di luar {APP_NAME} dan tunduk pada ketentuan WhatsApp.</li>
    </ul>

    <h2>Tautan untuk orang tua</h2>
    <p>Guru dapat membuat tautan ringkasan bimbel untuk satu murid. Tautan berlaku 7 hari, dan siapa pun yang memegangnya dapat membaca ringkasan tersebut. Guru dapat mematikan tautan kapan saja.</p>

    <h2>Hak guru atas data</h2>
    <ul>
      <li>Mengubah data profil dan catatan kapan saja.</li>
      <li>Mengunduh seluruh data di menu Akun.</li>
      <li>Meminta penghapusan akun di menu Akun. Profil langsung disembunyikan, dan permintaan dapat dibatalkan dalam 7 hari sebelum akun dihapus. Salinan cadangan dapat tersimpan paling lama 30 hari.</li>
    </ul>

    <h2>Data murid</h2>
    <p>Data murid dimasukkan oleh guru. Guru bertanggung jawab memperoleh izin orang tua atau wali murid sebelum mencatat data anak.</p>

    <h2>Keamanan</h2>
    <p>Kami membatasi akses data per guru dan mengenkripsi sesi login. Meski demikian, tidak ada sistem yang sepenuhnya bebas risiko.</p>

    <h2>Pertanyaan dan perubahan</h2>
    <p>Perubahan kebijakan ini diumumkan di halaman ini beserta tanggal pembaruannya. Pertanyaan dapat disampaikan lewat halaman <Link href="/kontak">Kontak</Link>.</p>
  </article></main><PublicFooter/></>;
}
