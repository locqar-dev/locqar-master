/**
 * Winnsen Cloud API client
 * Docs: https://doc.winnsen.com/web/#/3
 *
 * All requests: GET https://cloud.winnsen.com/logistics3/api2?p={JSON}
 * JSON body: { APIKey, Action, Data }
 *
 * Winnsen returns: { Status: 'Success'|'Fail', Data, Message }
 */

import https from 'https';
import { config } from '../../config';
import { logger } from '../utils/logger';

// ── Types ────────────────────────────────────────────────────────────────────

interface WinnsenResponse<T = unknown> {
  Status: 'Success' | 'Fail';
  Data: T;
  Message: string;
}

export interface WinnsenTerminal {
  Status: string;   // '1' enabled, '0' disabled
  SN: string;
  Name: string;
  Longitude: string;
  Latitude: string;
  Connect: string;  // '1' online, '0' offline
}

export interface WinnsenDoor {
  No: string;       // door number
  Status: string;   // '1' enabled
  Occupied: string; // '1' occupied, '0' available
  Size: string;     // '0'=L '1'=M '2'=S '3'=R '4'=XL '5'=XS
  Opened: string;   // '1' open
}

export interface WinnsenCourier {
  Name: string;
  Status: string;
  Phone: string;
  QRCode: string;
  CardNo: string;
  Password: string;
}

export interface WinnsenOrder {
  WaybillNo: string;
  Status: string;   // see GetOrderList docs for status codes
  Phone: string;
  PayStatus: string;
  PayMoney: string;
}

export interface WinnsenOrderRecord {
  Type: string;       // '1' deliver, '2' send, '3' return
  Status: string;     // '1' in locker, '0' picked up
  Terminal: string;
  DoorNo: string;
  DropoffUser: string;
  DropoffTime: string;
  PickupCode: string;
  PickupType: string;
  PickupUser: string;
  PickupTime: string;
  Income: string;
}

export interface WinnsenError {
  CreateTime: string;
  ErrorCode: string;
  Describe: string;
  Terminal: string;
  DoorNo: string;
}

// ── HTTP helper ───────────────────────────────────────────────────────────────

function get<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let raw = '';
      res.on('data', (chunk: string) => { raw += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(raw) as T); }
        catch (e) { reject(new Error(`Winnsen: invalid JSON — ${raw.slice(0, 200)}`)); }
      });
    }).on('error', reject);
  });
}

// ── Service ───────────────────────────────────────────────────────────────────

class WinnsenCloudService {
  private get base() { return config.winnsen.cloudApiBase; }
  private get apiKey() { return config.winnsen.apiKey; }

  private async call<T>(action: string, data: Record<string, unknown> = {}): Promise<T> {
    const payload = { APIKey: this.apiKey, Action: action, Data: data };
    const p = encodeURIComponent(JSON.stringify(payload));
    const url = `${this.base}?p=${p}`;
    logger.debug(`[Winnsen] → ${action}`, data);
    const res = await get<WinnsenResponse<T>>(url);
    logger.debug(`[Winnsen] ← ${action}`, { status: res.Status, msg: res.Message });
    if (res.Status !== 'Success') {
      throw new Error(`Winnsen ${action} failed: ${res.Message}`);
    }
    return res.Data;
  }

  /** Assign a locker door and generate a pickup PIN for a waybill. Returns PinCode. */
  async setPinCode(opts: {
    waybillNo: string;
    phone: string;        // recipient phone, no country code prefix
    size?: string;        // door size: '0'=L '1'=M '2'=S '3'=R '4'=XL '5'=XS
    doorNo?: string;      // specific door number (auto-assigned if omitted)
    sn?: string;          // restrict to specific locker SN
  }): Promise<string> {
    const data: Record<string, string> = {
      WaybillNo: opts.waybillNo,
      Phone: opts.phone,
      ...(opts.size   && { Size: opts.size }),
      ...(opts.doorNo && { DoorNo: opts.doorNo }),
      ...(opts.sn     && { SN: opts.sn }),
    };
    const res = await this.call<{ PinCode: string }>('SetPinCode', data);
    return res.PinCode;
  }

  /** Set a payment amount the recipient must pay before the door opens. */
  async setPayment(waybillNo: string, amount: string, sn?: string): Promise<void> {
    await this.call('SetPayment', {
      WaybillNo: waybillNo,
      Amount: amount,
      ...(sn && { SN: sn }),
    });
  }

  /** Remotely open a specific door (maintenance / admin use). */
  async setDoorOpen(sn: string, doorNo: string): Promise<void> {
    await this.call('SetDoorOpen', { SN: sn, DoorNo: doorNo });
  }

  /** List all registered locker units + online status. */
  async getTerminalList(): Promise<WinnsenTerminal[]> {
    return this.call<WinnsenTerminal[]>('GetTerminalList', {
      Time: String(Math.floor(Date.now() / 1000)),
    });
  }

  /** Get door-level status for a single locker (size, occupied, open). */
  async getTerminalInfo(sn: string): Promise<WinnsenDoor[]> {
    return this.call<WinnsenDoor[]>('GetTerminalInfo', { SN: sn });
  }

  /** List couriers registered in Winnsen (includes QR codes + passwords). */
  async getCourierList(): Promise<WinnsenCourier[]> {
    return this.call<WinnsenCourier[]>('GetCourierList', {
      Time: String(Math.floor(Date.now() / 1000)),
    });
  }

  /** List waybills in a date range. Suggest ≤30 day windows. */
  async getOrderList(startDate: string, endDate: string, timezone = '00:00'): Promise<WinnsenOrder[]> {
    return this.call<WinnsenOrder[]>('GetOrderList', {
      StartDate: startDate,
      EndDate: endDate,
      TimeZone: timezone,
    });
  }

  /** Get full operation history for a single waybill. */
  async getOrderInfo(waybillNo: string): Promise<WinnsenOrderRecord[]> {
    return this.call<WinnsenOrderRecord[]>('GetOrderInfo', { WaybillNo: waybillNo });
  }

  /** Get hardware error reports. Pass sn='' to get all lockers. Suggest ≤30 day windows. */
  async getErrorList(startDate: string, endDate: string, timezone = '00:00', sn?: string): Promise<WinnsenError[]> {
    return this.call<WinnsenError[]>('GetErrorList', {
      StartDate: startDate,
      EndDate: endDate,
      TimeZone: timezone,
      SN: sn ?? '',
    });
  }
}

export const winnsenCloud = new WinnsenCloudService();
