import express from "express";
import userRouter from "./src/routes/users.router";
import morgan from "morgan";

const app = express();

/* GLOBAL MIDDLEWARES */
app.use(morgan("dev"));


/* ROUTE MIDDLEWARES */
app.use("/api/users", userRouter);

export default app;
