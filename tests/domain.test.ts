import { describe, expect, it } from "vitest";
import { remainingQuota, paymentBalance, lessonCharge, assertSession, overlap, localToInstant } from "@/lib/domain/rules";

describe("jatah paket", () => {
  it("memisahkan pemakaian pembukaan, les baru, dan koreksi", () => {
    expect(remainingQuota(8, 3, [-1, -1, 1])).toBe(4);
  });
  it("menolak jatah negatif", () => {
    expect(() => remainingQuota(2, 1, [-1, -1])).toThrow();
  });
  it("batal oleh guru selalu tanpa potong jatah", () => {
    expect(() => lessonCharge("cancelled_charged", "teacher", "Guru berhalangan")).toThrow();
    expect(lessonCharge("cancelled", "teacher", "Guru berhalangan")).toBe(0);
  });
  it("pembatalan dengan potong jatah memerlukan alasan", () => {
    expect(() => lessonCharge("cancelled_charged", "guardian", " ")).toThrow();
    expect(lessonCharge("cancelled_charged", "guardian", "Disepakati wali")).toBe(1);
  });
});

describe("pembayaran manual", () => {
  it("memisahkan kelebihan pembayaran dan pengembalian uang", () => {
    expect(paymentBalance("400000", ["450000", "-20000"])).toEqual({ received: "430000", due: "0", overpaid: "30000" });
  });
  it("menghitung nominal besar dengan tepat tanpa floating point", () => {
    expect(paymentBalance("9007199254740993", ["9007199254740992"])).toEqual({ received: "9007199254740992", due: "1", overpaid: "0" });
  });
});

describe("sesi login absolut", () => {
  const started = new Date("2026-10-01T00:00:00Z");
  it("mengakhiri login guru tepat setelah tujuh hari", () => {
    expect(() => assertSession("teacher", started, new Date("2026-10-07T23:59:59Z"), false)).not.toThrow();
    expect(() => assertSession("teacher", started, new Date("2026-10-08T00:00:00Z"), false)).toThrow();
  });
  it("mengakhiri login admin setelah delapan jam dan menolak sesi dicabut", () => {
    expect(() => assertSession("admin", started, new Date("2026-10-01T08:00:00Z"), false)).toThrow();
    expect(() => assertSession("teacher", started, started, true)).toThrow();
  });
});

describe("jadwal dan zona waktu", () => {
  it("mengizinkan jadwal bersebelahan, menolak jadwal bertumpuk", () => {
    expect(overlap("2026-10-30T01:00Z", "2026-10-30T02:00Z", "2026-10-30T02:00Z", "2026-10-30T03:00Z")).toBe(false);
    expect(overlap("2026-10-30T01:00Z", "2026-10-30T02:00Z", "2026-10-30T01:30Z", "2026-10-30T03:00Z")).toBe(true);
  });
  it("mengubah WIB/WITA/WIT ke instan yang sama dekat pergantian hari", () => {
    expect(localToInstant("2026-10-31T00:30", "Asia/Jakarta")).toBe("2026-10-30T17:30:00.000Z");
    expect(localToInstant("2026-10-31T01:30", "Asia/Makassar")).toBe("2026-10-30T17:30:00.000Z");
    expect(localToInstant("2026-10-31T02:30", "Asia/Jayapura")).toBe("2026-10-30T17:30:00.000Z");
  });
});
