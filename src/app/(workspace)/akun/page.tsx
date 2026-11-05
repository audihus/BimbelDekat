import Link from "next/link";
import { requireAccount } from "@/lib/session";
import { CommandForm,LogoutButton } from "@/components/command-form";
import { SelectField } from "@/components/ui";

export default async function AccountPage(){
  const account=await requireAccount();
  return <div className="stack"><div className="page-heading"><p className="eyebrow">Pengaturan</p><h1 style={{marginTop:8}}>Akun Anda</h1><p>Informasi akun dan pilihan waktu untuk jadwal les.</p></div>
    <section className="card stack"><h2>Informasi akun</h2><div><p className="muted">Nama</p><p>{account.display_name}</p></div><div><p className="muted">Email</p><p>{account.email}</p></div></section>
    {account.status==="active"&&<section className="card stack"><h2>Zona waktu</h2><p className="muted">Waktu jadwal ditampilkan sesuai zona waktu pilihan Anda.</p><CommandForm action="account.timezone" buttonLabel="Simpan zona waktu"><SelectField label="Zona waktu" name="timezone" defaultValue={account.timezone}><option value="Asia/Jakarta">WIB — Indonesia Barat</option><option value="Asia/Makassar">WITA — Indonesia Tengah</option><option value="Asia/Jayapura">WIT — Indonesia Timur</option></SelectField></CommandForm></section>}
    <section className="card stack"><h2>Login dan keamanan</h2><p className="muted">Jika perangkat hilang, masuk dari perangkat lain lalu keluar dari semua perangkat.</p><LogoutButton all/><Link className="text-link" href="/lupa-kata-sandi">Lupa kata sandi</Link></section>
  </div>;
}
