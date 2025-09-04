import express from "express";
import multer from "multer";

import {
  createContest,
  getContest,
  getAllContest,
} from "./../controllers/contests.controller";
import { protect } from "./../controllers/auth.controller";

const router = express.Router();
const uploads = multer({ dest: "./uploads" });

//@ts-ignore
//TODO fix -> may be by using global error middleware
router.use(protect);
//@ts-ignore
router.post("/", uploads.single("file"), createContest);
router.get("/all", getAllContest);
router.get("/:contestId", getContest);

export default router;
