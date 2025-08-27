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

router.use(protect);
router.post("/", uploads.single("file"), createContest);
router.get("/all", getAllContest);
router.get("/:contestId", getContest);

export default router;
