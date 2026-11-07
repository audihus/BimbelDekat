import { PHOTO_MAX_BYTES } from "./jpeg";

// Hanya dipakai di browser. Memotong foto jadi persegi dari tengah, memperkecilnya, dan menyimpannya sebagai JPEG.
// Menggambar ulang di kanvas juga membuang EXIF (lokasi, nama kamera) dari foto asli. Server tetap memeriksa ulang.
const SIDE = 480;

export async function squareJpeg(file: File): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error("Pilih foto berformat JPG, PNG, atau WebP.");
  if (file.size > 15_000_000) throw new Error("Foto terlalu besar. Pilih foto di bawah 15 MB.");
  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file, { imageOrientation: "from-image" }); }
  catch { throw new Error("Foto tidak dapat dibaca. Pilih foto lain."); }
  const edge = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIDE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Browser ini belum mendukung pengolahan foto.");
  context.fillStyle = "#fff";   // PNG transparan menjadi latar putih, bukan hitam
  context.fillRect(0, 0, SIDE, SIDE);
  context.drawImage(bitmap, (bitmap.width - edge) / 2, (bitmap.height - edge) / 2, edge, edge, 0, 0, SIDE, SIDE);
  bitmap.close();
  for (const quality of [0.88, 0.8, 0.7, 0.6, 0.5]) {
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
    if (blob && blob.size <= PHOTO_MAX_BYTES - 10_000) return blob;
  }
  throw new Error("Foto terlalu besar. Pilih foto lain.");
}
