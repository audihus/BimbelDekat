import { strict as assert } from "node:assert";
import { randomUUID, createHash } from "node:crypto";
import { spawn } from "node:child_process";

const url = process.env.TEST_DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:55322/postgres";
if (!["127.0.0.1", "localhost", "[::1]"].includes(new URL(url).hostname)) {
  throw new Error("Tes database hanya boleh berjalan pada PostgreSQL lokal.");
}
// Jalankan SQL pada PostgreSQL Supabase yang nyata. Docker exec menghindari
// ketidakstabilan penerusan port TCP Docker Desktop pada host Windows.
function literal(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return `ARRAY[${value.map(literal).join(",")}]`;
  if (typeof value === "number") { assert(Number.isFinite(value)); return String(value); }
  return `'${String(value).replaceAll("'", "''")}'`;
}
function bind(sql, parameters = []) { return sql.replace(/\$(\d+)/g, (_, index) => literal(parameters[Number(index)-1])); }
function sql(sql) {
  return new Promise((resolve, reject) => {
    const child=spawn("docker",["exec","-i","supabase_db_les-privat-local","psql","-X","-qAt","-v","ON_ERROR_STOP=1","-U","postgres","-d","postgres"],{windowsHide:true,timeout:20000});
    let stdout="",stderr="";
    child.stdout.on("data",chunk=>stdout+=chunk);
    child.stderr.on("data",chunk=>stderr+=chunk);
    child.once("error",reject);
    child.once("close",code=>code===0 ? resolve(stdout.trim()) : reject(new Error(stderr.trim() || "SQL test process failed.")));
    child.stdin.end(`set statement_timeout='15s';\n${sql}`);
  });
}
const pool = { query: (query, parameters=[]) => sql(bind(query,parameters)), end: async()=>{} };
// Empat pertama dipakai tes awal; lima berikutnya khusus siklus akun dan moderasi (carl, dewi, eko, fran, admin2).
const actors = ["teacher", "teacher", "admin", "teacher", "teacher", "teacher", "teacher", "teacher", "admin"].map(role => ({ id: randomUUID(), session: randomUUID(), role }));
let count = 0;
async function check(name, test) {
  await test();
  count++;
  console.log(`PASS ${name}`);
}
async function queryAs(actor, query, parameters = []) {
  const claims=JSON.stringify(actor ? {sub:actor.id,role:"authenticated",session_id:actor.session} : {role:"anon"});
  const statement=bind(query,parameters);
  const isSelect=/^\s*select\b/i.test(statement);
  const output=await sql(`begin; set local role ${actor?"authenticated":"anon"}; set local "request.jwt.claims"=${literal(claims)};
    ${isSelect ? `select coalesce(json_agg(row_to_json(test_rows)),'[]') from (${statement}) test_rows` : statement}; commit;`);
  return isSelect ? JSON.parse(output) : [];
}
async function command(actor, action, payload, request = randomUUID()) {
  return (await queryAs(actor, "select public.app_command($1, $2::jsonb, $3::uuid) as result", [action, JSON.stringify(payload), request]))[0].result;
}
async function snapshot(actor) { return (await queryAs(actor, "select public.workspace_snapshot() as result"))[0].result; }

