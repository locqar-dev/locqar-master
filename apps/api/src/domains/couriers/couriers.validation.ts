import { z } from 'zod';

export const createCourierSchema = z.object({
  name:       z.string().min(1),
  phone:      z.string().min(10),
  email:      z.string().email().optional(),
  terminalId: z.string().uuid(),
  employeeId: z.string().optional(),
  cardNo:     z.string().optional(),
  team:       z.string().optional(),
  vehicleId:  z.string().uuid().optional(),
});

export const updateCourierSchema = z.object({
  name:       z.string().min(1).optional(),
  phone:      z.string().min(10).optional(),
  email:      z.string().email().optional(),
  terminalId: z.string().uuid().optional(),
  team:       z.string().optional(),
  cardNo:     z.string().optional(),
  vehicleId:  z.string().uuid().nullable().optional(),
});

export type CreateCourierDto = z.infer<typeof createCourierSchema>;
export type UpdateCourierDto = z.infer<typeof updateCourierSchema>;
