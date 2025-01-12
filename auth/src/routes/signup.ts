import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { RequestalidationError } from "../errors/requestValidationError";
import { User } from "../models/user";
import { BadRequestError } from "../errors/badRequestError";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_KEY!;

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
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new RequestalidationError(errors.array());
    }

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("Email in use");
    }
    const user = User.build({ email, password });
    try {
      await user.save();
      const userJwt = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        jwtSecret
      );
      req.session = {
        jwt: userJwt,
      };
    } catch (err) {
      throw new BadRequestError("Error saving user");
    }

    res.status(201).send(user);
  }
);

export { router as signupRouter };
