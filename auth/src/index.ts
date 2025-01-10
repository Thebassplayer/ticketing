import express, { ErrorRequestHandler } from "express";
import "express-async-errors";
import mongoose from "mongoose";

import { signinRouter } from "./routes/signin";
import { currentUserRouter } from "./routes/currentUser";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";
import { errorHandler } from "./middlewares/errorHandler";
import { NotFoundError } from "./errors/notFoundError";

const app = express();
app.use(express.json());

app.use(signinRouter);
app.use(currentUserRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler as ErrorRequestHandler);

const start = async () => {
  try {
    await mongoose.connect("mongodb://auth-mongo-srv:27017/auth", {});
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(err);
  }
  app.listen(3000, () => {
    console.log("Listening on port 3000");
  });
};

start();
