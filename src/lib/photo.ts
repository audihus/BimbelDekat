// Alamat foto profil. Dokumen profil hanya menyimpan ID foto.
// Foto yang sudah tayang dilayani publik dan boleh di-cache; foto yang belum tayang (draf) hanya untuk pemiliknya dan pengelola.
export const publicPhotoSrc = (id: string) => `/foto/${id}`;
export const draftPhotoSrc = (id: string) => `/api/profil/foto/${id}`;
export const isPhotoId = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export function jpegResponse(base64: string, cache: string): Response {
  const bytes = new Uint8Array(Buffer.from(base64, "base64"));
  return new Response(bytes, { headers: { "Content-Type": "image/jpeg", "Content-Length": String(bytes.length), "Cache-Control": cache, "X-Content-Type-Options": "nosniff", "Content-Disposition": "inline" } });
}
export const photoNotFound = () => new Response("Foto tidak ditemukan.", { status: 404, headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" } });
