// src/lib/template.ts
export type TemplateOpts = {
  year?: number;
  plant?: string;
};

function lastDayISO(y: number, mIndex0: number) {
  // mIndex0 = 0..11
  const d = new Date(y, mIndex0 + 1, 0);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export async function downloadTemplateXLSX(opts: TemplateOpts = {}) {
  // dynamic import so it never runs on the server
  const XLSX = await import('xlsx');

  const year = opts.year ?? new Date().getFullYear();
  const plant = opts.plant ?? 'YourPlant';

  // Columns match what your parser expects
  const headers = [
    'Plant',
    'Date',                 // YYYY-MM-DD (use last day of month)
    'Month',                // YYYY-MM (string form)
    'Clinker_t',            // t
    'KilnFuel_GJ',          // GJ (leave blank if using SHC)
    'SHC_GJ_per_t',         // GJ/t (optional)
    'Electricity_MWh',      // MWh (leave blank if using SPC)
    'SPC_kWh_per_t',        // kWh/t (optional)
    'Cementitious_t'        // t (only if using SPC)
  ];

  // Prefill 12 rows, one per month
  const rows = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    const mm = String(monthNum).padStart(2, '0');
    return {
      Plant: plant,
      Date: lastDayISO(year, i),   // e.g. 2022-01-31
      Month: `${year}-${mm}`,      // e.g. 2022-01
      Clinker_t: '',
      KilnFuel_GJ: '',
      SHC_GJ_per_t: '',
      Electricity_MWh: '',
      SPC_kWh_per_t: '',
      Cementitious_t: ''
    };
  });

  // Sheet 1: Input
  const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
  // Nice widths
  (ws as any)['!cols'] = [
    { wch: 16 }, // Plant
    { wch: 12 }, // Date
    { wch: 9 },  // Month
    { wch: 12 }, // Clinker_t
    { wch: 12 }, // KilnFuel_GJ
    { wch: 14 }, // SHC_GJ_per_t
    { wch: 15 }, // Electricity_MWh
    { wch: 14 }, // SPC_kWh_per_t
    { wch: 14 }  // Cementitious_t
  ];

  // Sheet 2: Notes (short, practical instructions)
  const notes = [
    ['How to use this template'],
    ['1) Fill ONE plant-year per file (12 rows). Keep the headers unchanged.'],
    ['2) Provide either KilnFuel_GJ OR SHC_GJ_per_t×Clinker_t (leave the other blank).'],
    ['3) Provide either Electricity_MWh OR SPC_kWh_per_t with Cementitious_t (leave the other blank).'],
    ['4) Units: Clinker_t and Cementitious_t in tonnes; Fuel in GJ; Electricity in MWh; SHC in GJ/t; SPC in kWh/t.'],
    ['5) Date should be the last day of the month (YYYY-MM-DD). Month can be YYYY-MM.'],
    ['6) Equation 6 fields are not used in this version.']
  ];
  const wsNotes = XLSX.utils.aoa_to_sheet(notes);
  (wsNotes as any)['!cols'] = [{ wch: 110 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Input');
  XLSX.utils.book_append_sheet(wb, wsNotes, 'Notes');

  const filename = `co2-input-template_${plant}_${year}.xlsx`;
  XLSX.writeFile(wb, filename);
}
