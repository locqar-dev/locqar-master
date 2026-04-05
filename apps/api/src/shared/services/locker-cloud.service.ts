/**
 * LocQar Locker Cloud Service
 * ============================
 * In-house replacement for the Winnsen Cloud API client.
 *
 * Instead of calling https://cloud.winnsen.com/logistics3/api2, this service
 * queries our own database (Prisma) and controls doors locally via
 * @locqar/door-controller (RS-485).
 *
 * This provides the same capabilities the old Winnsen cloud had:
 *   - Generate/validate pickup PINs
 *   - Open doors remotely
 *   - Get terminal (locker unit) status
 *   - Get door-level status (size, occupied, open/closed)
 *   - List couriers
 *   - List and query orders/packages
 *   - Track hardware errors
 *
 * Usage:
 *   import { lockerCloud } from '../../shared/services/locker-cloud.service';
 *   const code = await lockerCloud.generatePickupCode({ waybill, phone });
 *   const terminals = await lockerCloud.getTerminalList();
 */

import { prisma } from '../../config/database';
import { logger } from '../utils/logger';
import { SmsService } from './sms.service';
// @ts-ignore - door-controller is a JS package without type declarations
import { doorClient } from '@locqar/door-controller/src/client';

// ── Types ────────────────────────────────────────────────────────────────────

export interface TerminalInfo {
  id: string;
  name: string;
  code: string;
  serialNo: string | null;        // winnsenSn on any locker at this terminal
  address: string;
  city: string;
  region: string;
  lat: number | null;
  lng: number | null;
  isActive: boolean;
  isOnline: boolean;              // based on lastPingAt of lockers
  lockerCount: number;
  availableCount: number;
  occupiedCount: number;
}

export interface DoorInfo {
  lockerId: string;
  doorNo: number | null;
  compartmentNo: number;
  serialNo: string;
  size: string;
  status: string;                 // available, occupied, maintenance, etc.
  isActive: boolean;
  isOpen: boolean | null;         // live door state from RS-485, null if unknown
  currentPackage: {
    waybill: string;
    recipientName: string;
    status: string;
  } | null;
}

export interface CourierInfo {
  id: string;
  name: string;
  phone: string | null;
  status: string;
  cardNo: string | null;
  qrCode: string | null;
  terminalId: string;
  terminalName: string;
  totalDeliveries: number;
  rating: number;
}

export interface OrderInfo {
  id: string;
  waybill: string;
  status: string;
  size: string;
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  pickupCode: string | null;
  lockerDoorNo: number | null;
  lockerId: string | null;
  terminalId: string;
  isPaid: boolean;
  price: number;
  currency: string;
  deliveredAt: Date | null;
  pickedUpAt: Date | null;
  createdAt: Date;
}

export interface OrderRecord {
  waybill: string;
  status: string;
  terminalName: string | null;
  doorNo: number | null;
  deliveredAt: Date | null;
  pickedUpAt: Date | null;
  pickupCode: string | null;
  courierName: string | null;
  recipientName: string;
  events: Array<{
    eventType: string;
    triggeredBy: string | null;
    metadata: unknown;
    createdAt: Date;
  }>;
}

export interface HardwareError {
  id: string;
  lockerId: string;
  lockerSerial: string;
  terminalName: string;
  doorNo: number | null;
  eventType: string;
  description: string | null;
  createdAt: Date;
}

// ── Service ──────────────────────────────────────────────────────────────────

class LockerCloudService {

  // ── PIN / Pickup Code Management ────────────────────────────────────────

  /**
   * Generate a pickup code for a package, optionally assign a door, and send SMS.
   * Replaces Winnsen's SetPinCode API.
   */
  async generatePickupCode(opts: {
    waybill: string;
    phone?: string;
    size?: string;
    doorNo?: number;
    terminalId?: string;
  }): Promise<{ pickupCode: string; doorNo: number | null; lockerId: string | null }> {
    const pkg = await prisma.package.findFirst({
      where: { waybill: opts.waybill },
      include: { locker: true },
    });
    if (!pkg) throw new Error(`Package not found: ${opts.waybill}`);

    // Generate 6-digit pickup code
    const pickupCode = String(Math.floor(100000 + Math.random() * 900000));

    // If no door assigned yet and we have a terminal, auto-assign one
    let doorNo = opts.doorNo ?? pkg.lockerDoorNo;
    let lockerId = pkg.lockerId;

    if (!lockerId && opts.terminalId) {
      const available = await prisma.locker.findFirst({
        where: {
          terminalId: opts.terminalId,
          isActive: true,
          status: 'available',
          ...(opts.size ? { size: opts.size as any } : {}),
        },
        orderBy: { compartmentNo: 'asc' },
      });
      if (available) {
        lockerId = available.id;
        doorNo = available.doorNo;
      }
    }

    // Update package with pickup code and door assignment
    await prisma.package.update({
      where: { id: pkg.id },
      data: {
        pickupCode,
        ...(lockerId && { lockerId }),
        ...(doorNo !== undefined && doorNo !== null && { lockerDoorNo: doorNo }),
      },
    });

    // Send SMS to recipient
    const recipientPhone = opts.phone || pkg.recipientPhone;
    if (recipientPhone) {
      try {
        await SmsService.send(
          recipientPhone,
          `Your LocQar pickup code is: ${pickupCode}. Use this code at the locker to collect your package.`
        );
        logger.info(`[LockerCloud] SMS sent to ${recipientPhone} for waybill=${opts.waybill}`);
      } catch (err) {
        logger.error(`[LockerCloud] SMS failed for ${recipientPhone}:`, err);
        // Don't throw — code was generated successfully, SMS is best-effort
      }
    }

    logger.info(`[LockerCloud] generatePickupCode waybill=${opts.waybill} code=${pickupCode} door=${doorNo}`);
    return { pickupCode, doorNo: doorNo ?? null, lockerId };
  }

