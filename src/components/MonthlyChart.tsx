'use client';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

type D = {
  month: string;              // e.g. "2022-01"
  Process_tCO2: number;       // monthly totals
  Fuel_tCO2: number;
  Electric_tCO2: number;
};

export default function MonthlyChart({ data }: { data: D[] }) {
  return (
    <div id="monthly-chart" className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
          barCategoryGap="18%"  // distance between month groups
          barGap={4}            // spacing between bars inside a group
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis
            width={70}
            tickFormatter={(v) => Number(v).toLocaleString()}
          />
          <Tooltip
            formatter={(v: number) =>
              Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })
            }
          />
          <Legend />

          {/* Side-by-side bars: simply omit stackId */}
          <Bar dataKey="Process_tCO2"  name="Process"  fill="var(--bar-process)" />
          <Bar dataKey="Fuel_tCO2"     name="Fuel"     fill="var(--bar-fuel)" />
          <Bar dataKey="Electric_tCO2" name="Electric" fill="var(--bar-electric)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
