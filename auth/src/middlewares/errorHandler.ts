import { Request, Response, NextFunction } from "express";
import { RequestalidationError } from "../errors/requestValidationError";
import { DatabaseConnectionError } from "../errors/databaseConnectionError";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof RequestalidationError) {
    const formattedErrors = err.errors.map(error => {
      if (error.type === "field") {
        return {
          message: error.msg,
          field: error.path,
          location: error.location,
        };
      }
      return { message: error.msg, field: null };
    });

    return res.status(400).send({ errors: formattedErrors });
  }

  if (err instanceof DatabaseConnectionError) {
    return res.status(500).send({ errors: [{ message: err.reason }] });
  }

  res.status(400).send({
    errors: [{ message: "Something went wrong" }],
  });
};
