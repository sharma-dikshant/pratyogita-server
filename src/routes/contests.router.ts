import express from "express";
import multer from "multer";

import {
  createContest,
  getContest,
  getAllContest,
  updateContest,
  enrollInContest,
  getContestResult,
  submitContest,
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
//@ts-ignore
router.patch("/:contestId", updateContest); //updating contest

//@ts-ignore
router.post("/:contestId/enroll", enrollInContest); // enrolling to a contest
//@ts-ignore
router.get("/:contestId/result", getContestResult); // result of a contest
//@ts-ignore
router.post("/:contestId/submission", submitContest); // submitting question

export default router;
