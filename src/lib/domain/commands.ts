import { z } from "zod";

const id = z.uuid();
const text = z.string().trim().min(1).max(150);
const optionalText = z.string().trim().max(5000).default("");
const money = z.string().regex(/^\d{1,30}$/, "Gunakan nominal rupiah bulat tanpa titik atau koma.");
const reason = z.string().trim().min(1, "Tuliskan alasannya.").max(1000);
const datetime = z.iso.datetime({ offset: true });
const student = { name: text, level: z.string().trim().min(1).max(50), guardian_phone: z.string().trim().max(30).default(""), address: optionalText, notes: optionalText };

export const offerSchema = z.strictObject({ subject: text, level: text, mode: z.enum(["online", "offline"]), duration: z.number().int().positive(), price: money });
export const areaSchema = z.strictObject({ province: z.string().trim().max(100), regency: z.string().trim().max(100), district: z.string().trim().max(100).default("") });
export const profileSchema = z.strictObject({
  name: z.string().trim().max(150), about: z.string().trim().max(3000), phone: z.string().trim().max(20),
  province: z.string().trim().max(100), regency: z.string().trim().max(100),
  areas: z.array(areaSchema), offers: z.array(offerSchema), photo: z.uuid().optional()
});

const schemas: Record<string, z.ZodType> = {
  "student.create": z.strictObject({ ...student, source: z.enum(["existing", "profile", "search", "other", "unknown"]).default("unknown") }),
  "student.update": z.strictObject({ id, ...student }),
  "student.archive": z.strictObject({ id, archived: z.boolean() }),
  "package.create": z.strictObject({ student_id: id, name: text, quota: z.number().int().positive(), opening_used: z.number().int().nonnegative().default(0), agreed_price: money }).refine(p => p.opening_used <= p.quota, "Pertemuan yang sudah dipakai tidak boleh lebih banyak dari jumlah pertemuan."),
  "package.close": z.strictObject({ id, reason }),
  "package.adjust_quota": z.strictObject({ id, delta: z.number().int().refine(n => n !== 0), reason }),
  "package.adjust_price": z.strictObject({ id, agreed_price: money, reason }),
  "lesson.create": z.strictObject({ package_id: id, starts_at: datetime, ends_at: datetime, mode: z.enum(["online", "offline"]) }).refine(p => Date.parse(p.ends_at) > Date.parse(p.starts_at), "Waktu selesai harus setelah mulai."),
  "lesson.reschedule": z.strictObject({ id, starts_at: datetime, ends_at: datetime, package_id: id.optional() }).refine(p => Date.parse(p.ends_at) > Date.parse(p.starts_at), "Waktu selesai harus setelah mulai."),
  "lesson.finish": z.strictObject({ id }),
  "lesson.cancel": z.strictObject({ id, charged: z.boolean(), cancelled_by: z.enum(["teacher", "guardian"]), reason: optionalText }),
  "lesson.correct": z.strictObject({ id, status: z.enum(["scheduled", "completed", "cancelled", "cancelled_charged"]), cancelled_by: z.enum(["teacher", "guardian"]).optional(), reason }),
  "payment.record": z.strictObject({ package_id: id, amount: z.string().regex(/^-?\d{1,30}$/), kind: z.enum(["payment", "refund", "correction"]), reason: optionalText, paid_at: datetime.optional() }),
  "guardian.create": z.strictObject({ student_id: id }),
  "guardian.revoke": z.strictObject({ id }),
  "profile.save": z.strictObject({ document: profileSchema }),
  "profile.submit": z.strictObject({ document: profileSchema }),
  "profile.accepting": z.strictObject({ accepting: z.boolean() }),
  "profile.visibility": z.strictObject({ visible: z.boolean() }),
  "account.timezone": z.strictObject({ timezone: z.enum(["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"]) })
};

export function parseCommand(action: string, payload: unknown): Record<string, unknown> {
  if (!Object.hasOwn(schemas, action)) throw new Error("Tindakan tidak dikenal.");
  return schemas[action].parse(payload) as Record<string, unknown>;
}
