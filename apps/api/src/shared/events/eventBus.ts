import { EventEmitter } from 'events';
import { PackageStatus } from '@prisma/client';

export const eventBus = new EventEmitter();
eventBus.setMaxListeners(50);

// ── Event payload types ───────────────────────────────────────────────────────

export interface PackageStatusChangedEvent {
  waybill: string;
  packageId: string;
  newStatus: PackageStatus;
  customerId?: string | null;
  terminalId: string;
  courierId?: string | null;
  lockerId?: string | null;
}

export interface TaskAssignedEvent {
  taskId: string;
  courierId: string;
  packageId: string;
  waybill: string;
}

export interface LockerDoorEvent {
  lockerId: string;
  terminalId: string;
  eventType: string;
  doorNo?: number;
}

export interface PaymentCompletedEvent {
  paymentId: string;
  customerId: string;
  amount: number;
  method: string;
}

// ── Type-safe emit helpers ───────────────────────────────────────────────────

export const events = {
  packageStatusChanged: (data: PackageStatusChangedEvent) =>
    eventBus.emit('package:status_changed', data),

  taskAssigned: (data: TaskAssignedEvent) =>
    eventBus.emit('task:assigned', data),

  lockerDoor: (data: LockerDoorEvent) =>
    eventBus.emit('locker:door', data),

  paymentCompleted: (data: PaymentCompletedEvent) =>
    eventBus.emit('payment:completed', data),
};
