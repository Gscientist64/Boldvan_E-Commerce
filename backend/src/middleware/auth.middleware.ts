import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/database';
import { getTokenFromCookieHeader } from '../utils/session';

// Extend the Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        permissions?: string[];
        isSuperAdmin?: boolean;
      };
    }
  }
}

// Resolve the bearer token from the Authorization header or the httpOnly session cookie.
export const getTokenFromRequest = (req: Request): string | null => {
  const header = req.header('Authorization');
  if (header && header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }
  return getTokenFromCookieHeader(req.headers.cookie as string | undefined);
};

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = getTokenFromRequest(req);
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        roleAssignments: {
          include: {
            role: { select: { permissions: true } }
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Aggregate every permission granted through the user's assigned roles
    const permissions = Array.from(
      new Set(user.roleAssignments.flatMap((assignment) => assignment.role.permissions))
    );

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions,
      isSuperAdmin: user.role === 'ADMIN'
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin-tier gate: legacy ADMIN (super admin) OR any user holding at least one role assignment.
export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  if (user?.role === 'ADMIN' || (user?.permissions && user.permissions.length > 0)) {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
};

// Fine-grained permission check. Legacy ADMIN (super admin) bypasses all permission checks;
// other users must hold every required permission through their assigned roles.
export const requirePermission = (...required: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Super admin bypass
    if (user.role === 'ADMIN') {
      return next();
    }

    const owned = new Set(user.permissions || []);
    const hasAll = required.every((permission) => owned.has(permission));
    if (hasAll) {
      return next();
    }

    return res.status(403).json({ message: 'You do not have permission to perform this action' });
  };
};