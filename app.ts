import express from "express";
import userRouter from "./src/routes/user.router";

const app = express();

app.get("/api/users", userRouter);

export default app;
