import type { OutputRow } from '@/types';

/** Minimal CSV export (UTF-8 + BOM) */
export function exportCSV(rows: OutputRow[], filename = 'co2-report.csv') {
  const header = [
    'Plant',
    'Date',
    'Clinker_t',
    'KilnFuel_GJ',
    'Electricity_MWh',
    'Process_tCO2',
    'Fuel_tCO2',
    'Electric_tCO2',
    'Total_tCO2',
  ];

  const toCell = (v: unknown) =>
    (v ?? '')
      .toString()
      .replace(/"/g, '""');

  const lines = [
    header.join(','),
    ...rows.map((r: any) => {
      const inp = r.input ?? r;
      const row = [
        r.Plant ?? inp.Plant ?? '',
        r.Date ?? inp.Date ?? '',
        inp.Clinker_t ?? 0,
        inp.KilnFuel_GJ ?? 0,
        inp.Electricity_MWh ?? 0,
        r.Process_tCO2 ?? 0,
        r.Fuel_tCO2 ?? 0,
        r.Electric_tCO2 ?? 0,
        r.Total_tCO2 ?? 0,
      ];
      return row.map(v => `"${toCell(v)}"`).join(',');
    }),
  ].join('\r\n');

  // UTF-8 BOM so Excel opens Indonesian characters correctly
  const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), lines], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Export all loaded rows to Excel (.xlsx) */
export async function exportXLSX(rows: OutputRow[], filename = 'co2-report.xlsx') {
  const XLSX = await import('xlsx'); // dynamic import to avoid SSR issues
  const flat = rows.map((r: any) => {
    const inp = r.input ?? r;
    return {
      Plant: r.Plant ?? inp.Plant,
      Date: r.Date ?? inp.Date,
      Clinker_t: inp.Clinker_t ?? 0,
      KilnFuel_GJ: inp.KilnFuel_GJ ?? 0,
      Electricity_MWh: inp.Electricity_MWh ?? 0,
      Process_tCO2: r.Process_tCO2 ?? 0,
      Fuel_tCO2: r.Fuel_tCO2 ?? 0,
      Electric_tCO2: r.Electric_tCO2 ?? 0,
      Total_tCO2: r.Total_tCO2 ?? 0,
    };
  });
  const ws = XLSX.utils.json_to_sheet(flat);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, filename);
}

/**
 * Export the monthly aggregated data to PDF.
 * If chartSelector is provided (e.g. '#monthly-chart'), the current chart is embedded at the top.
 */
