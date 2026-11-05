import { verifyPassword } from "@/lib/session";
import { HttpError } from "@/lib/http";
import { enforce, recordFailure } from "@/lib/rate-limit";
import { logEvent } from "@/lib/log";
import type { Account } from "@/lib/domain/types";

// PRD FR13: login yang sudah terbuka tidak cukup untuk aksi sensitif; kata sandi harus dimasukkan ulang.
// Percobaan salah dihitung per akun, sehingga sesi yang dibajak tidak bisa menebak kata sandi tanpa batas.
export async function requirePassword(account: Account, password: string, action: string): Promise<void> {
  await enforce("sensitive.account", account.id, { record: false });
  if (await verifyPassword(account, password)) return;
  await recordFailure("sensitive.account", account.id);
  logEvent("warn", "account.password_check_failed", { userId: account.id, action });
  throw new HttpError("Kata sandi belum sesuai.", 403);
}
