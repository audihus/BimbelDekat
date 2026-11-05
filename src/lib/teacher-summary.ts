import { contains,type TeacherFilters } from "./directory";
import type { Area,ProfileDocument } from "./domain/types";

export interface TeacherSummary {
  home: string;                 // tempat tinggal guru
  fromPrice: string | null;     // tarif termurah per pertemuan (rupiah bulat, string)
  subjects: string[];           // pelajaran unik, urut kemunculan
  levels: string[];
  modes: ("online" | "offline")[];
  areas: string[];              // daerah yang didatangi (kosong bila tidak ada les tatap muka)
  matchedArea: string | null;   // daerah yang cocok dengan filter pencarian wilayah, bila ada
}

const unique = <T,>(items: T[]) => [...new Set(items)];
const areaLabel = (a: Area) => [a.district, a.regency].filter(Boolean).join(", ") || a.province;

// Ringkasan untuk kartu guru. Pencocokan daerah memakai aturan yang sama dengan pencarian (`contains`),
// supaya kartu menunjukkan daerah yang membuat guru ini muncul, bukan tempat tinggalnya.
export function teacherSummary(doc: ProfileDocument, filters: TeacherFilters): TeacherSummary {
  const offline = doc.offers.some(o => o.mode === "offline");
  const prices = doc.offers.map(o => BigInt(o.price || "0"));
  const cheapest = prices.length ? prices.reduce((a, b) => (b < a ? b : a)) : null;
  const filtering = Boolean(filters.province || filters.regency || filters.district);
  const matched = offline && filtering ? doc.areas.find(a => contains(a.province, filters.province) && contains(a.regency, filters.regency) && contains(a.district, filters.district)) : undefined;
  return {
    home: doc.regency,
    fromPrice: cheapest === null ? null : cheapest.toString(),
    subjects: unique(doc.offers.map(o => o.subject).filter(Boolean)),
    levels: unique(doc.offers.map(o => o.level)),
    modes: (["online", "offline"] as const).filter(m => doc.offers.some(o => o.mode === m)),
    areas: offline ? doc.areas.map(areaLabel) : [],
    matchedArea: matched ? areaLabel(matched) : null
  };
}