// --- Enhanced PDF export: header/footer, chart image, key figures, monthly table (landscape) ---
export async function exportPDFMonthly(
  monthly: Array<{
    month: string;              // e.g. "2022-01"
    Process_tCO2: number;
    Fuel_tCO2: number;
    Electric_tCO2: number;
    Total_tCO2?: number;        // optional; computed if missing
  }>,
  meta: {
    title?: string;
    plant?: string;
    year?: number;
    factors?: {
      processEF_tCO2_per_tClinker?: number;
      fuelEF_tCO2_per_GJ?: number;
      gridEF_tCO2_per_MWh?: number;
    };
  } = {},
  filename = 'co2-monthly-report.pdf',
  chartSelector?: string        // e.g. '#monthly-chart'
) {
  if (typeof window === 'undefined') return; // guard SSR

  // Imports (robust to different bundlers)
  const jsPDFmod: any = await import('jspdf');
  const jsPDF = jsPDFmod.default ?? jsPDFmod.jsPDF;
  const autoTableMod: any = await import('jspdf-autotable');
  const autoTable = autoTableMod.default ?? autoTableMod;

  // BRAND colors (your palette)
  const BRAND = {
    headerFill: [114, 142, 74], // #728e4a (header bg)
    headerText: [255, 255, 255],
    bandFill: [210, 230, 181],  // #d2e6b5 (light band)
  };

  // Compute totals (also fill Total_tCO2 if missing)
  const safeMonthly = monthly.map((m) => {
    const total = m.Total_tCO2 ?? (Number(m.Process_tCO2 || 0) + Number(m.Fuel_tCO2 || 0) + Number(m.Electric_tCO2 || 0));
    return { ...m, Total_tCO2: total };
  });
  const sum = (k: keyof typeof safeMonthly[number]) =>
    safeMonthly.reduce((a, r) => a + Number(r[k] || 0), 0);

  const totProc = sum('Process_tCO2');
  const totFuel = sum('Fuel_tCO2');
  const totElec = sum('Electric_tCO2');
  const totAll  = sum('Total_tCO2');
  const scope1  = totProc + totFuel;

  // Doc: landscape for a wider table
  const doc = new jsPDF({ unit: 'pt', orientation: 'landscape' });
  const pageW = doc.internal.pageSize.getWidth();
  const marginX = 40;
  let cursorY = 40;

  // --- Header banner on page 1
  const title = meta.title ?? 'Cement Plant CO2 Emission Monthly Report';
  doc.setFillColor(...BRAND.headerFill);
  doc.rect(0, 0, pageW, 36, 'F');
  doc.setTextColor(...BRAND.headerText);
  doc.setFontSize(14);
  doc.text(title, marginX, 24);

  // Subline on page 1
  const subBits = [
    meta.plant ? `Plant: ${meta.plant}` : null,
    meta.year ? `Year: ${meta.year}` : null,
  ].filter(Boolean);
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(subBits.join(' | '), marginX, 54);
  cursorY = 70;

  // Optional chart image (top of page 1)
  if (chartSelector) {
    const el = document.querySelector(chartSelector) as HTMLElement | null;
    if (el) {
      const html2canvas: any = (await import('html2canvas')).default;
      const canvas = await html2canvas(el, { backgroundColor: null, scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const imgW = pageW - marginX * 2;
      const imgH = imgW * (canvas.height / canvas.width);
      doc.addImage(imgData, 'PNG', marginX, cursorY, imgW, imgH);
      cursorY += imgH + 14;
    }
  }

  // Factors (ASCII only to avoid glyph issues)
  if (meta.factors) {
    const f = meta.factors;
    const lines = [
      f.processEF_tCO2_per_tClinker != null ? `Process EF (B1): ${f.processEF_tCO2_per_tClinker} tCO2/t` : null,
      f.fuelEF_tCO2_per_GJ != null ? `Fuel EF: ${f.fuelEF_tCO2_per_GJ} tCO2/GJ` : null,
      f.gridEF_tCO2_per_MWh != null ? `Grid EF: ${f.gridEF_tCO2_per_MWh} tCO2/MWh` : null,
    ].filter(Boolean) as string[];
    if (lines.length) {
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(lines, marginX, cursorY);
      cursorY += 12 * lines.length + 6;
    }
  }

  // --- Key figures table (Scope 1/2 & totals)
  const toStr = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  autoTable(doc, {
    startY: cursorY,
    theme: 'grid',
    head: [['Metric', 'Value (tCO2)']],
    body: [
      ['Process (Scope 1)', toStr(totProc)],
      ['Fuel (Scope 1)', toStr(totFuel)],
      ['Scope 1 total', toStr(scope1)],
      ['Electricity (Scope 2)', toStr(totElec)],
      ['Grand total (S1 + S2)', toStr(totAll)],
    ],
    styles: { fontSize: 9 },
    columnStyles: { 1: { halign: 'right' } },
    headStyles: { fillColor: BRAND.bandFill, textColor: [0, 0, 0] },
    margin: { left: marginX, right: marginX },
  });

  // --- Monthly table
  const monthlyRows = safeMonthly.map((m) => [
    m.month,
    toStr(Number(m.Process_tCO2 || 0)),
    toStr(Number(m.Fuel_tCO2 || 0)),
    toStr(Number(m.Electric_tCO2 || 0)),
    toStr(Number(m.Total_tCO2 || 0)),
  ]);

  // Use didDrawPage to add header/footer on pages created by this big table
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 12,
    theme: 'grid',
    head: [['Month', 'Process tCO2', 'Fuel tCO2', 'Electric tCO2', 'Total tCO2']],
    body: monthlyRows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: BRAND.bandFill, textColor: [0, 0, 0] },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
    margin: { top: 66, left: marginX, right: marginX },
    didDrawPage: (data: any) => {
      // Header bar on subsequent pages (page 1 already has it)
      if (data.pageNumber > 1) {
        doc.setFillColor(...BRAND.headerFill);
        doc.rect(0, 0, pageW, 36, 'F');
        doc.setTextColor(...BRAND.headerText);
        doc.setFontSize(14);
        doc.text(title, marginX, 24);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(subBits.join(' | '), marginX, 52);
      }
      // Footer with page numbers + timestamp
      const pageCount = doc.getNumberOfPages();
      const footer = `Page ${data.pageNumber} / ${pageCount}`;
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(footer, marginX, doc.internal.pageSize.getHeight() - 16);
    },
  });

  doc.save(filename);
}
