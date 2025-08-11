'use client';

export default function SummaryCards({ grandTotal, count }: { grandTotal: number; count: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="card">
        <div className="text-sm text-gray-500">Grand Total Emissions</div>
        <div className="text-2xl font-semibold">{grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} tCO₂</div>
      </div>
      <div className="card">
        <div className="text-sm text-gray-500">Records</div>
        <div className="text-2xl font-semibold">{count}</div>
      </div>
      <div className="card">
        <div className="text-sm text-gray-500">Avg / Record</div>
        <div className="text-2xl font-semibold">{count ? (grandTotal / count).toFixed(2) : 0} tCO₂</div>
      </div>
    </div>
  );
}