// Docker Desktop di Windows kadang me-reset atau menahan permintaan HTTP pertama ke Supabase lokal
// (diukur: ECONNRESET atau macet 30 detik, lalu permintaan berikutnya normal). Hanya dipakai untuk alamat lokal.
export function isLoopbackUrl(value: string): boolean {
  try { return ["127.0.0.1", "localhost", "[::1]"].includes(new URL(value).hostname); }
  catch { return false; }
}

export function resilientFetch(base: typeof fetch = fetch, options: { attempts?: number; timeoutMs?: number } = {}): typeof fetch {
  const attempts = options.attempts ?? 3;
  const timeoutMs = options.timeoutMs ?? 6000;
  return async (input, init) => {
    // Isi yang bukan teks (stream) tidak dapat dikirim ulang dengan aman.
    const repeatable = init?.body == null || typeof init.body === "string";
    const limit = repeatable ? attempts : 1;
    let lastError: unknown;
    for (let attempt = 1; attempt <= limit; attempt++) {
      const timeout = AbortSignal.timeout(timeoutMs);
      const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
      try { return await base(input, { ...init, signal }); }
      catch (error) {
        lastError = error;
        if (init?.signal?.aborted) break;
      }
    }
    throw lastError;
  };
}
