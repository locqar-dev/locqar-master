import { z } from 'zod';
import { PackageSize, PackageStatus, DeliveryMethod, PaymentMethod } from '@prisma/client';

export const createPackageSchema = z.object({
  senderName:     z.string().min(1),
  senderPhone:    z.string().min(10),
  senderAddress:  z.string().optional(),
  recipientName:  z.string().min(1),
  recipientPhone: z.string().min(10),
  recipientEmail: z.string().email().optional(),
  size:           z.nativeEnum(PackageSize).default('M'),
  deliveryMethod: z.nativeEnum(DeliveryMethod).default('warehouse_to_locker'),
  description:    z.string().optional(),
  notes:          z.string().optional(),
  weight:         z.number().positive().optional(),
  price:          z.number().min(0).default(0),
  paymentMethod:  z.nativeEnum(PaymentMethod).optional(),
  terminalId:     z.string().uuid(),
  customerId:     z.string().uuid().optional(),
});

export const updateStatusSchema = z.object({
  status:    z.nativeEnum(PackageStatus),
  lockerId:  z.string().uuid().optional(),
  courierId: z.string().uuid().optional(),
  notes:     z.string().optional(),
});

export const listPackagesSchema = z.object({
  page:       z.coerce.number().int().positive().default(1),
  pageSize:   z.coerce.number().int().positive().max(100).default(20),
  status:     z.nativeEnum(PackageStatus).optional(),
  terminalId: z.string().uuid().optional(),
  courierId:  z.string().uuid().optional(),
  search:     z.string().optional(),
  from:       z.string().optional(),
  to:         z.string().optional(),
}).passthrough();

export const assignSchema = z.object({
  courierId: z.string().uuid(),
});

export const scanSchema = z.object({
  waybill:   z.string().min(1),
  action:    z.enum(['pickup', 'deposit', 'recall', 'scan']),
  lockerId:  z.string().uuid().optional(),
  barcode:   z.string().optional(),
  notes:     z.string().optional(),
});

export type CreatePackageDto = z.infer<typeof createPackageSchema>;
export type UpdateStatusDto  = z.infer<typeof updateStatusSchema>;
export type ScanDto          = z.infer<typeof scanSchema>;
