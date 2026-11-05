import type { IndonesiaZone } from "./domain/rules";

export interface Month { year: number; month: number }   // month 1..12
export interface Cell { key: string; day: number; inMonth: boolean }

const pad = (n: number) => String(n).padStart(2, "0");
const keyOf = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

// Tanggal kalender (YYYY-MM-DD) di zona waktu guru, bukan UTC: pertemuan 23.30 WIB tetap hari itu, 00.30 WITA sudah besok.
export function dateKey(instant: string, zone: IndonesiaZone): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(instant));
}

export function groupByDay<T extends { starts_at: string }>(lessons: T[], zone: IndonesiaZone): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  for (const lesson of [...lessons].sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at))) (groups[dateKey(lesson.starts_at, zone)] ??= []).push(lesson);
  return groups;
}

// Kisi bulan dengan minggu dimulai Senin. Jumlah baris menyesuaikan (4–6), tanpa baris kosong di ujung.
export function monthGrid(year: number, month: number): Cell[][] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7;                       // 0 = Senin
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const rows = Math.ceil((offset + days) / 7);
  const grid: Cell[][] = [];
  for (let r = 0; r < rows; r++) {
    const week: Cell[] = [];
    for (let c = 0; c < 7; c++) {
      const date = new Date(Date.UTC(year, month - 1, 1 - offset + r * 7 + c));
      week.push({ key: keyOf(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()), day: date.getUTCDate(), inMonth: date.getUTCMonth() === month - 1 });
    }
    grid.push(week);
  }
  return grid;
}

export function parseMonth(param: string | undefined, fallback: Month): Month {
  const match = /^(\d{4})-(\d{2})$/.exec(param ?? "");
  if (!match) return fallback;
  const [year, month] = [Number(match[1]), Number(match[2])];
  return month >= 1 && month <= 12 ? { year, month } : fallback;
}

// Hanya tanggal yang benar-benar ada di kalender (2026-02-30 ditolak).
export function parseDay(param: string | undefined): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(param ?? "");
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d ? keyOf(y, m, d) : null;
}

export function shiftMonth({ year, month }: Month, delta: number): Month {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

export const monthParam = ({ year, month }: Month) => `${year}-${pad(month)}`;
