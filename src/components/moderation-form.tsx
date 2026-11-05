"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export type Decision = { decision: "approve" | "reject" | "hide" | "unhide"; label: string; tone?: string; needsReason: boolean };

// Satu kotak alasan untuk beberapa keputusan. Alasan wajib untuk tolak/sembunyikan/tampilkan kembali (juga dijaga di basis data).
export function ModerationForm({ id, decisions }: { id: string; decisions: Decision[] }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);

  async function decide(choice: Decision) {
    if (pending) return;
    if (choice.needsReason && !reason.trim()) { setFailed(true); setMessage("Tuliskan alasannya."); return; }
    setPending(true); setMessage("");
    try {
      const response = await fetch("/api/admin/moderate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, decision: choice.decision, reason }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setFailed(false); setMessage(result.message ?? "Keputusan tersimpan."); setReason("");
      router.refresh();
    } catch (error) {
      setFailed(true);
      setMessage(error instanceof Error ? error.message : "Belum tersimpan. Periksa koneksi dan coba kembali.");
    } finally { setPending(false); }
  }

  return (
    <div className="stack-sm">
      <label className="field">
        <span className="field-label">Alasan (dilihat guru)</span>
        <textarea value={reason} maxLength={1000} onChange={event => setReason(event.target.value)} disabled={pending} />
      </label>
      <div className="row">
        {decisions.map(choice => (
          <button key={choice.decision} type="button" className={`btn ${choice.tone ?? ""}`} disabled={pending} onClick={() => decide(choice)}>
            {pending ? "Memproses…" : choice.label}
          </button>
        ))}
      </div>
      {message && <p role={failed ? "alert" : "status"} className={`notice ${failed ? "error" : "success"}`}>{message}</p>}
    </div>
  );
}
