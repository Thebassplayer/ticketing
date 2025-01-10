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
    console.log("Handling this error as a db connection error");
    return res.status(500).send({ message: "Database connection error" });
  }

  res.status(400).send({
    message: err.message || "Something went wrong",
  });
};
