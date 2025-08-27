import fs from "fs";
import csv from "csv-parser";
import { getPool } from "../../db/config";

export const createContest = async (req, res) => {
  const Pool = getPool();
  const connection = await Pool.getConnection(); // get dedicated connection

  try {
    await connection.beginTransaction(); // Start transaction

    /* 1. Create Contest */
    const [cResult] = await connection.query(
      "INSERT INTO contests (title, description, created_by, visibility) VALUES (?, ?, ?, ?)",
      [
        req.body.title,
        req.body.description,
        req.user.id,
        req.body.visibility || "private",
      ]
    );

    const contest_id = cResult.insertId;

    /* 2. Parse CSV */
    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => results.push(row))
      .on("end", async () => {
        try {
          for (const q of results) {
            // Insert question
            const [qResult] = await connection.query(
              "INSERT INTO QUESTIONS (contest_id, type, description, marks) VALUES (?, ?, ?, ?)",
              [contest_id, q.type, q.description, q.marks]
            );
            const question_id = qResult.insertId;

            // Insert options
            const options = [];
            for (let i = 1; i <= 4; i++) {
              if (!q[`option_${i}`]) {
                throw new Error(
                  `Missing option_${i} for question: ${q.description}`
                );
              }

              const [qOption] = await connection.query(
                "INSERT INTO MCQS (question_id, option_text, is_correct) VALUES (?, ?, ?)",
                [question_id, q[`option_${i}`], false]
              );
              options.push(qOption.insertId);
            }

            // Validate and mark correct option
            if (q.correct_option_no < 1 || q.correct_option_no > 4) {
              throw new Error(
                `Invalid correct_option_no for question: ${q.description}`
              );
            }

            await connection.query(
              "UPDATE MCQS SET is_correct = ? WHERE mcq_id = ?",
              [true, options[q.correct_option_no - 1]]
            );
          }

          // All inserts succeeded
          await connection.commit();
          res.status(200).json({ message: "Contest created successfully" });
        } catch (err) {
          // Something failed → rollback
          await connection.rollback();
          console.error("Transaction failed:", err);
          res.status(500).json({ error: "Failed to create contest" });
        } finally {
          connection.release();
        }
      });
  } catch (err) {
    await connection.rollback();
    connection.release();
    res.status(500).json({ error: "Unexpected server error" });
  }
};
