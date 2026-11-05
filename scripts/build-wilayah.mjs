// Membangun data wilayah dari dump SQL cahyadsn/wilayah (MIT; kode wilayah sesuai Kepmendagri).
// Pemakaian:  node scripts/build-wilayah.mjs <jalur ke wilayah.sql>
// Unduh dari https://github.com/cahyadsn/wilayah/blob/master/db/wilayah.sql, jalankan ulang bila ada pemekaran.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";

const source = process.argv[2];
if (!source) throw new Error("Sebutkan jalur berkas wilayah.sql.");
const sql = readFileSync(source, "utf8");

const provinces = new Map(), regencies = new Map(), districts = new Map();
for (const [, code, name] of sql.matchAll(/\('([0-9.]+)','([^']*)'\)/g)) {
  const level = code.split(".").length;
  if (level === 1) provinces.set(code, name);
  else if (level === 2) regencies.set(code, name);
  else if (level === 3) districts.set(code, name);
}
if (provinces.size !== 38 || regencies.size !== 514 || districts.size < 7000) {
  throw new Error(`Jumlah tidak sesuai harapan (provinsi ${provinces.size}, kabupaten/kota ${regencies.size}, kecamatan ${districts.size}). Periksa sumber sebelum memakainya.`);
}

const index = [...provinces].map(([code, name]) => ({
  code, name,
  regencies: [...regencies].filter(([c]) => c.startsWith(code + ".")).map(([c, n]) => ({ code: c, name: n }))
}));
rmSync("src/data/kecamatan", { recursive: true, force: true });
mkdirSync("src/data/kecamatan", { recursive: true });
writeFileSync("src/data/wilayah.json", JSON.stringify({ provinces: index }));
for (const province of index) {
  const byRegency = {};
  for (const regency of province.regencies) {
    byRegency[regency.code] = [...districts].filter(([c]) => c.startsWith(regency.code + ".")).map(([, n]) => n);
  }
  writeFileSync(`src/data/kecamatan/${province.code}.json`, JSON.stringify(byRegency));
}
console.log(`Wilayah siap: ${provinces.size} provinsi, ${regencies.size} kabupaten/kota, ${districts.size} kecamatan.`);
