import type { OutputRow } from '@/types';

export function exportCSV(rows: OutputRow[], filename = 'report.csv') {
  const headers = [
    'Plant','Date','Month','Clinker_t','KilnFuel_GJ','Electricity_MWh','Process_tCO2','Fuel_tCO2','Electric_tCO2','Total_tCO2'
  ];
  const lines = rows.map(r => [
    r.Plant,
    new Date(r.Date).toISOString().slice(0,10),
    r.Month,
    r.input.Clinker_t,
    r.input.KilnFuel_GJ,
    r.input.Electricity_MWh,
    r.Process_tCO2.toFixed(3),
    r.Fuel_tCO2.toFixed(3),
    r.Electric_tCO2.toFixed(3),
    r.Total_tCO2.toFixed(3)
  ].join(','));
  const csv = [headers.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}