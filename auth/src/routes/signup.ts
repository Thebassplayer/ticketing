import express, { Request, Response } from "express";
import { body } from "express-validator";
import { User } from "../models/user";
import { BadRequestError } from "../errors/badRequestError";
import jwt from "jsonwebtoken";
import { validateRequest } from "../middlewares/validateRequest";

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
  validateRequest,
  async (req: Request, res: Response): Promise<void> => {
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
