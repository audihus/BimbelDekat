import { describe, expect, it, vi } from "vitest";
import { isLoopbackUrl, resilientFetch } from "@/lib/supabase/resilient-fetch";

const ok = () => new Response("{}", { status: 200 });

describe("isLoopbackUrl", () => {
  it("hanya mengenali alamat lokal", () => {
    expect(isLoopbackUrl("http://127.0.0.1:55321")).toBe(true);
    expect(isLoopbackUrl("http://localhost:55321")).toBe(true);
    expect(isLoopbackUrl("https://abc.supabase.co")).toBe(false);
    expect(isLoopbackUrl("tidak-valid")).toBe(false);
  });
});

describe("resilientFetch", () => {
  it("mengulang setelah kegagalan jaringan lalu berhasil", async () => {
    const base = vi.fn().mockRejectedValueOnce(new TypeError("fetch failed")).mockResolvedValueOnce(ok());
    const response = await resilientFetch(base, { attempts: 3, timeoutMs: 1000 })("http://x/y", { method: "POST", body: "{}" });
    expect(response.status).toBe(200);
    expect(base).toHaveBeenCalledTimes(2);
  });

  it("tidak mengulang jawaban HTTP, termasuk error server", async () => {
    const base = vi.fn().mockResolvedValue(new Response("x", { status: 500 }));
    const response = await resilientFetch(base, { attempts: 3, timeoutMs: 1000 })("http://x/y");
    expect(response.status).toBe(500);
    expect(base).toHaveBeenCalledTimes(1);
  });

  it("memutus percobaan yang macet lalu mencoba lagi", async () => {
    const stalled = (_: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError"))));
    const base = vi.fn().mockImplementationOnce(stalled).mockResolvedValueOnce(ok());
    const started = Date.now();
    const response = await resilientFetch(base, { attempts: 2, timeoutMs: 50 })("http://x/y");
    expect(response.status).toBe(200);
    expect(base).toHaveBeenCalledTimes(2);
    expect(Date.now() - started).toBeLessThan(2000);
  });

  it("menyerah setelah percobaan habis dan melempar kesalahan terakhir", async () => {
    const base = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    await expect(resilientFetch(base, { attempts: 3, timeoutMs: 1000 })("http://x/y")).rejects.toThrow("fetch failed");
    expect(base).toHaveBeenCalledTimes(3);
  });

  it("menghormati pembatalan dari pemanggil tanpa mengulang", async () => {
    const controller = new AbortController();
    controller.abort();
    const base = vi.fn().mockRejectedValue(new DOMException("aborted", "AbortError"));
    await expect(resilientFetch(base, { attempts: 3, timeoutMs: 1000 })("http://x/y", { signal: controller.signal })).rejects.toThrow();
    expect(base).toHaveBeenCalledTimes(1);
  });

  it("tidak mengulang isi permintaan yang tidak bisa dikirim ulang", async () => {
    const base = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    const body = new ReadableStream();
    await expect(resilientFetch(base, { attempts: 3, timeoutMs: 1000 })("http://x/y", { method: "POST", body, duplex: "half" } as RequestInit)).rejects.toThrow();
    expect(base).toHaveBeenCalledTimes(1);
  });
});
