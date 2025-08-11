export type InputRow = {
  Plant: string;
  Date: string | number | Date; // monthly dates recommended
  Clinker_t: number;
  KilnFuel_GJ: number;
  Electricity_MWh: number;
};

export type OutputRow = {
  input: InputRow;
  Plant: string;
  Date: string | number | Date;
  Month: string; // YYYY-MM
  Process_tCO2: number;
  Fuel_tCO2: number;
  Electric_tCO2: number;
  Total_tCO2: number;
};