import { afterEach, describe, expect, it, vi } from "vitest";
import { logEvent, maskEmail, newErrorId, redact } from "@/lib/log";

afterEach(() => vi.restoreAllMocks());

describe("redact", () => {
  it("menyembunyikan kata sandi, token, rahasia, kuki, dan otorisasi", () => {
    const out = redact({ password: "KataSandiRahasia!2026", new_password: "x", token: "t", access_token: "a", refresh_token: "r", secret: "s", authorization: "Bearer abc", cookie: "les_session=1", apikey: "k" }) as Record<string, string>;
    for (const value of Object.values(out)) expect(value).toBe("[disembunyikan]");
  });

  it("menyembunyikan data pribadi murid dan wali", () => {
    const out = redact({ guardian_phone: "081234567890", phone: "6281234567890", address: "Jl. Mawar 1", notes: "catatan", name: "Andi" }) as Record<string, string>;
    expect(out.guardian_phone).toBe("[disembunyikan]");
    expect(out.phone).toBe("[disembunyikan]");
    expect(out.address).toBe("[disembunyikan]");
    expect(out.notes).toBe("[disembunyikan]");
    expect(out.name).toBe("Andi");
  });

  it("menyamarkan email tanpa menghilangkan domain", () => {
    expect(maskEmail("rina@example.test")).toBe("r***@example.test");
    expect(redact({ email: "rina@example.test" })).toEqual({ email: "r***@example.test" });
  });

  it("menembus objek dan larik bersarang", () => {
    const out = redact({ a: [{ password: "x" }, { ok: 1 }], b: { c: { token: "t" } } });
    expect(JSON.stringify(out)).not.toMatch(/"x"|"t"/);
    expect(out).toEqual({ a: [{ password: "[disembunyikan]" }, { ok: 1 }], b: { c: { token: "[disembunyikan]" } } });
  });

  it("membersihkan token dan email yang terselip di teks bebas", () => {
    const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abcdefghijklmnop";
    const opaque = "A".repeat(43);
    const text = redact(`gagal untuk rina@example.test dengan ${jwt} dan tautan /wali#${opaque}`) as string;
    expect(text).not.toContain(jwt);
    expect(text).not.toContain(opaque);
    expect(text).not.toContain("rina@example.test");
    expect(text).toContain("gagal untuk");
  });

  it("mengubah Error menjadi objek yang aman dicatat", () => {
    const out = redact(new Error("token eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.sigsigsigsigsig bocor")) as { name: string; message: string };
    expect(out.name).toBe("Error");
    expect(out.message).not.toContain("eyJhbGci");
  });

  it("tidak macet pada referensi melingkar", () => {
    const loop: Record<string, unknown> = { a: 1 };
    loop.self = loop;
    expect(() => JSON.stringify(redact(loop))).not.toThrow();
  });
});

describe("logEvent", () => {
  it("mencetak satu baris JSON dengan level, peristiwa, dan isi yang sudah disaring", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logEvent("info", "auth.login_failed", { email: "rina@example.test", password: "rahasia" });
    expect(spy).toHaveBeenCalledTimes(1);
    const line = spy.mock.calls[0][0] as string;
    expect(line).not.toContain("\n");
    const parsed = JSON.parse(line);
    expect(parsed).toMatchObject({ level: "info", event: "auth.login_failed", email: "r***@example.test", password: "[disembunyikan]" });
    expect(typeof parsed.time).toBe("string");
    expect(line).not.toContain("rahasia");
  });

  it("memakai console.error untuk level error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logEvent("error", "http.unhandled", { errorId: "ab12cd34" });
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe("newErrorId", () => {
  it("berupa 8 karakter heksadesimal dan berbeda-beda", () => {
    const a = newErrorId(), b = newErrorId();
    expect(a).toMatch(/^[0-9a-f]{8}$/);
    expect(a).not.toBe(b);
  });
});
