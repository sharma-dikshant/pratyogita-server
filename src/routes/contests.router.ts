import express from "express";
import multer from "multer";

import { createContest, getContest, getAllContest, updateContest } from '../controllers/contest.controller';
import { enrollInContest } from '../controllers/participant.controller';
import { submitContest, evaluateContest}  from '../controllers/submission.controller';
import { getContestResult } from '../controllers/result.controller'
import { protect, restricted } from "./../controllers/auth.controller";

const router = express.Router();
const uploads = multer({ dest: "./uploads" });

//@ts-ignore
//TODO fix -> may be by using global error middleware
router.use(protect);
router.get("/all", getAllContest);
//@ts-ignore
router.get("/:contestId", getContest);
//@ts-ignore
router.post("/:contestId/enroll", enrollInContest); // enrolling to a contest
//@ts-ignore
router.get("/:contestId/result", getContestResult); // result of a contest
//@ts-ignore
router.post("/:contestId/submission", submitContest); // submitting question

//@ts-ignore
router.use(restricted("admin"));
//@ts-ignore
router.post("/", uploads.single("file"), createContest);
//@ts-ignore
router.patch("/:contestId", updateContest); //updating contest
//@ts-ignore
router.get("/:contestId/evaluate", evaluateContest);

export default router;
