import { describe, expect, it } from "vitest";
import { safeNext, guardianToken, tokenHash, tokenLink, mutationOriginAllowed } from "@/lib/security";
import { parseCommand } from "@/lib/domain/commands";

describe("batas HTTP dan tautan", () => {
  it("token wali tidak dikirim sebagai path atau query dalam permintaan halaman",()=>{
    const link=new URL(tokenLink("https://example.test","private-token"));
    expect(link.pathname).toBe("/wali");
    expect(link.search).toBe("");
    expect(link.hash).toBe("#private-token");
  });
  it("menolak pengalihan ke situs lain setelah masuk", () => {
    expect(safeNext("https://example.org")).toBe("/dashboard");
    expect(safeNext("//example.org")).toBe("/dashboard");
    expect(safeNext("/\\example.org")).toBe("/dashboard");
    expect(safeNext("/akun/reset")).toBe("/akun/reset");
  });
  it("mewajibkan origin aplikasi yang tepat untuk perubahan", () => {
    expect(mutationOriginAllowed(null, "http://127.0.0.1:3000")).toBe(false);
    expect(mutationOriginAllowed("https://evil.test", "http://127.0.0.1:3000")).toBe(false);
    expect(mutationOriginAllowed("http://127.0.0.1:3000", "http://127.0.0.1:3000")).toBe(true);
  });
  it("token tidak dapat diturunkan dari ID tanpa rahasia dan berbeda antar ruang kerja", () => {
    const secret = "test-only-secret-that-is-at-least-32-bytes";
    const first = guardianToken(secret, "workspace-a", "request-a");
    expect(first.length).toBeGreaterThanOrEqual(40);
    expect(first).toBe(guardianToken(secret, "workspace-a", "request-a"));
    expect(first).not.toBe(guardianToken(secret, "workspace-b", "request-a"));
    expect(tokenHash(first)).not.toContain(first);
    expect(() => guardianToken("short", "a", "b")).toThrow();
  });
});

describe("validasi perintah sebelum database", () => {
  it("menolak tindakan tidak dikenal dan harga pecahan", () => {
    expect(() => parseCommand("sql.execute", {})).toThrow();
    expect(() => parseCommand("package.create", { student_id: "00000000-0000-4000-8000-000000000001", name: "Matematika", quota: 8, opening_used: 0, agreed_price: "400000.5" })).toThrow();
  });
  it("mencegah penyisipan pemilik ruang kerja dari formulir", () => {
    expect(() => parseCommand("student.create", { name: "Andi", level: "SD", workspace_id: "00000000-0000-4000-8000-000000000001" })).toThrow();
    expect(parseCommand("student.create", { name: " Andi ", level: "SD" }).name).toBe("Andi");
  });
});
