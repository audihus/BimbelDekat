// Menghapus akun guru yang permintaan penghapusannya sudah lewat masa batal 7 hari (PRD FR15).
// Penjadwalan otomatis di produksi belum dipasang (hosting belum diputuskan); sementara dijalankan manual:
//   node scripts/process-deletions.mjs
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (url !== "http://127.0.0.1:55321") throw new Error("Skrip ini hanya boleh dijalankan terhadap Supabase lokal proyek ini.");
const admin = createClient(url, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
// Docker Desktop di Windows kadang menahan permintaan pertama; ulangi beberapa kali sebelum menyerah.
let result;
for (let attempt = 1; attempt <= 5; attempt++) {
  result = await admin.rpc("process_account_deletions");
  if (!result.error || !/fetch failed|timeout/i.test(result.error.message)) break;
}
const { data, error } = result;
if (error) throw new Error(`Penghapusan terjadwal gagal: ${error.message}`);
// Sengaja hanya jumlah: tidak ada nama atau email yang dicetak.
console.log(`${data} akun dihapus (sudah lewat masa batal 7 hari).`);
