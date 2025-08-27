import fs from "fs";
import csv from "csv-parser";
import { getPool } from "../../db/config";

export const createContest = async (req, res) => {
  const Pool = getPool();
  /* 1.Create New Contest */
  const contestDetails = {
    title: req.body.title,
    description: req.body.description,
    created_by: req.user.id,
    visibility: req.body.visibility || "private",
  };

  const [cResult] = await Pool.query(
    "INSERT INTO contests (title, description, created_by, visibility) VALUES (?, ?, ?, ?)",
    [
      contestDetails.title,
      contestDetails.description,
      contestDetails.created_by,
      contestDetails.visibility,
    ]
  );

  const contest_id = cResult.insertId;
  /* 2.Create Questions */
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => results.push(row))
    .on("end", async () => {
      try {
        for (const q of results) {
          const [qResult] = await Pool.query(
            "INSERT INTO QUESTIONS (contest_id, type, description, marks) VALUES (?, ?, ?, ?)",
            [contest_id, q.type, q.description, q.marks]
          );

          const question_id = qResult.insertId;
          /* 2.1 Options for each question */
          const options = [];
          for (let i = 1; i <= 4; i++) {
            const [qOption] = await Pool.query(
              "INSERT INTO MCQS (question_id, option_text, is_correct) VALUES (?, ?, ?)",
              [question_id, q[`option_${i}`], false]
            );
            options.push(qOption.insertId);
          }

          /* Mark Correct OPtion */
          await Pool.query("UPDATE MCQS SET is_correct = ? WHERE mcq_id = ?", [
            true,
            options[q.correct_option_no - 1],
          ]);
        }
        res.status(200).json({ message: "success", data: { contest_id } });
      } catch (error) {
        res
          .status(500)
          .json({ message: "failed", error: "Failed to create Contest" });
      }
    });
};
