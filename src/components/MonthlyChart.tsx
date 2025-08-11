'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type D = {
  Month: string; // Jan, Feb, ...
  Process_tCO2: number;
  Fuel_tCO2: number;
  Electric_tCO2: number;
  Total_tCO2: number;
};

export default function MonthlyChart({ data }: { data: D[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v: any) => Number(v).toLocaleString()} />
          <Legend />
          <Bar dataKey="Process_tCO2"  stackId="a" name="Process"  fill="var(--bar-process)" />
          <Bar dataKey="Fuel_tCO2"     stackId="a" name="Fuel"     fill="var(--bar-fuel)" />
          <Bar dataKey="Electric_tCO2" stackId="a" name="Electric" fill="var(--bar-electric)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}