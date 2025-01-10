import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { RequestalidationError } from "../errors/requestValidationError";
import { DatabaseConnectionError } from "../errors/databaseConnectionError";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").trim().isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new RequestalidationError(errors.array());
    }

    console.log("Creating a user...");

    throw new DatabaseConnectionError();
  }
);

export { router as signupRouter };
