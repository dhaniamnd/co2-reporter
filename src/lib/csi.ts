import type { InputRow, OutputRow } from '@/types';
import { ym } from './utils';

// Factors are configurable in UI
export type Factors = {
  processEF_tCO2_per_tClinker: number; // B1 calcination factor
  fuelEF_tCO2_per_GJ: number;          // kiln fuel combustion
  gridEF_tCO2_per_MWh: number;         // indirect electricity
};

export function calcRow(input: InputRow, f: Factors): OutputRow {
  const d = new Date(input.Date);
  const Process_tCO2 = input.Clinker_t * f.processEF_tCO2_per_tClinker;
  const Fuel_tCO2 = input.KilnFuel_GJ * f.fuelEF_tCO2_per_GJ;
  const Electric_tCO2 = input.Electricity_MWh * f.gridEF_tCO2_per_MWh;
  const Total_tCO2 = Process_tCO2 + Fuel_tCO2 + Electric_tCO2;
  return {
    input,
    Plant: input.Plant,
    Date: d,
    Month: ym(d),
    Process_tCO2,
    Fuel_tCO2,
    Electric_tCO2,
    Total_tCO2
  };
}