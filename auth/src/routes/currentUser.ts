import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_KEY!;

const router = express.Router();

router.get("/api/users/currentuser", (req: Request, res: Response) => {
  if (!req.session?.jwt) {
    res.send({ currentUser: null });
    return;
  }

  try {
    const payload = jwt.verify(req.session.jwt, jwtSecret);
    res.send({ currentUser: payload });
  } catch (err) {
    res.send({ currentUser: null });
  }
});

export { router as currentUserRouter };
