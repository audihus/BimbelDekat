// Pemeriksa foto profil di sisi server. Tidak percaya pada apa pun dari browser: berkas harus benar-benar JPEG,
// ukurannya wajar, dan hanya bagian gambar yang disimpan. Penanda APPn (EXIF, termasuk lokasi GPS dan nama kamera)
// dan komentar dibuang, juga semua data setelah penanda akhir. Tidak ada pustaka gambar yang dipakai: yang dibaca hanya struktur segmen.
export class JpegError extends Error {}
export const PHOTO_MAX_BYTES = 150_000;       // batas setelah dibersihkan; juga dijaga oleh basis data
export const PHOTO_MIN_SIDE = 64;
export const PHOTO_MAX_SIDE = 1600;
const INPUT_MAX_BYTES = 1_000_000;

const SOF_SUPPORTED = new Set([0xc0, 0xc2]);              // baseline dan progresif, 8 bit
const KEEP = new Set([0xdb, 0xc4, 0xdd, 0xda]);            // tabel kuantisasi, tabel Huffman, interval restart, awal pemindaian

export function sanitizeJpeg(input: Uint8Array): { data: Uint8Array; width: number; height: number } {
  if (input.length < 4 || input.length > INPUT_MAX_BYTES) throw new JpegError("Foto tidak dapat dibaca atau terlalu besar.");
  if (input[0] !== 0xff || input[1] !== 0xd8) throw new JpegError("Foto harus berformat JPEG.");
  const out: number[][] = [[0xff, 0xd8]];
  let pos = 2, size = 2, width = 0, height = 0, scanning = false, ended = false;

  while (pos < input.length) {
    if (input[pos] !== 0xff) {
      if (!scanning) throw new JpegError("Berkas foto rusak.");
      let end = pos;
      while (end < input.length && input[end] !== 0xff) end++;     // data piksel: disalin apa adanya
      out.push(Array.from(input.subarray(pos, end)));size += end - pos;pos = end;continue;
    }
    while (pos + 1 < input.length && input[pos + 1] === 0xff) pos++;   // byte pengisi
    if (pos + 1 >= input.length) throw new JpegError("Berkas foto terpotong.");
    const marker = input[pos + 1];
    if (marker === 0x00 || (marker >= 0xd0 && marker <= 0xd7)) {            // FF00 (FF yang disisipkan) dan RST hanya sah di dalam data piksel
      if (!scanning) throw new JpegError("Berkas foto rusak.");
      out.push([0xff, marker]);size += 2;pos += 2;continue;
    }
    if (marker === 0xd9) { out.push([0xff, 0xd9]);size += 2;ended = true;break; }   // sisa berkas setelah ini dibuang
    if (marker === 0xd8 || marker === 0x01) throw new JpegError("Berkas foto rusak.");
    if (pos + 3 >= input.length) throw new JpegError("Berkas foto terpotong.");
    const length = (input[pos + 2] << 8) | input[pos + 3];
    if (length < 2 || pos + 2 + length > input.length) throw new JpegError("Berkas foto terpotong.");
    const segment = input.subarray(pos, pos + 2 + length);

    if ((marker >= 0xe0 && marker <= 0xef) || marker === 0xfe) { pos += 2 + length;continue; }   // EXIF, JFIF, ICC, komentar: dibuang
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      if (!SOF_SUPPORTED.has(marker)) throw new JpegError("Jenis JPEG ini belum didukung. Gunakan foto biasa.");
      if (length < 8 || (width && height)) throw new JpegError("Berkas foto rusak.");
      const precision = input[pos + 4], components = input[pos + 9];
      height = (input[pos + 5] << 8) | input[pos + 6];
      width = (input[pos + 7] << 8) | input[pos + 8];
      if (precision !== 8 || (components !== 1 && components !== 3)) throw new JpegError("Jenis JPEG ini belum didukung. Gunakan foto biasa.");
    } else if (!KEEP.has(marker)) {
      throw new JpegError("Berkas foto tidak dikenali.");
    }
    if (marker === 0xda) { if (!width) throw new JpegError("Berkas foto rusak."); scanning = true; }
    out.push(Array.from(segment));size += segment.length;pos += 2 + length;
    if (size > PHOTO_MAX_BYTES * 4) throw new JpegError("Foto terlalu besar.");
  }

  if (!ended || !scanning) throw new JpegError("Berkas foto terpotong.");
  if (width < PHOTO_MIN_SIDE || height < PHOTO_MIN_SIDE || width > PHOTO_MAX_SIDE || height > PHOTO_MAX_SIDE) throw new JpegError("Ukuran foto harus antara 64 dan 1600 piksel.");
  if (size > PHOTO_MAX_BYTES) throw new JpegError("Foto terlalu besar. Pilih foto lain.");
  const data = new Uint8Array(size);
  let at = 0;
  for (const part of out) { data.set(part, at);at += part.length; }
  return { data, width, height };
}
