import type { OutputRow } from '@/types';
import { monthLabel } from './utils';

export function aggregateBy(rows: OutputRow[], by: 'Plant' | 'Month') {
  const map = new Map<string, number>();
  for (const r of rows) {
    const key = by === 'Plant' ? r.Plant : r.Month;
    map.set(key, (map.get(key) || 0) + r.Total_tCO2);
  }
  return Array.from(map, ([k,v]) => ({ [by]: k, Total_tCO2: v })) as any[];
}

export function aggregateMonthly(rows: OutputRow[], opts: { year: number, plant?: string }) {
  const { year, plant } = opts;
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: monthLabel(i + 1),
    mkey: `${year}-${String(i+1).padStart(2,'0')}`,
    Process_tCO2: 0,
    Fuel_tCO2: 0,
    Electric_tCO2: 0,
    Total_tCO2: 0,
  }));
  for (const r of rows) {
    const d = new Date(r.Date);
    const y = d.getFullYear();
    if (y !== year) continue;
    if (plant && r.Plant !== plant) continue;
    const idx = d.getMonth(); // 0..11
    const bucket = months[idx];
    bucket.Process_tCO2 += r.Process_tCO2;
    bucket.Fuel_tCO2 += r.Fuel_tCO2;
    bucket.Electric_tCO2 += r.Electric_tCO2;
    bucket.Total_tCO2 += r.Total_tCO2;
  }
  return months.map(({ mkey, ...rest }) => rest);
}