"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Formulir aksi akun yang memeriksa kata sandi di server (ganti email/kata sandi, ekspor, hapus/batal hapus).
// Ekspor mengunduh berkas; selebihnya membaca jawaban JSON, menampilkan pesan, lalu menyegarkan halaman atau berpindah.
export function AccountForm({ action, endpoint = "/api/account", buttonLabel, tone = "", download = false, children }: {
  action?: string; endpoint?: string; buttonLabel: string; tone?: string; download?: boolean; children?: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    delete values.confirm;   // kotak centang hanya untuk pengguna, bukan bagian permintaan
    setPending(true); setMessage("");
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...(action ? { action } : {}), ...values }) });
      if (download && response.ok) {
        const name = /filename="([^"]+)"/.exec(response.headers.get("Content-Disposition") ?? "")?.[1] ?? "data-les-privat.html";
        const link = document.createElement("a");
        link.href = URL.createObjectURL(await response.blob());
        link.download = name;
        link.click();
        URL.revokeObjectURL(link.href);
        form.reset(); setFailed(false); setMessage("Data diunduh. Simpan berkas itu di tempat yang aman.");
        return;
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      form.reset(); setFailed(false); setMessage(result.message ?? "Berhasil.");
      if (result.redirect) router.push(result.redirect); else router.refresh();
    } catch (error) {
      setFailed(true);
      setMessage(error instanceof Error ? error.message : "Belum berhasil. Periksa koneksi dan coba kembali.");
    } finally { setPending(false); }
  }

  return (
    <form onSubmit={submit} className="stack">
      <fieldset disabled={pending} className="stack">
        {children}
        <button type="submit" className={`btn ${tone}`}>{pending ? "Memproses…" : buttonLabel}</button>
      </fieldset>
      {message && <p role={failed ? "alert" : "status"} className={`notice ${failed ? "error" : "success"}`}>{message}</p>}
    </form>
  );
}
