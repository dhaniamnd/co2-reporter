import { z } from 'zod';

export const InputRowSchema = z.object({
  Plant: z.string().min(1),
  Date: z.coerce.date(),
  Clinker_t: z.number().nonnegative(),
  KilnFuel_GJ: z.number().nonnegative(),
  Electricity_MWh: z.number().nonnegative(),
});

export type InputRowZ = z.infer<typeof InputRowSchema>;