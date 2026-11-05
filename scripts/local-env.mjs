import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const file = ".env.local";
let previous = "";
if (existsSync(file)) {
  previous = readFileSync(file,"utf8");
  if (!previous.startsWith("# Local configuration: les-privat-local")) throw new Error(".env.local sudah ada; tidak ditimpa otomatis.");
}
const result = spawnSync(process.execPath, ["node_modules/supabase/dist/supabase.js", "status", "--output", "json"], { encoding:"utf8", timeout:30000, windowsHide:true });
if (result.status !== 0) throw new Error("Supabase lokal belum siap. Jalankan layanan lokal terlebih dahulu.");
const status = JSON.parse(result.stdout);
if (status.API_URL !== "http://127.0.0.1:55321") throw new Error("Status bukan milik konfigurasi lokal yang diharapkan.");
const oldSecret = previous.match(/^GUARDIAN_TOKEN_SECRET=(.+)$/m)?.[1];
const oldSessionKey = previous.match(/^SESSION_ENCRYPTION_KEY=(.+)$/m)?.[1];
writeFileSync(file,[
  "# Local configuration: les-privat-local",
  `NEXT_PUBLIC_SUPABASE_URL=${status.API_URL}`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${status.PUBLISHABLE_KEY ?? status.ANON_KEY}`,
  "NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000",
  `SUPABASE_SECRET_KEY=${status.SECRET_KEY ?? status.SERVICE_ROLE_KEY}`,
  `GUARDIAN_TOKEN_SECRET=${oldSecret ?? randomBytes(32).toString("hex")}`,
  `SESSION_ENCRYPTION_KEY=${oldSessionKey ?? randomBytes(32).toString("hex")}`,
  ""
].join("\n"), { mode:0o600 });
console.log("Konfigurasi lokal tersimpan di .env.local (diabaikan Git). Nilai rahasia tidak ditampilkan.");
