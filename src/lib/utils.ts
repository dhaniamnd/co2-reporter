export function ym(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

export function toNumber(v: any): number {
  if (v == null || v === '') return NaN;
  if (typeof v === 'number') return v;
  const n = Number(String(v).replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : NaN;
}

export function guessYearFromFilename(name?: string) {
  if (!name) return undefined;
  const m = name.match(/(20\d{2})/);
  return m ? Number(m[1]) : undefined;
}

export function normalize(s: any) {
  return String(s || '')
    .toLowerCase()
    .replace(/co₂|co2/gi, 'co2')
    .replace(/[^a-z0-9]+/g, '');
}

export function monthLabel(i: number) {
  return new Date(2000, i-1, 1).toLocaleString(undefined, { month: 'short' });
}