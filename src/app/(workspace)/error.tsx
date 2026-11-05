"use client";
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="card stack"><h1>Halaman belum dapat dimuat</h1><p className="muted">Periksa koneksi lalu coba kembali. Perubahan hanya dinyatakan berhasil setelah tersimpan.</p><div><button className="btn" onClick={reset}>Coba lagi</button></div></div>;}
