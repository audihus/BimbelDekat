import Link from "next/link";
import { requireAccount } from "@/lib/session";
import { CommandForm,LogoutButton } from "@/components/command-form";
import { AccountForm } from "@/components/account-actions";
import { Field,SelectField } from "@/components/ui";
import { dateTime } from "@/lib/format";

export default async function AccountPage(){
  const account=await requireAccount();
  const active=account.status==="active";
  const teacher=account.role==="teacher";
  const purgeAt=account.deletion_requested_at?new Date(Date.parse(account.deletion_requested_at)+7*86400000).toISOString():null;
  return <div className="stack"><div className="page-heading"><p className="eyebrow">Pengaturan</p><h1 style={{marginTop:8}}>Akun Anda</h1><p>Data akun, keamanan, dan unduhan.</p></div>
    {!active&&purgeAt&&<section className="card stack"><h2>Akun menunggu penghapusan</h2><p className="notice warning">Akun dan seluruh catatan akan dihapus setelah {dateTime(purgeAt,account.timezone)}. Iklan disembunyikan dan tautan orang tua dimatikan. Selama menunggu, Anda hanya dapat mengunduh data atau membatalkan.</p><p className="muted">Salinan cadangan dapat bertahan hingga 30 hari.</p><AccountForm action="deletion.cancel" buttonLabel="Batalkan penghapusan akun" tone="secondary"/></section>}
    <section className="card stack"><h2>Informasi akun</h2><div><p className="muted">Nama</p><p>{account.display_name}</p></div><div><p className="muted">Email</p><p>{account.email}</p></div></section>
    {active&&<section className="card stack"><h2>Zona waktu</h2><p className="muted">Dipakai untuk menampilkan jam pertemuan.</p><CommandForm action="account.timezone" buttonLabel="Simpan zona waktu"><SelectField label="Zona waktu" name="timezone" defaultValue={account.timezone}><option value="Asia/Jakarta">WIB — Indonesia Barat</option><option value="Asia/Makassar">WITA — Indonesia Tengah</option><option value="Asia/Jayapura">WIT — Indonesia Timur</option></SelectField></CommandForm></section>}
    {active&&<section className="card stack"><h2>Ubah email</h2><p className="muted">Tautan konfirmasi dikirim ke email lama dan baru. Email berubah setelah keduanya dikonfirmasi.</p><AccountForm action="email.change" buttonLabel="Kirim tautan konfirmasi" tone="secondary"><Field label="Email baru" name="email" type="email" autoComplete="email" required maxLength={254}/><Field label="Kata sandi saat ini" name="password" type="password" autoComplete="current-password" required maxLength={256}/></AccountForm></section>}
    {active&&<section className="card stack"><h2>Ubah kata sandi</h2><p className="muted">Minimal 15 karakter. Setelah diganti, Anda keluar dari semua perangkat.</p><AccountForm action="password.change" buttonLabel="Ganti kata sandi" tone="secondary"><Field label="Kata sandi saat ini" name="password" type="password" autoComplete="current-password" required maxLength={256}/><Field label="Kata sandi baru" name="newPassword" type="password" autoComplete="new-password" required minLength={15} maxLength={256}/></AccountForm></section>}
    {teacher&&<section className="card stack"><h2>Unduh data Anda</h2><p className="muted">Berisi murid, paket, jadwal, pembayaran, dan iklan Anda. Buka di browser, lalu Cetak untuk menyimpan sebagai PDF. Dokumen ini memuat data pribadi; simpan dengan aman.</p><AccountForm endpoint="/api/account/export" download buttonLabel="Unduh data" tone="secondary"><Field label="Kata sandi saat ini" name="password" type="password" autoComplete="current-password" required maxLength={256}/></AccountForm></section>}
    <section className="card stack"><h2>Login dan keamanan</h2><p className="muted">Perangkat hilang? Masuk dari perangkat lain, lalu keluar dari semua perangkat. Login berlaku maksimal 7 hari.</p><LogoutButton all/><Link className="text-link" href="/lupa-kata-sandi">Lupa kata sandi</Link></section>
    {teacher&&active&&<section className="card stack"><h2>Hapus akun</h2><p className="notice warning">Iklan langsung disembunyikan dan tautan orang tua dimatikan. Anda punya 7 hari untuk membatalkan. Setelah itu, akun dan seluruh catatan dihapus permanen. Salinan cadangan dapat bertahan hingga 30 hari.</p><AccountForm action="deletion.request" buttonLabel="Minta penghapusan akun" tone="danger"><Field label="Kata sandi saat ini" name="password" type="password" autoComplete="current-password" required maxLength={256}/><label className="row"><input type="checkbox" name="confirm" required/><span>Saya mengerti akun saya akan dihapus setelah 7 hari.</span></label></AccountForm></section>}
  </div>;
}
