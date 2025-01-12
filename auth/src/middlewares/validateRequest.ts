import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { RequestalidationError } from "../errors/requestValidationError";

export function validateRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new RequestalidationError(errors.array());
  }

  next();
}
