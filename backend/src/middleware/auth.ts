import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

export type EntityType = "owner" | "manager" | "admin" | "superadmin";

export interface AuthPayload {
  entityId: string;
  entityType: EntityType;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid token" });
    return;
  }

  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function authorize(...allowed: EntityType[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !allowed.includes(req.user.entityType)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}
