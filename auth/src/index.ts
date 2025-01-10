import express, { ErrorRequestHandler } from "express";
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

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
