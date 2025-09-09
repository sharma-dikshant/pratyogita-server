import express from "express";
import {
  login,
  logout,
  signup,
  protect,
  getLoggedInUser,
} from "../controllers/auth.controller";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/logout", logout);
//@ts-ignore
router.get("/me", protect, getLoggedInUser);

export default router;
