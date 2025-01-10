import { ValidationError } from "express-validator";
import { CustomError } from "./customError";

export class RequestalidationError extends CustomError {
  statusCode = 400;
  constructor(public errors: ValidationError[]) {
    super("Invalid request parameters");

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, RequestalidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map(error => {
      return {
        message: error.msg,
        field: error.type === "field" ? error.path : undefined,
      };
    });
  }
}
