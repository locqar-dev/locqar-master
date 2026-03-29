import { StaffRole, UserType } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      terminal?: string | null;
    }
  }
}

export interface AuthUser {
  id: string;
  userType: UserType;
  staffRole?: StaffRole | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  terminalId?: string | null;
}
