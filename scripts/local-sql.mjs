import { readFileSync } from "node:fs";
import { resolve, relative } from "node:path";
import { spawnSync } from "node:child_process";

const file = resolve(process.argv[2] ?? "");
const location = relative(resolve("supabase"), file);
if (!location || location.startsWith("..") || !file.endsWith(".sql")) throw new Error("Pilih berkas SQL dalam folder supabase proyek ini.");
const result=spawnSync("docker",["exec","-i","supabase_db_les-privat-local","psql","-X","-v","ON_ERROR_STOP=1","-U","postgres","-d","postgres"],{input:readFileSync(file,"utf8"),encoding:"utf8",timeout:30000,windowsHide:true});
if(result.status!==0) throw new Error(result.stderr || "SQL lokal gagal diterapkan.");
console.log("SQL lokal diterapkan.");
