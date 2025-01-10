import { ValidationError } from "express-validator";

export class RequestalidationError extends Error {
  constructor(public errors: ValidationError[]) {
    super();

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, RequestalidationError.prototype);
  }
}
