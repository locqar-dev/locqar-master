import { Request, Response, NextFunction } from 'express';
import { StaffRole } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../shared/errors/AppError';

// Permission map — each role has a set of allowed permission strings
const ROLE_PERMISSIONS: Record<StaffRole, Set<string>> = {
  SUPER_ADMIN: new Set(['*']), // All permissions
  ADMIN: new Set([
    'staff.view', 'staff.create', 'staff.edit', 'staff.delete',
    'packages.view', 'packages.create', 'packages.edit', 'packages.scan',
    'couriers.view', 'couriers.create', 'couriers.edit', 'couriers.delete',
    'lockers.view', 'lockers.edit', 'lockers.open', 'lockers.create', 'lockers.delete',
    'terminals.view',
    'fleet.view', 'fleet.create', 'fleet.edit',
    'routes.view', 'routes.create', 'routes.edit',
    'analytics.view',
    'notifications.send',
    'alerts.view', 'alerts.resolve',
    'customers.view',
    'payroll.view', 'payroll.process',
    'hris.view', 'hris.edit',
    'settings.view',
    'messaging.view', 'messaging.send',
  ]),
  MANAGER: new Set([
    'staff.view',
    'packages.view', 'packages.create', 'packages.edit', 'packages.scan',
    'couriers.view', 'couriers.create', 'couriers.edit',
    'lockers.view', 'lockers.open',
    'terminals.view',
    'fleet.view',
    'routes.view',
    'analytics.view',
    'alerts.view',
    'customers.view',
    'hris.view',
    'messaging.view', 'messaging.send',
  ]),
  AGENT: new Set([
    'packages.view', 'packages.create', 'packages.scan',
    'couriers.view',
    'lockers.view', 'lockers.open',
    'terminals.view',
    'messaging.view', 'messaging.send',
    'customers.view',
  ]),
  SUPPORT: new Set([
    'packages.view',
    'customers.view',
    'messaging.view', 'messaging.send',
    'alerts.view',
    'exceptions.view', 'exceptions.create',
  ]),
  VIEWER: new Set([
    'packages.view',
    'couriers.view',
    'lockers.view',
    'terminals.view',
    'analytics.view',
    'customers.view',
  ]),
};

export function hasPermission(role: StaffRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  if (perms.has('*')) return true;
  return perms.has(permission);
}

/** Middleware factory — requires authenticated staff with a specific permission */
export function authorize(...permissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    const { userType, staffRole } = req.user;

    // Non-staff users (couriers, customers) can't access staff-only routes
    if (userType !== 'STAFF' || !staffRole) {
      return next(new ForbiddenError('Staff access only'));
    }

    // Check if user has ALL required permissions
    const allowed = permissions.every(p => hasPermission(staffRole, p));
    if (!allowed) {
      return next(new ForbiddenError(`Missing permission: ${permissions.join(', ')}`));
    }

    next();
  };
}

/** Middleware for courier-only routes */
export function requireCourier(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) return next(new UnauthorizedError());
  if (req.user.userType !== 'COURIER') return next(new ForbiddenError('Courier access only'));
  next();
}

/** Middleware for customer-only routes */
export function requireCustomer(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) return next(new UnauthorizedError());
  if (req.user.userType !== 'CUSTOMER') return next(new ForbiddenError('Customer access only'));
  next();
}
