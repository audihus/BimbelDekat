import { describe,expect,it } from "vitest";
import { dateKey,groupByDay,monthGrid,monthParam,parseDay,parseMonth,shiftMonth } from "@/lib/calendar";

const lesson=(id:string,starts_at:string)=>({id,starts_at});

describe("monthGrid",()=>{
  it("minggu dimulai Senin dan seluruh sel rapi 7 hari per baris",()=>{
    const grid=monthGrid(2026,11);   // 1 Nov 2026 jatuh pada hari Minggu
    expect(grid.every(week=>week.length===7)).toBe(true);
    expect(grid[0][0].key).toBe("2026-10-26");            // Senin sebelum tanggal 1
    expect(grid[0][6]).toMatchObject({key:"2026-11-01",inMonth:true,day:1});
    expect(grid[0][5].inMonth).toBe(false);
    expect(grid.at(-1)!.at(-1)!.key).toBe("2026-12-06");
  });
  it("bulan yang pas 4 minggu tidak menambah baris kosong, Februari kabisat benar",()=>{
    expect(monthGrid(2027,2)).toHaveLength(4);             // 1 Feb 2027 Senin, 28 hari
    const leap=monthGrid(2028,2).flat().filter(c=>c.inMonth);
    expect(leap).toHaveLength(29);
  });
  it("bulan yang dimulai Senin dan bulan 31 hari yang meluas ke 6 baris",()=>{
    expect(monthGrid(2026,8)).toHaveLength(6);             // 1 Agustus 2026 Sabtu, 31 hari
    expect(monthGrid(2026,5)).toHaveLength(5);             // 1 Mei 2026 Jumat, 31 hari pas lima baris
  });
});

describe("tanggal menurut zona waktu guru",()=>{
  it("pertemuan 23.30 WIB di UTC masih hari yang sama, tetapi 00.30 WITA sudah hari berikutnya",()=>{
    expect(dateKey("2026-11-04T16:30:00Z","Asia/Jakarta")).toBe("2026-11-04");   // 23.30 WIB
    expect(dateKey("2026-11-04T16:30:00Z","Asia/Makassar")).toBe("2026-11-05");  // 00.30 WITA
    expect(dateKey("2026-11-04T15:30:00Z","Asia/Jayapura")).toBe("2026-11-05");  // 00.30 WIT
  });
  it("batas tahun mengikuti zona waktu",()=>{
    expect(dateKey("2026-12-31T17:30:00Z","Asia/Jakarta")).toBe("2027-01-01");
  });
  it("groupByDay mengelompokkan per tanggal setempat dan mengurutkan menurut jam",()=>{
    const g=groupByDay([lesson("b","2026-11-04T16:30:00Z"),lesson("a","2026-11-04T01:00:00Z"),lesson("c","2026-11-05T02:00:00Z")],"Asia/Jakarta");
    expect(Object.keys(g).sort()).toEqual(["2026-11-04","2026-11-05"]);
    expect(g["2026-11-04"].map(l=>l.id)).toEqual(["a","b"]);
  });
});

describe("parameter alamat",()=>{
  const now={year:2026,month:11};
  it("bulan sah dipakai, yang ngawur kembali ke bulan ini",()=>{
    expect(parseMonth("2027-03",now)).toEqual({year:2027,month:3});
    for(const bad of [undefined,"","2027-13","2027-00","abc","2027-3","99999-01","2027-03-01"])expect(parseMonth(bad,now),String(bad)).toEqual(now);
  });
  it("tanggal sah dipakai, yang tidak ada di kalender ditolak",()=>{
    expect(parseDay("2026-11-12")).toBe("2026-11-12");
    for(const bad of [undefined,"","2026-02-30","2026-13-01","12-11-2026","2026-11-1"])expect(parseDay(bad),String(bad)).toBeNull();
  });
  it("pindah bulan melewati batas tahun",()=>{
    expect(shiftMonth({year:2026,month:12},1)).toEqual({year:2027,month:1});
    expect(shiftMonth({year:2026,month:1},-1)).toEqual({year:2025,month:12});
    expect(monthParam({year:2026,month:3})).toBe("2026-03");
  });
});