  /**
   * Validate a pickup code. Returns the package + door info if valid.
   */
  async validatePickupCode(code: string): Promise<{
    valid: boolean;
    waybill: string | null;
    doorNo: number | null;
    lockerId: string | null;
    packageId: string | null;
  }> {
    const pkg = await prisma.package.findFirst({
      where: { pickupCode: code, status: 'delivered_to_locker' },
      select: { id: true, waybill: true, lockerDoorNo: true, lockerId: true },
    });

    if (!pkg) {
      return { valid: false, waybill: null, doorNo: null, lockerId: null, packageId: null };
    }

    return {
      valid: true,
      waybill: pkg.waybill,
      doorNo: pkg.lockerDoorNo,
      lockerId: pkg.lockerId,
      packageId: pkg.id,
    };
  }

  // ── Payment ─────────────────────────────────────────────────────────────

  /**
   * Set a payment amount on a package.
   * Replaces Winnsen's SetPayment API.
   */
  async setPayment(waybill: string, amount: number, currency = 'GHS'): Promise<void> {
    const result = await prisma.package.updateMany({
      where: { waybill },
      data: { price: amount, currency },
    });
    if (result.count === 0) throw new Error(`Package not found: ${waybill}`);
    logger.info(`[LockerCloud] setPayment waybill=${waybill} amount=${amount} ${currency}`);
  }

  // ── Door Control ────────────────────────────────────────────────────────

  /**
   * Open a specific door. Uses local RS-485 door controller.
   * Replaces Winnsen's SetDoorOpen cloud API.
   */
  async openDoor(doorNo: number): Promise<{ success: boolean; door: number; error: string | null }> {
    try {
      const result = await doorClient.openDoor(doorNo);
      logger.info(`[LockerCloud] openDoor door=${doorNo} success=${result.success}`);
      return { success: result.success, door: result.door, error: result.error ?? null };
    } catch (err: any) {
      logger.error(`[LockerCloud] openDoor door=${doorNo} failed:`, err.message);
      return { success: false, door: doorNo, error: err.message };
    }
  }

