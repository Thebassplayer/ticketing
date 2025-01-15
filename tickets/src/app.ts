import express, { ErrorRequestHandler } from "express";
import "express-async-errors";
import cookieSession from "cookie-session";

import { errorHandler, NotFoundError, currentUser } from "@rldtickets/common";
import { createTicketRouter } from "./routes/new";

const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

app.use(currentUser);
app.use((req, res, next) => {
  console.log("Request Session", req.session);
  console.log("Request received", req.url);
  console.log(req.currentUser);
  next();
});

app.use(createTicketRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler as ErrorRequestHandler);

export { app };
