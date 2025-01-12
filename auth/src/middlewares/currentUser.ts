import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface UserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

const jwtSecret = process.env.JWT_KEY!;

export function currentUser(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.jwt) {
    return next();
  }

  try {
    const payload = jwt.verify(req.session.jwt, jwtSecret) as UserPayload;
    req.currentUser = payload;
  } catch (err) {}

  next();
}
