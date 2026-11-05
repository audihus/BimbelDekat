export type LessonStatus = "scheduled" | "completed" | "cancelled" | "cancelled_charged";
export type AccountRole = "teacher" | "admin";
export type IndonesiaZone = "Asia/Jakarta" | "Asia/Makassar" | "Asia/Jayapura";

export function remainingQuota(quota: number, openingUsed: number, deltas: number[]): number {
  if (!Number.isSafeInteger(quota) || quota <= 0 || !Number.isSafeInteger(openingUsed) || openingUsed < 0 || openingUsed > quota || deltas.some(delta => !Number.isSafeInteger(delta))) {
    throw new Error("Jumlah jatah tidak sah.");
  }
  const remaining = quota - openingUsed + deltas.reduce((total, delta) => total + delta, 0);
  if (!Number.isSafeInteger(remaining) || remaining < 0) throw new Error("Jatah paket tidak cukup. Catat paket baru untuk les lanjutan.");
  return remaining;
}

export function paymentBalance(price: string, entries: string[]): { received: string; due: string; overpaid: string } {
  if (!/^\d+$/.test(price) || entries.some(entry => !/^-?\d+$/.test(entry))) throw new Error("Nominal harus berupa rupiah bulat.");
  const agreed = BigInt(price);
  const received = entries.reduce((total, entry) => total + BigInt(entry), 0n);
  const difference = agreed - received;
  return { received: received.toString(), due: (difference > 0n ? difference : 0n).toString(), overpaid: (difference < 0n ? -difference : 0n).toString() };
}

export function lessonCharge(status: LessonStatus, cancelledBy?: string, reason?: string): number {
  if (status === "completed") return 1;
  if (status === "scheduled" || status === "cancelled") return 0;
  if (status !== "cancelled_charged") throw new Error("Status les tidak sah.");
  if (cancelledBy === "teacher") throw new Error("Pembatalan oleh guru tidak memotong jatah.");
  if (!reason?.trim()) throw new Error("Tuliskan alasan pembatalan dengan potong jatah.");
  return 1;
}

export function assertSession(role: AccountRole, startedAt: Date, now: Date, revoked: boolean): void {
  const age = now.getTime() - startedAt.getTime();
  const lifetime = role === "admin" ? 8 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  if (revoked || !Number.isFinite(age) || age < 0 || age >= lifetime) throw new Error("Sesi sudah berakhir. Silakan masuk kembali.");
}

export function overlap(start: string, end: string, otherStart: string, otherEnd: string): boolean {
  const times = [start, end, otherStart, otherEnd].map(value => Date.parse(value));
  if (times.some(time => !Number.isFinite(time)) || times[0] >= times[1] || times[2] >= times[3]) throw new Error("Waktu jadwal tidak sah.");
  return times[0] < times[3] && times[2] < times[1];
}

export function localToInstant(local: string, zone: IndonesiaZone): string {
  const offsets = { "Asia/Jakarta": "+07:00", "Asia/Makassar": "+08:00", "Asia/Jayapura": "+09:00" };
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local) || !(zone in offsets)) throw new Error("Tanggal atau zona waktu tidak sah.");
  const calendar = new Date(`${local}:00.000Z`);
  if (!Number.isFinite(calendar.getTime()) || calendar.toISOString().slice(0, 16) !== local) throw new Error("Tanggal tidak sah.");
  return new Date(`${local}:00${offsets[zone]}`).toISOString();
}
