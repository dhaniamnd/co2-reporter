'use client';
import { useMemo, useState } from 'react';
import Dropzone from '@/components/Dropzone';
import FactorsPanel from '@/components/FactorsPanel';
import MonthlyChart from '@/components/MonthlyChart';
import ResultsTable from '@/components/ResultsTable';
import SummaryCards from '@/components/SummaryCards';
import { parseWorkbook } from '@/lib/parser';
import { calcRow, type Factors } from '@/lib/csi';
import { aggregateBy, aggregateMonthly } from '@/lib/aggregate';
import { exportCSV, exportXLSX, exportPDFMonthly } from '@/lib/export';
import type { OutputRow } from '@/types';

export default function Page() {
  const [rows, setRows] = useState<OutputRow[]>([]);
  const [factors, setFactors] = useState<Factors>({
    processEF_tCO2_per_tClinker: 0.525, // B1 factor
    fuelEF_tCO2_per_GJ: 0.0946,
    gridEF_tCO2_per_MWh: 0.8,
  });

  // Derived filters
  const years = useMemo(() => Array.from(new Set(rows.map(r => new Date(r.Date).getFullYear()))).sort((a,b)=>a-b), [rows]);
  const plants = useMemo(() => Array.from(new Set(rows.map(r => r.Plant))).sort(), [rows]);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [selectedPlant, setSelectedPlant] = useState<string>('All');
  const effectiveYear = selectedYear ?? (years.length ? years[years.length-1] : new Date().getFullYear());

  const totalsByPlant = useMemo(() => aggregateBy(rows, 'Plant'), [rows]);
  const monthlyData = useMemo(() => aggregateMonthly(rows, { year: effectiveYear, plant: selectedPlant === 'All' ? undefined : selectedPlant }), [rows, effectiveYear, selectedPlant]);
  const grandTotal = useMemo(() => rows.reduce((a, r) => a + r.Total_tCO2, 0), [rows]);

  const onFiles = async (files: File[]) => {
    const all: OutputRow[] = [];
    for (const f of files) {
      const wbRows = await parseWorkbook(f);
      const computed = wbRows.map(r => calcRow(r, factors));
      all.push(...computed);
    }
    setRows(all);
  };

  const onExport = () => exportCSV(rows, 'co2-report.csv');
  const onExportXLSX = () => exportXLSX(rows, `co2-report-${effectiveYear}.xlsx`);
  const onExportPDF = () =>
    exportPDFMonthly(
      monthlyData.map((m: any) => {
        const monthKey = m.month ?? m.Month; // accept either, prefer lowercase
        const proc = Number(m.Process_tCO2 || 0);
        const fuel = Number(m.Fuel_tCO2 || 0);
        const elec = Number(m.Electric_tCO2 || 0);
        return {
          month: monthKey,
          Process_tCO2: proc,
          Fuel_tCO2: fuel,
          Electric_tCO2: elec,
          Total_tCO2: proc + fuel + elec,
        };
      }),
      {
        title: 'Cement Plant CO2 Emission Monthly Report',
        plant: selectedPlant,
        year: effectiveYear,
        factors,
      },
      `co2-monthly-${effectiveYear}-${selectedPlant}.pdf`,
      '#monthly-chart'
    );



  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 card">
          <h2 className="mb-2 text-lg font-semibold">1) Upload Excel</h2>
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">Upload a full production year per plant (12 monthly rows). You can also drop multiple plants/years at once. Uses B1 for process emissions.</p>
          <Dropzone onFiles={onFiles} />
        </div>
        <div className="card">
          <h2 className="mb-2 text-lg font-semibold">2) Emission Factors</h2>
          <FactorsPanel value={factors} onChange={setFactors} onRecalc={() => setRows(prev => prev.map(r => calcRow(r.input, factors)))} />
        </div>
      </div>

      <SummaryCards grandTotal={grandTotal} count={rows.length} />

      <div className="card">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div>
            <label className="label">Year</label>
            <select className="input" value={effectiveYear} onChange={e => setSelectedYear(Number(e.target.value))}>
              {years.length === 0 && <option value={effectiveYear}>{effectiveYear}</option>}
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Plant</label>
            <select className="input" value={selectedPlant} onChange={e => setSelectedPlant(e.target.value)}>
              <option value="All">All</option>
              {plants.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <h3 className="mb-2 text-lg font-semibold">Emissions by Month</h3>
        <MonthlyChart data={monthlyData} />
      </div>

      <div className="card">
        <h3 className="mb-2 text-lg font-semibold">Detailed Results</h3>
        <ResultsTable rows={rows} totals={Object.fromEntries(totalsByPlant.map(t => [t.Plant, t.Total_tCO2]))} />
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="btn" onClick={onExport}>Export CSV</button>
        <button className="btn" onClick={onExportXLSX}>Export Excel (.xlsx)</button>
        <button className="btn" onClick={onExportPDF}>Export PDF</button>
      </div>
    </div>
  );
}