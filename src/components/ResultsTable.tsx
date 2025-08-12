'use client';
import type { OutputRow } from '@/types';

export default function ResultsTable({ rows, totals }: { rows: OutputRow[]; totals: Record<string, number> }) {
  return (
    <div className="overflow-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="bg-[var(--brand-100)]">
            {['Plant','Date','Month','Clinker (t)','Fuel (GJ)','Elec (MWh)','Process tCO₂','Fuel tCO₂','Electric tCO₂','Total tCO₂'].map(h => (
              <th key={h} className="whitespace-nowrap border-b px-3 py-2 text-left font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className=''>
          {rows.map((r,i) => (
            <tr key={i} className="odd:bg-[var(--brand-102)] even:bg-[var(--brand-103)]">
              <td className="border px-3 py-2">{r.Plant}</td>
              <td className="border px-3 py-2">{new Date(r.Date).toLocaleDateString()}</td>
              <td className="border px-3 py-2">{r.Month}</td>
              <td className="border px-3 py-2 text-right">{r.input.Clinker_t.toLocaleString()}</td>
              <td className="border px-3 py-2 text-right">{r.input.KilnFuel_GJ.toLocaleString()}</td>
              <td className="border px-3 py-2 text-right">{r.input.Electricity_MWh.toLocaleString()}</td>
              <td className="border px-3 py-2 text-right">{r.Process_tCO2.toFixed(2)}</td>
              <td className="border px-3 py-2 text-right">{r.Fuel_tCO2.toFixed(2)}</td>
              <td className="border px-3 py-2 text-right">{r.Electric_tCO2.toFixed(2)}</td>
              <td className="border px-3 py-2 text-right font-semibold">{r.Total_tCO2.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-[var(--brand-100)]">
            <td className="px-3 py-3 font-semibold" colSpan={9}>Totals by Plant</td>
            <td className="px-3 py-3"></td>
          </tr>
          {Object.entries(totals).map(([key, total]) => (
            <tr key={key}>
              <td className="px-3 py-2" colSpan={8}>{key}</td>
              <td className="px-3 py-2 text-right font-semibold" colSpan={2}>{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
            </tr>
          ))}
        </tfoot>
      </table>
    </div>
  );
}