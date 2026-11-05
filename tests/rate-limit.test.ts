import { describe, expect, it, vi } from "vitest";
import { HttpError } from "@/lib/http";
import { clientIp, enforce, policyFor, rateKey, recordFailure, type RateBucket, type RateRpc } from "@/lib/rate-limit";

const secret = "a".repeat(64);
const buckets: RateBucket[] = ["login.ip", "login.account", "recover.ip", "recover.email", "sensitive.account", "export.account", "guardian.ip"];
const request = (headers: Record<string, string> = {}) => new Request("http://127.0.0.1:3000/api/auth", { headers });

describe("clientIp", () => {
  it("memakai alamat pertama dari x-forwarded-for", () => {
    expect(clientIp(request({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe("203.0.113.7");
    expect(clientIp(request({ "x-forwarded-for": "2001:db8::1" }))).toBe("2001:db8::1");
  });
  it("jatuh ke 'local' bila header kosong atau bukan alamat IP", () => {
    expect(clientIp(request())).toBe("local");
    expect(clientIp(request({ "x-forwarded-for": "bukan-ip" }))).toBe("local");
    expect(clientIp(request({ "x-forwarded-for": "<script>" }))).toBe("local");
  });
});

describe("rateKey", () => {
  it("menghasilkan 64 heksadesimal yang tetap untuk masukan yang sama", () => {
    const key = rateKey(secret, "login.account", "rina@example.test|203.0.113.7");
    expect(key).toMatch(/^[0-9a-f]{64}$/);
    expect(key).toBe(rateKey(secret, "login.account", "rina@example.test|203.0.113.7"));
  });
  it("tidak memuat email atau IP mentah", () => {
    expect(rateKey(secret, "login.account", "rina@example.test|203.0.113.7")).not.toMatch(/rina|203/);
  });
  it("berbeda antar bucket, subjek, dan rahasia", () => {
    const base = rateKey(secret, "login.ip", "x");
    expect(rateKey(secret, "recover.ip", "x")).not.toBe(base);
    expect(rateKey(secret, "login.ip", "y")).not.toBe(base);
    expect(rateKey("b".repeat(64), "login.ip", "x")).not.toBe(base);
  });
  it("tidak membedakan huruf besar/kecil dan spasi pada email", () => {
    expect(rateKey(secret, "recover.email", "  Rina@Example.test ")).toBe(rateKey(secret, "recover.email", "rina@example.test"));
  });
  it("menolak rahasia yang belum dikonfigurasi", () => {
    expect(() => rateKey("", "login.ip", "x")).toThrow();
    expect(() => rateKey("pendek", "login.ip", "x")).toThrow();
  });
});

describe("policyFor", () => {
  it("memberi batas bilangan bulat positif untuk setiap bucket", () => {
    for (const bucket of buckets) {
      const { limit, windowSeconds } = policyFor(bucket);
      expect(Number.isInteger(limit) && limit >= 1).toBe(true);
      expect(Number.isInteger(windowSeconds) && windowSeconds >= 1).toBe(true);
    }
  });
});

describe("enforce", () => {
  const allow: RateRpc = async () => ({ allowed: true, retry_after: 0 });

  it("lolos bila diizinkan", async () => {
    await expect(enforce("login.ip", "203.0.113.7", {}, allow, secret)).resolves.toBeUndefined();
  });

  it("melempar 429 dengan Retry-After dan pesan menit yang dibulatkan ke atas", async () => {
    const blocked: RateRpc = async () => ({ allowed: false, retry_after: 61 });
    const error = await enforce("login.account", "a|b", {}, blocked, secret).catch(e => e);
    expect(error).toBeInstanceOf(HttpError);
    expect(error.status).toBe(429);
    expect(error.retryAfter).toBe(61);
    expect(error.message).toContain("2 menit");
  });

  it("mengirim kunci ter-hash dan kebijakan bucket ke basis data", async () => {
    const rpc = vi.fn<RateRpc>(allow);
    await enforce("export.account", "user-1", { record: false }, rpc, secret);
    const call = rpc.mock.calls[0][0];
    expect(call.bucket).toBe("export.account");
    expect(call.keyHash).toBe(rateKey(secret, "export.account", "user-1"));
    expect(call.limit).toBe(policyFor("export.account").limit);
    expect(call.windowSeconds).toBe(policyFor("export.account").windowSeconds);
    expect(call.record).toBe(false);
  });

  it("gagal-tertutup bila basis data error", async () => {
    const broken: RateRpc = async () => { throw new Error("db mati"); };
    const error = await enforce("login.ip", "x", {}, broken, secret).catch(e => e);
    expect(error).toBeInstanceOf(HttpError);
    expect(error.status).toBe(503);
  });

  it("boleh gagal-terbuka bila diminta (halaman publik)", async () => {
    const broken: RateRpc = async () => { throw new Error("db mati"); };
    await expect(enforce("guardian.ip", "x", { failOpen: true }, broken, secret)).resolves.toBeUndefined();
  });
});

describe("recordFailure", () => {
  it("mencatat satu kegagalan tanpa memblokir", async () => {
    const rpc = vi.fn<RateRpc>(async () => ({ allowed: false, retry_after: 10 }));
    await expect(recordFailure("login.account", "a|b", rpc, secret)).resolves.toBeUndefined();
    expect(rpc.mock.calls[0][0].record).toBe(true);
  });
  it("tidak melempar saat pencatatan gagal", async () => {
    const broken: RateRpc = async () => { throw new Error("db mati"); };
    await expect(recordFailure("login.account", "a|b", broken, secret)).resolves.toBeUndefined();
  });
});