try {
  for (const actor of actors) {
    await pool.query(`insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at)
      values ($1, $2, now(), '{"display_name":"Akun tes"}', '{"provider":"email","providers":["email"]}', now(), now())`, [actor.id, `${actor.id}@example.test`]);
    await pool.query("insert into auth.sessions (id, user_id, created_at, updated_at) values ($1, $2, now(), now())", [actor.session, actor.id]);
  }
  const [rina, budi, admin, expired] = actors;
  // Metadata akun dari browser tidak boleh memberi hak admin. Hanya fixture lokal ini yang dinaikkan melalui SQL.
  const request = randomUUID();
  let student, pack, lesson;
  await check("buat murid dan pengiriman ulang tidak menggandakan catatan", async () => {
    const payload = { name: "Andi", level: "SD", source: "existing" };
    student = await command(rina, "student.create", payload, request);
    const repeated = await command(rina, "student.create", payload, request);
    assert.equal(student.id, repeated.id);
    assert.equal((await snapshot(rina)).students.length, 1);
    await assert.rejects(command(rina, "student.create", { ...payload, name: "Bukan Andi" }, request));
  });
  await check("guru lain dan admin tidak memperoleh catatan privat", async () => {
    assert.equal((await snapshot(budi)).students.length, 0);
    await assert.rejects(command(budi, "student.update", { id: student.id, name: "Dicoba diubah", level: "SD" }));
    await pool.query("update public.accounts set role = 'admin' where id = $1", [admin.id]);
    await assert.rejects(command(admin, "student.update", { id: student.id, name: "Admin", level: "SD" }));
    const rows = await queryAs(budi, "select id from public.students where id = $1", [student.id]);
    assert.equal(rows.length, 0);
    await assert.rejects(queryAs(rina, "update public.students set name = 'Bypass' where id = $1", [student.id]));
  });
  await check("paket memisahkan pemakaian pembukaan", async () => {
    pack = await command(rina, "package.create", { student_id: student.id, name: "Matematika", quota: 8, opening_used: 3, agreed_price: "400000" });
    assert.equal((await snapshot(rina)).packages[0].remaining, 5);
  });
  await check("jadwal bertabrakan ditolak dan jadwal bersebelahan diterima", async () => {
    lesson = await command(rina, "lesson.create", { package_id: pack.id, starts_at: "2030-01-01T01:00:00Z", ends_at: "2030-01-01T02:00:00Z", mode: "online" });
    await assert.rejects(command(rina, "lesson.create", { package_id: pack.id, starts_at: "2030-01-01T01:30:00Z", ends_at: "2030-01-01T02:30:00Z", mode: "online" }));
    await command(rina, "lesson.create", { package_id: pack.id, starts_at: "2030-01-01T02:00:00Z", ends_at: "2030-01-01T03:00:00Z", mode: "online" });
  });
  await check("dua permintaan selesai bersamaan hanya memakai satu jatah", async () => {
    const key = randomUUID();
    await Promise.all([command(rina, "lesson.finish", { id: lesson.id }, key), command(rina, "lesson.finish", { id: lesson.id }, key)]);
    await command(rina, "lesson.finish", { id: lesson.id });
    assert.equal((await snapshot(rina)).packages[0].remaining, 4);
  });
  await check("batal dengan jatah bukan les selesai dan memerlukan alasan", async () => {
    const next = (await snapshot(rina)).lessons.find(item => item.status === "scheduled");
    await assert.rejects(command(rina, "lesson.cancel", { id: next.id, charged: true, cancelled_by: "teacher", reason: "Guru berhalangan" }));
    await assert.rejects(command(rina, "lesson.cancel", { id: next.id, charged: true, cancelled_by: "guardian", reason: "" }));
    await command(rina, "lesson.cancel", { id: next.id, charged: true, cancelled_by: "guardian", reason: "Disepakati wali" });
    const state = await snapshot(rina);
    assert.equal(state.packages[0].remaining, 3);
    assert.equal(state.lessons.filter(item => item.status === "completed").length, 1);
  });
  await check("pembayaran berlebih dan refund terpisah serta idempoten", async () => {
    const payment = { package_id: pack.id, amount: "450000", kind: "payment", reason: "Transfer manual" };
    const key = randomUUID();
    await Promise.all([command(rina, "payment.record", payment, key), command(rina, "payment.record", payment, key)]);
    await command(rina, "payment.record", { package_id: pack.id, amount: "20000", kind: "refund", reason: "Pengembalian kelebihan" });
    const state = await snapshot(rina);
    assert.equal(state.payments.length, 2);
    assert.equal(state.packages[0].received, "430000");
    assert.equal(state.packages[0].overpaid, "30000");
    assert.equal(state.packages[0].due, "0");
  });
  await check("penutupan mempertahankan sisa belum dipakai dan uang", async () => {
    await command(rina, "package.close", { id: pack.id, reason: "Wali setuju berhenti" });
    const state = await snapshot(rina);
    assert.equal(state.packages[0].remaining, 3);
    assert.equal(state.packages[0].received, "430000");
    await assert.rejects(command(rina, "lesson.create", { package_id: pack.id, starts_at: "2030-02-01T01:00:00Z", ends_at: "2030-02-01T02:00:00Z", mode: "online" }));
  });
  await check("tautan wali satu relasi dicabut saat arsip dan tidak pulih saat reaktivasi", async () => {
    const token = randomUUID() + randomUUID();
    await command(rina, "guardian.create", { student_id: student.id, token_hash: createHash("sha256").update(token).digest("hex") });
    const summary = (await queryAs(null, "select public.guardian_summary($1) as result", [token]))[0].result;
    assert.equal(summary.student.name, "Andi");
    assert.equal(summary.packages.length, 1);
    await command(rina, "student.archive", { id: student.id, archived: true });
    assert.equal((await queryAs(null, "select public.guardian_summary($1) as result", [token]))[0].result, null);
    await command(rina, "student.archive", { id: student.id, archived: false });
    assert.equal((await queryAs(null, "select public.guardian_summary($1) as result", [token]))[0].result, null);
  });
  await check("batas login dan pencabutan diperiksa di database", async () => {
    await pool.query("update auth.sessions set created_at = now() - interval '7 days 1 minute' where id = $1", [expired.session]);
    await assert.rejects(snapshot(expired));
    await pool.query("update auth.sessions set created_at = now() - interval '8 hours 1 minute' where id = $1", [admin.session]);
    await assert.rejects(queryAs(admin, "select public.account_context()"));
    await pool.query("delete from auth.sessions where id = $1", [budi.session]);
    await assert.rejects(snapshot(budi));
  });
  await check("masa tunggu penghapusan menutup akses operasional", async () => {
    await pool.query("update public.accounts set status = 'deletion_pending', deletion_requested_at = now() where id = $1", [rina.id]);
    await assert.rejects(snapshot(rina));
    await assert.rejects(command(rina, "student.create", { name: "Murid baru", level: "SD" }));
  });
  await check("pembatas percobaan memblokir di batas, pulih setelah jendela, dan tidak terbuka bagi pengguna biasa", async () => {
    const hash = () => createHash("sha256").update(randomUUID()).digest("hex");
    const rate = async (key, record = true) => JSON.parse(await pool.query("select public.rate_check('test.dbcheck', $1, 3, 60, $2::boolean)", [key, record]));
    const key = hash();
    for (let i = 0; i < 3; i++) assert.equal((await rate(key)).allowed, true);
    const blocked = await rate(key);
    assert.equal(blocked.allowed, false);
    assert.ok(blocked.retry_after >= 1 && blocked.retry_after <= 60);
    assert.equal((await rate(hash())).allowed, true, "kunci lain tidak terpengaruh");
    // Hanya memeriksa tidak menghabiskan jatah (dipakai login: hanya percobaan gagal yang dihitung).
    const peek = hash();
    for (let i = 0; i < 5; i++) assert.equal((await rate(peek, false)).allowed, true);
    // Setelah jendela berlalu, percobaan dihitung ulang.
    await pool.query("update private.rate_events set at = at - interval '2 minutes' where bucket = 'test.dbcheck' and key_hash = $1", [key]);
    assert.equal((await rate(key)).allowed, true);
    // Guru dan pengunjung tidak boleh memanggilnya langsung.
    await assert.rejects(queryAs(rina, "select public.rate_check('test.dbcheck', $1, 3, 60, true)", [hash()]));
    await assert.rejects(queryAs(null, "select public.rate_check('test.dbcheck', $1, 3, 60, true)", [hash()]));
  });
  const [carl, dewi, eko, fran, admin2] = actors.slice(4);
  await pool.query("update public.accounts set role = 'admin' where id = $1", [admin2.id]);
  const doc = name => ({ name, about: "Tentang", phone: "6281234567890", province: "Jawa Barat", regency: "Kota Bekasi", areas: [], offers: [{ subject: "Matematika", level: "SD", mode: "online", duration: 60, price: "75000" }] });
  const rpc = (actor, call, parameters = []) => queryAs(actor, `select ${call} as result`, parameters).then(rows => rows[0].result);
  const moderate = (actor, id, decision, reason) => rpc(actor, "(public.moderate_profile($1::uuid, $2, $3))::text", [id, decision, reason]);
  const listed = async name => (await rpc(null, "public.public_teachers()")).some(item => item.document.name === name);
  const profileOf = async actor => (await snapshot(actor)).profile;

  await check("permintaan hapus akun menyembunyikan profil, mencabut tautan, menutup operasi; batal hanya memulihkan akses", async () => {
    const pupil = await command(carl, "student.create", { name: "Murid Carl", level: "SD" });
    const token = randomUUID() + randomUUID();
    await command(carl, "guardian.create", { student_id: pupil.id, token_hash: createHash("sha256").update(token).digest("hex") });
    await command(carl, "profile.submit", { document: doc("Carl Publik") });
    await moderate(admin2, (await profileOf(carl)).id, "approve", "ok");
    assert.equal(await listed("Carl Publik"), true);
    assert.notEqual((await rpc(null, "public.guardian_summary($1)", [token])), null);

    await assert.rejects(rpc(admin2, "public.request_account_deletion()"), "admin tidak memakai jalur ini");
    await assert.rejects(rpc(null, "public.request_account_deletion()"));
    await rpc(carl, "public.request_account_deletion()");
    assert.equal(await listed("Carl Publik"), false, "profil langsung hilang dari direktori");
    assert.equal(await rpc(null, "public.guardian_summary($1)", [token]), null, "tautan wali langsung mati");
    await assert.rejects(command(carl, "student.create", { name: "Baru", level: "SD" }), "tidak boleh menambah catatan");
    await assert.rejects(snapshot(carl));
    assert.equal((await rpc(carl, "public.account_context()")).status, "deletion_pending", "tetap bisa membuka halaman akun");

    await rpc(carl, "public.cancel_account_deletion()");
    assert.equal((await rpc(carl, "public.account_context()")).status, "active");
    assert.equal((await snapshot(carl)).students.length, 1, "data utuh setelah batal");
    assert.equal((await profileOf(carl)).visible, false, "profil tidak otomatis terbit lagi");
    assert.equal(await rpc(null, "public.guardian_summary($1)", [token]), null, "tautan lama tetap mati");
    assert.equal(await listed("Carl Publik"), false);
    await assert.rejects(rpc(carl, "public.cancel_account_deletion()"), "tidak ada permintaan untuk dibatalkan");
  });

  await check("penghapusan terjadwal hanya menyentuh yang lewat 7 hari dan menghapus seluruh data", async () => {
    const pupil = await command(eko, "student.create", { name: "Murid Eko", level: "SD" });
    const space = await pool.query("select id from public.workspaces where owner_id = $1", [eko.id]);
    await rpc(eko, "public.request_account_deletion()");
    await pool.query("update public.accounts set deletion_requested_at = now() - interval '6 days' where id = $1", [eko.id]);
    await pool.query("select public.process_account_deletions()");
    assert.equal(await pool.query("select count(*) from auth.users where id = $1", [eko.id]), "1", "6 hari belum boleh dihapus");
    await pool.query("update public.accounts set deletion_requested_at = now() - interval '8 days' where id = $1", [eko.id]);
    await assert.rejects(rpc(eko, "public.cancel_account_deletion()"), "masa batal sudah lewat");
    assert.ok(Number(await pool.query("select public.process_account_deletions()")) >= 1);
    assert.equal(await pool.query("select count(*) from auth.users where id = $1", [eko.id]), "0");
    for (const table of ["accounts", "workspaces"]) assert.equal(await pool.query(`select count(*) from public.${table} where ${table === "accounts" ? "id" : "owner_id"} = $1`, [eko.id]), "0");
    assert.equal(await pool.query("select count(*) from public.students where id = $1", [pupil.id]), "0", "catatan murid ikut terhapus");
    assert.equal(await pool.query("select count(*) from public.workspaces where id = $1", [space]), "0");
    assert.equal(await pool.query("select count(*) from auth.users where id = $1", [rina.id]), "1", "akun yang baru meminta hapus tidak tersentuh");
    await assert.rejects(queryAs(dewi, "select public.process_account_deletions()"));
    await assert.rejects(queryAs(null, "select public.process_account_deletions()"));
  });

  await check("ekspor hanya memuat data sendiri, lengkap dengan riwayat, tanpa hash tautan", async () => {
    const mine = await command(dewi, "student.create", { name: "Murid Dewi", level: "SD", notes: "Catatan Dewi" });
    const hash = createHash("sha256").update(randomUUID() + randomUUID()).digest("hex");
    await command(dewi, "guardian.create", { student_id: mine.id, token_hash: hash });
    const first = await rpc(dewi, "public.export_workspace()");
    assert.equal(first.students.length, 1);
    assert.equal(first.students[0].name, "Murid Dewi");
    assert.equal(first.account.email, `${dewi.id}@example.test`);
    const text = JSON.stringify(first);
    assert.ok(!text.includes(hash), "hash tautan tidak boleh ikut");
    assert.ok(!text.includes("Murid Carl") && !text.includes("Murid Eko") && !text.includes("Murid Andi"), "data guru lain tidak boleh ikut");
    const second = await rpc(dewi, "public.export_workspace()");
    assert.ok(second.audit_events.some(event => event.action === "account.exported"), "ekspor sebelumnya tercatat");
    await assert.rejects(rpc(null, "public.export_workspace()"));
    // Saat menunggu penghapusan, ekspor tetap boleh (PRD Q31).
    assert.equal((await rpc(carl, "public.export_workspace()")).students.length, 1);
    await rpc(carl, "public.request_account_deletion()");
    assert.equal((await rpc(carl, "public.export_workspace()")).students.length, 1);
  });

  await check("peristiwa akun hanya dari daftar putih dan masuk ke riwayat", async () => {
    await rpc(dewi, "(public.record_account_event($1))::text", ["account.password_changed"]);
    await assert.rejects(rpc(dewi, "(public.record_account_event($1))::text", ["account.diretas"]));
    assert.ok((await rpc(dewi, "public.export_workspace()")).audit_events.some(event => event.action === "account.password_changed"));
  });

  await check("moderasi: hanya admin, setujui hanya untuk pengajuan, alasan wajib, sembunyi dapat dibatalkan", async () => {
    await command(fran, "profile.submit", { document: doc("Fran Publik") });
    const id = (await profileOf(fran)).id;
    await assert.rejects(moderate(rina, id, "approve", "ok"), "guru bukan admin");
    await assert.rejects(moderate(null, id, "approve", "ok"));
    await moderate(admin2, id, "approve", "ok");
    assert.equal(await listed("Fran Publik"), true);
    await assert.rejects(moderate(admin2, id, "approve", "ok"), "tidak ada pengajuan menunggu");
    await assert.rejects(moderate(admin2, id, "hide", ""), "alasan wajib");
    await moderate(admin2, id, "hide", "Melanggar aturan");
    assert.equal(await listed("Fran Publik"), false);
    await assert.rejects(command(fran, "profile.visibility", { visible: true }), "guru tidak bisa membuka sendiri");
    await assert.rejects(moderate(admin2, id, "unhide", ""), "alasan wajib");
    await moderate(admin2, id, "unhide", "Sudah diperbaiki");
    assert.equal(await listed("Fran Publik"), true);
    await assert.rejects(moderate(admin2, id, "unhide", "Lagi"), "tidak sedang disembunyikan");
    await assert.rejects(moderate(admin2, id, "tak-dikenal", "x"));
    assert.deepEqual(await queryAs(admin2, "select id from public.students"), [], "admin tetap tidak membaca catatan privat guru");
  });
  await check("statistik iklan: hanya server yang mencatat, hanya profil tayang yang dihitung, guru hanya melihat angkanya sendiri", async () => {
    const asService = statement => sql(`begin; set local role service_role; ${statement}; commit;`);
    const record = (id, kind) => asService(`select public.record_ad_event(${literal(id)}::uuid, ${literal(kind)})`);
    const profileIdOf = actor => pool.query("select p.id from public.teacher_profiles p join public.workspaces w on w.id = p.workspace_id where w.owner_id = $1", [actor.id]);
    const franId = await profileIdOf(fran), carlId = await profileIdOf(carl);   // fran tayang; carl tersembunyi sejak minta hapus akun
    for (let i = 0; i < 3; i++) await record(franId, "view");
    await record(franId, "wa_click");
    await record(carlId, "view");                  // profil tidak tayang: diabaikan, tidak error
    const ghostId = randomUUID();
    await record(ghostId, "view");                 // ID ngawur: diabaikan, tidak error
    await assert.rejects(record(franId, "bukan-jenis"), "jenis peristiwa harus dikenal");
    assert.equal(await pool.query("select count(*) from public.ad_stats where profile_id = any($1::uuid[])", [[carlId, ghostId]]), "0", "tidak ada baris untuk profil tak tayang atau ID ngawur");
    const mine = await rpc(fran, "public.ad_stats_summary()");
    assert.deepEqual([mine.last7.views, mine.last7.wa_clicks, mine.last30.views], [3, 1, 3]);
    assert.equal(mine.days.length, 7);
    assert.equal(mine.days.at(-1).views, 3, "hari ini ada di ujung deret");
    await assert.rejects(rpc(carl, "public.ad_stats_summary()"), "akun menunggu penghapusan tidak membuka statistik (carl sedang menunggu sejak tes ekspor)");
    assert.equal((await rpc(admin2, "public.ad_stats_summary()")).last7.views, 0, "admin tidak mendapat jalur ke angka guru");
    await assert.rejects(rpc(null, "public.ad_stats_summary()"), "pengunjung tidak punya sesi");
    await assert.rejects(rpc(rina, "public.record_ad_event($1::uuid, 'view')", [franId]), "guru tidak boleh menambah angka sendiri/orang lain");
    await assert.rejects(rpc(null, "public.record_ad_event($1::uuid, 'view')", [franId]), "pengunjung tidak boleh memanggil langsung");
    await assert.rejects(queryAs(fran, "select * from public.ad_stats"), "tabel tidak terbuka langsung");
  });
  await check("foto profil: hanya milik sendiri yang boleh dipakai, tayang hanya setelah disetujui, tertutup bila disembunyikan", async () => {
    const photoOf = async (actor, kind, id) => { const value = await rpc(actor, `public.${kind}_profile_photo($1::uuid)`, [id]); return value === null ? null : value.replace(/\s/g, ""); };   // encode(..., 'base64') menyisipkan baris baru tiap 76 huruf
    const photo = Buffer.alloc(2000, 7).toString("base64");                 // isi tidak diperiksa SQL; keabsahan JPEG dijaga src/lib/jpeg.ts
    const franPhoto = await rpc(fran, "public.save_profile_photo($1)", [photo]);
    const dewiPhoto = await rpc(dewi, "public.save_profile_photo($1)", [photo]);
    await assert.rejects(rpc(null, "public.save_profile_photo($1)", [photo]), "pengunjung tidak boleh mengunggah");
    await assert.rejects(rpc(admin2, "public.save_profile_photo($1)", [photo]), "pengelola bukan guru");
    await assert.rejects(rpc(fran, "public.save_profile_photo($1)", [Buffer.alloc(150001, 1).toString("base64")]), "terlalu besar");
    await assert.rejects(rpc(fran, "public.save_profile_photo($1)", ["***bukan base64***"]), "bukan base64");
    await assert.rejects(queryAs(fran, "select * from private.profile_photos"), "tabel foto tidak terbuka langsung");
    // Profil tidak boleh menunjuk foto milik guru lain atau ID ngawur, apa pun jalur penulisnya.
    await assert.rejects(command(fran, "profile.save", { document: { ...doc("Fran Publik"), photo: dewiPhoto } }), "foto milik guru lain");
    await assert.rejects(command(fran, "profile.save", { document: { ...doc("Fran Publik"), photo: randomUUID() } }), "foto yang tidak ada");
    await assert.rejects(command(fran, "profile.save", { document: { ...doc("Fran Publik"), photo: "bukan-uuid" } }), "format salah");
    // Diajukan, tetapi profil lama masih yang tayang: foto belum boleh terlihat publik.
    await command(fran, "profile.submit", { document: { ...doc("Fran Publik"), photo: franPhoto } });
    assert.equal(await photoOf(null, "public", franPhoto), null, "belum disetujui");
    assert.equal(await photoOf(fran, "private", franPhoto), photo, "pemilik melihat draf");
    assert.equal(await photoOf(admin2, "private", franPhoto), photo, "pengelola melihat foto yang ditinjau");
    assert.equal(await photoOf(dewi, "private", franPhoto), null, "guru lain tidak melihat draf");
    assert.equal(await photoOf(dewi, "private", dewiPhoto), photo, "guru melihat fotonya sendiri sebelum dipakai");
    assert.equal(await photoOf(admin2, "private", dewiPhoto), null, "pengelola tidak melihat foto yang belum dipakai profil mana pun");
    await moderate(admin2, (await profileOf(fran)).id, "approve", "ok");
    assert.equal(await photoOf(null, "public", franPhoto), photo, "tayang setelah disetujui");
    assert.equal((await rpc(null, "public.public_teachers()")).find(item => item.document.name === "Fran Publik").document.photo, franPhoto);
    assert.equal(await photoOf(null, "public", dewiPhoto), null, "foto yang tidak dipakai profil tayang tidak terbuka");
    await moderate(admin2, (await profileOf(fran)).id, "hide", "Uji sembunyi");
    assert.equal(await photoOf(null, "public", franPhoto), null, "tertutup saat profil disembunyikan");
    await moderate(admin2, (await profileOf(fran)).id, "unhide", "Pulih");
    assert.equal(await photoOf(null, "public", franPhoto), photo);
    // Menghapus foto dari draf tidak mengubah profil tayang sampai disetujui lagi.
    await command(fran, "profile.submit", { document: doc("Fran Publik") });
    assert.equal(await photoOf(null, "public", franPhoto), photo, "profil tayang tetap memakai foto lama selama perubahan ditinjau");
  });
  console.log(`\n${count} database checks passed.`);
} catch (error) {
  console.error(`FAIL database: ${error.message}`);
  process.exitCode = 1;
} finally {
  try { await pool.query("delete from private.rate_events where bucket = 'test.dbcheck'"); await pool.query("delete from auth.users where id = any($1::uuid[])", [actors.map(actor => actor.id)]); }
  catch { /* On a connection failure there may be nothing to clean up. */ }
  await pool.end();
}