  /**
   * Open a door by station + lock (direct RS-485 addressing).
   */
  async openLock(station: number, lock: number): Promise<{ success: boolean; error: string | null }> {
    try {
      const result = await doorClient.openLock(station, lock);
      logger.info(`[LockerCloud] openLock station=${station} lock=${lock} success=${result.success}`);
      return { success: result.success, error: result.error ?? null };
    } catch (err: any) {
      logger.error(`[LockerCloud] openLock station=${station} lock=${lock} failed:`, err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Get the live open/closed status of a single door.
   */
  async getDoorStatus(doorNo: number): Promise<{ door: number; status: string; error: string | null }> {
    try {
      const result = await doorClient.getDoorStatus(doorNo);
      return { door: doorNo, status: result.status, error: result.error ?? null };
    } catch (err: any) {
      return { door: doorNo, status: 'unknown', error: err.message };
    }
  }

  /**
   * Get the live open/closed status of all doors on a station.
   */
  async getStationDoorStatus(station: number): Promise<{ station: number; doors: Record<number, string>; error: string | null }> {
    try {
      const result = await doorClient.getStationStatus(station);
      return { station, doors: result.doors, error: null };
    } catch (err: any) {
      return { station, doors: {}, error: err.message };
    }
  }

  // ── Terminal / Locker Info ──────────────────────────────────────────────

  /**
   * List all terminals (locker units) with online status and availability.
   * Replaces Winnsen's GetTerminalList API.
   */
  async getTerminalList(): Promise<TerminalInfo[]> {
    const terminals = await prisma.terminal.findMany({
      where: { isActive: true },
      include: {
        lockers: {
          select: {
            id: true,
            winnsenSn: true,
            status: true,
            lastPingAt: true,
            isActive: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

    return terminals.map(t => {
      const activeLockers = t.lockers.filter(l => l.isActive);
      const availableCount = activeLockers.filter(l => l.status === 'available').length;
      const occupiedCount = activeLockers.filter(l => l.status === 'occupied').length;
      // Terminal is "online" if any locker has pinged within 5 minutes
      const isOnline = activeLockers.some(l => l.lastPingAt && l.lastPingAt > fiveMinAgo);
      // Use first locker's winnsenSn as terminal SN
      const serialNo = t.lockers.find(l => l.winnsenSn)?.winnsenSn ?? null;

      return {
        id: t.id,
        name: t.name,
        code: t.code,
        serialNo,
        address: t.address,
        city: t.city,
        region: t.region,
        lat: t.lat,
        lng: t.lng,
        isActive: t.isActive,
        isOnline,
        lockerCount: activeLockers.length,
        availableCount,
        occupiedCount,
      };
    });
  }

  /**
   * Get door-level info for a terminal, including live door states from RS-485.
   * Replaces Winnsen's GetTerminalInfo API.
   *
   * @param terminalId - Terminal UUID
   * @param includeLiveStatus - If true, also polls door controller for open/closed state
   */
  async getTerminalInfo(terminalId: string, includeLiveStatus = false): Promise<DoorInfo[]> {
    const lockers = await prisma.locker.findMany({
      where: { terminalId },
      include: {
        currentPackage: {
          select: { waybill: true, recipientName: true, status: true },
        },
      },
      orderBy: { compartmentNo: 'asc' },
    });

    // Optionally get live door states from RS-485
    let liveDoorStates: Record<number, string> = {};
    if (includeLiveStatus) {
      try {
        // Group lockers by station and poll each
        const doorNos = lockers.filter(l => l.doorNo != null).map(l => l.doorNo!);
        if (doorNos.length > 0) {
          // Get unique stations by checking door number ranges
          const stations = new Set(doorNos.map(d => Math.ceil(d / 16)));
          for (const station of stations) {
            const result = await doorClient.getStationStatus(station);
            if (result.doors) {
              Object.assign(liveDoorStates, result.doors);
            }
          }
        }
      } catch (err: any) {
        logger.warn(`[LockerCloud] getTerminalInfo live status failed: ${err.message}`);
      }
    }

    return lockers.map(l => ({
      lockerId: l.id,
      doorNo: l.doorNo,
      compartmentNo: l.compartmentNo,
      serialNo: l.serialNo,
      size: l.size,
      status: l.status,
      isActive: l.isActive,
      isOpen: l.doorNo != null && liveDoorStates[l.doorNo] !== undefined
        ? liveDoorStates[l.doorNo] === 'open'
        : null,
      currentPackage: l.currentPackage
        ? {
            waybill: l.currentPackage.waybill,
            recipientName: l.currentPackage.recipientName,
            status: l.currentPackage.status,
          }
        : null,
    }));
  }

  /**
   * Get terminal info by locker serial number (winnsenSn).
   * Convenience method for backward compatibility with the old SN-based lookups.
   */
  async getTerminalInfoBySN(winnsenSn: string, includeLiveStatus = false): Promise<DoorInfo[]> {
    const locker = await prisma.locker.findFirst({
      where: { winnsenSn },
      select: { terminalId: true },
    });
    if (!locker) throw new Error(`No locker found with SN: ${winnsenSn}`);
    return this.getTerminalInfo(locker.terminalId, includeLiveStatus);
  }

  // ── Courier Info ────────────────────────────────────────────────────────

  /**
   * List all couriers with their user info.
   * Replaces Winnsen's GetCourierList API.
   */
  async getCourierList(terminalId?: string): Promise<CourierInfo[]> {
    const couriers = await prisma.courier.findMany({
      where: terminalId ? { terminalId } : {},
      include: {
        user: { select: { name: true, phone: true } },
        terminal: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return couriers.map(c => ({
      id: c.id,
      name: c.user.name,
      phone: c.user.phone,
      status: c.status,
      cardNo: c.cardNo,
      qrCode: c.qrCode,
      terminalId: c.terminalId,
      terminalName: c.terminal.name,
      totalDeliveries: c.totalDeliveries,
      rating: c.rating,
    }));
  }

  // ── Order / Package Queries ─────────────────────────────────────────────

  /**
   * List packages in a date range.
   * Replaces Winnsen's GetOrderList API.
   */
  async getOrderList(opts: {
    startDate: Date;
    endDate: Date;
    terminalId?: string;
    status?: string;
  }): Promise<OrderInfo[]> {
    const packages = await prisma.package.findMany({
      where: {
        createdAt: { gte: opts.startDate, lte: opts.endDate },
        ...(opts.terminalId ? { terminalId: opts.terminalId } : {}),
        ...(opts.status ? { status: opts.status as any } : {}),
      },
      select: {
        id: true,
        waybill: true,
        status: true,
        size: true,
        senderName: true,
        senderPhone: true,
        recipientName: true,
        recipientPhone: true,
        pickupCode: true,
        lockerDoorNo: true,
        lockerId: true,
        terminalId: true,
        isPaid: true,
        price: true,
        currency: true,
        deliveredAt: true,
        pickedUpAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return packages;
  }

  /**
   * Get full operation history for a single package.
   * Replaces Winnsen's GetOrderInfo API.
   */
  async getOrderInfo(waybill: string): Promise<OrderRecord | null> {
    const pkg = await prisma.package.findFirst({
      where: { waybill },
      include: {
        terminal: { select: { name: true } },
        courier: { include: { user: { select: { name: true } } } },
        locker: {
          include: {
            events: {
              orderBy: { createdAt: 'desc' },
              take: 50,
            },
          },
        },
      },
    });

    if (!pkg) return null;

    return {
      waybill: pkg.waybill,
      status: pkg.status,
      terminalName: pkg.terminal?.name ?? null,
      doorNo: pkg.lockerDoorNo,
      deliveredAt: pkg.deliveredAt,
      pickedUpAt: pkg.pickedUpAt,
      pickupCode: pkg.pickupCode,
      courierName: pkg.courier?.user.name ?? null,
      recipientName: pkg.recipientName,
      events: pkg.locker?.events.map(e => ({
        eventType: e.eventType,
        triggeredBy: e.triggeredBy,
        metadata: e.metadata,
        createdAt: e.createdAt,
      })) ?? [],
    };
  }

  // ── Hardware Error Tracking ─────────────────────────────────────────────

  /**
   * Get hardware error events in a date range.
   * Replaces Winnsen's GetErrorList API.
   */
  async getErrorList(opts: {
    startDate: Date;
    endDate: Date;
    terminalId?: string;
  }): Promise<HardwareError[]> {
    const events = await prisma.lockerEvent.findMany({
      where: {
        eventType: { in: ['error', 'door_jam', 'sensor_fault', 'communication_error', 'timeout'] },
        createdAt: { gte: opts.startDate, lte: opts.endDate },
        ...(opts.terminalId ? {
          locker: { terminalId: opts.terminalId },
        } : {}),
      },
      include: {
        locker: {
          select: {
            serialNo: true,
            doorNo: true,
            terminal: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return events.map(e => ({
      id: e.id,
      lockerId: e.lockerId,
      lockerSerial: e.locker.serialNo,
      terminalName: e.locker.terminal.name,
      doorNo: e.locker.doorNo,
      eventType: e.eventType,
      description: (e.metadata as any)?.description ?? null,
      createdAt: e.createdAt,
    }));
  }

  /**
   * Log a hardware error event.
   */
  async logError(opts: {
    lockerId: string;
    eventType: string;
    description?: string;
    triggeredBy?: string;
  }): Promise<void> {
    await prisma.lockerEvent.create({
      data: {
        lockerId: opts.lockerId,
        eventType: opts.eventType,
        triggeredBy: opts.triggeredBy ?? 'system',
        metadata: opts.description ? { description: opts.description } : undefined,
      },
    });
    logger.warn(`[LockerCloud] Hardware error: ${opts.eventType} locker=${opts.lockerId}`);
  }

  // ── Health / Connectivity ───────────────────────────────────────────────

  /**
   * Check if the local door controller is healthy and reachable.
   */
  async healthCheck(): Promise<{
    doorController: { connected: boolean; port: string; simulate: boolean } | null;
    database: boolean;
  }> {
    let doorHealth = null;
    try {
      const result = await doorClient.health();
      doorHealth = {
        connected: result.serial?.connected ?? false,
        port: result.serial?.port ?? 'unknown',
        simulate: result.serial?.simulate ?? false,
      };
    } catch {
      // Door controller not reachable
    }

    let dbHealthy = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbHealthy = true;
    } catch {
      // DB not reachable
    }

    return { doorController: doorHealth, database: dbHealthy };
  }

  /**
   * Update the lastPingAt timestamp for all lockers at a terminal.
   * Called by the kiosk to indicate it's alive.
   */
  async heartbeat(terminalId: string): Promise<void> {
    await prisma.locker.updateMany({
      where: { terminalId, isActive: true },
      data: { lastPingAt: new Date() },
    });
  }
}

export const lockerCloud = new LockerCloudService();
