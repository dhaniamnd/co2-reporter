'use client';
import { useState } from 'react';
import type { Factors } from '@/lib/csi';

export default function FactorsPanel({ value, onChange, onRecalc }: { value: Factors; onChange: (v: Factors) => void; onRecalc: () => void }) {
  const [local, setLocal] = useState<Factors>(value);

  const set = (k: keyof Factors, v: any) => setLocal(prev => ({ ...prev, [k]: v }));

  const apply = () => { onChange(local); onRecalc(); };

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Process EF (tCO₂ / t Clinker) — B1</label>
        <input className="input" type="number" step="0.0001" value={local.processEF_tCO2_per_tClinker} onChange={e => set('processEF_tCO2_per_tClinker', Number(e.target.value))} />
      </div>
      <div>
        <label className="label">Fuel EF (tCO₂ / GJ)</label>
        <input className="input" type="number" step="0.0001" value={local.fuelEF_tCO2_per_GJ} onChange={e => set('fuelEF_tCO2_per_GJ', Number(e.target.value))} />
      </div>
      <div>
        <label className="label">Grid EF (tCO₂ / MWh)</label>
        <input className="input" type="number" step="0.0001" value={local.gridEF_tCO2_per_MWh} onChange={e => set('gridEF_tCO2_per_MWh', Number(e.target.value))} />
      </div>
      <button className="btn w-full bg-indigo-600 text-white" onClick={apply}>Apply & Recalculate</button>
      <p className="text-[11px] text-gray-500">Process emissions follow CSI Simple Output B1 Method. Adjust the default EF as needed and document your source.</p>
    </div>
  );
}