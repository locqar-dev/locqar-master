import { z } from 'zod';
import { LockerSize } from '@prisma/client';

export const createLockerSchema = z.object({
  terminalId:    z.string().uuid(),
  serialNo:      z.string().min(1),
  name:          z.string().min(1),
  size:          z.nativeEnum(LockerSize),
  location:      z.string().optional(),
  compartmentNo: z.number().int().positive(),
  winnsenSn:     z.string().optional(),
  doorNo:        z.number().int().positive().optional(),
});

export const updateLockerSchema = z.object({
  name:          z.string().min(1).optional(),
  location:      z.string().optional(),
  size:          z.nativeEnum(LockerSize).optional(),
  compartmentNo: z.number().int().positive().optional(),
  winnsenSn:     z.string().optional(),
  doorNo:        z.number().int().positive().optional(),
  isActive:      z.boolean().optional(),
});

export const bulkCreateLockerSchema = z.object({
  terminalId: z.string().uuid(),
  lockers: z.array(z.object({
    serialNo:      z.string().min(1),
    name:          z.string().min(1),
    size:          z.nativeEnum(LockerSize),
    location:      z.string().optional(),
    compartmentNo: z.number().int().positive(),
    winnsenSn:     z.string().optional(),
    doorNo:        z.number().int().positive().optional(),
  })).min(1),
});

export type CreateLockerDto = z.infer<typeof createLockerSchema>;
export type UpdateLockerDto = z.infer<typeof updateLockerSchema>;
export type BulkCreateLockerDto = z.infer<typeof bulkCreateLockerSchema>;
