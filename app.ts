import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import userRouter from "./src/routes/users.router";
import contestRouter from "./src/routes/contests.router";
import authRouter from "./src/routes/auth.router";
// import { protect, restricted } from "./src/controllers/auth.controller";

const app = express();

/* GLOBAL MIDDLEWARES */
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

/* ROUTE MIDDLEWARES */
app.use("/api/users", userRouter);
app.use("/api/contests", contestRouter);
app.use("/api/auth", authRouter);
// app.get("/api/test", protect, restricted("admin", "participant"));

export default app;
