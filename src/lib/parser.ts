import * as XLSX from 'xlsx';
import { InputRowSchema } from './schema';
import type { InputRow } from '@/types';
import { toNumber, guessYearFromFilename, normalize } from './utils';

// Heuristic, supports both tidy row-wise and matrix "indicator vs plant" layouts
export async function parseWorkbook(file: File): Promise<InputRow[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];

  // 1) Try tidy row-wise first
  const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: null });
  const rows: InputRow[] = [];

  const pickKey = (obj: any, candidates: string[]) => {
    const keys = Object.keys(obj);
    for (const k of keys) {
      const nk = normalize(k);
      for (const c of candidates) {
        if (nk.includes(c)) return k;
      }
    }
    return undefined;
  };

  for (const raw of json) {
    const plantK = pickKey(raw, ['plant','pabrik','company','perusahaan','nama']);
    const dateK  = pickKey(raw, ['date','tanggal','period','periode','year','tahun','month','bulan']);
    const clinkerK = pickKey(raw, ['clinker','produksiklinker']);
    const fuelK  = pickKey(raw, ['kilnfuel','fuel_gj','fuel','energi','gj']);
    const elecK  = pickKey(raw, ['electricity','listrik','mwh']);

    if (plantK && dateK && clinkerK) {
      const yearMaybe = /^(?:20\d{2})$/.test(String(raw[dateK])) ? Number(raw[dateK]) : undefined;
      const d = yearMaybe ? new Date(yearMaybe, 11, 31) : new Date(raw[dateK]);

      const obj: InputRow = {
        Plant: String(raw[plantK] ?? ''),
        Date: d,
        Clinker_t: toNumber(raw[clinkerK]) || 0,
        KilnFuel_GJ: toNumber(raw[fuelK]) || 0,
        Electricity_MWh: toNumber(raw[elecK]) || 0,
      };

      const parsed = InputRowSchema.safeParse(obj);
      if (parsed.success) rows.push(parsed.data);
    }
  }
  if (rows.length) return rows;

  // 2) Fallback: matrix layout (rows = indicators, columns = plants)
  const A: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  if (!A.length) return [];

  // find metric rows
  let clinkerRow = -1, yearRow = -1;
  for (let i = 0; i < A.length; i++) {
    const key = normalize(A[i][0]);
    if (key.includes('clinker') && clinkerRow === -1) clinkerRow = i;
    if ((key === 'year' || key === 'tahun') && yearRow === -1) yearRow = i;
  }
  const headerRow = Math.max(0, clinkerRow - 1);
  const yearFromName = guessYearFromFilename(file.name);
  const yearVal = yearRow >= 0 ? (toNumber(A[yearRow][1]) || yearFromName) : yearFromName;
  const date = yearVal ? new Date(yearVal, 11, 31) : new Date();

  const header = A[headerRow] || [];
  for (let j = 1; j < header.length; j++) {
    const plant = header[j];
    if (!plant) continue;
    const clinker = clinkerRow >= 0 ? toNumber(A[clinkerRow][j]) : NaN;
    if (Number.isNaN(clinker)) continue;

    const obj: InputRow = {
      Plant: String(plant),
      Date: date,
      Clinker_t: clinker || 0,
      KilnFuel_GJ: 0,
      Electricity_MWh: 0,
    };

    const parsed = InputRowSchema.safeParse(obj);
    if (parsed.success) rows.push(parsed.data);
  }
  return rows;
}