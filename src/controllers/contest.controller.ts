import fs from "fs";
import csv from "csv-parser";

import { Response, Request, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";

import { getPool } from "../../db/config";
import ApiResponse from "../utils/ApiResponse";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Multer } from "multer";

/* CREATE CONTEST */
// question_no,type,description,option_1,option_2,option_3,option_4,correct_option_no,marks
type Question = {
  question_no: number;
  type: string;
  description: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  correct_option_no: number;
  marks: number;
};

export const createContest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const Pool = getPool();
  const connection = await Pool.getConnection(); // get dedicated connection

  try {
    await connection.beginTransaction(); // Start transaction

    /* 1. Create Contest */
    const [cResult] = await connection.query<ResultSetHeader>(
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

    const results: Question[] = [];
    fs.createReadStream(req.file!.path)
      .pipe(csv())
      .on("data", (row: Question) => results.push(row))
      .on("end", async () => {
        try {
          for (const q of results) {
            // Insert question
            const [qResult] = await connection.query<ResultSetHeader>(
              "INSERT INTO QUESTIONS (contest_id, type, description, marks) VALUES (?, ?, ?, ?)",
              [contest_id, q.type, q.description, q.marks]
            );
            const question_id = qResult.insertId;

            // Insert options
            const options = [];
            for (let i = 1; i <= 4; i++) {
              const optionKey = `option_${i}` as keyof Question;
              if (!q[optionKey]) {
                throw new Error(
                  `Missing option_${i} for question: ${q.description}`
                );
              }

              const [qOption] = await connection.query<ResultSetHeader>(
                "INSERT INTO MCQS (question_id, option_text, is_correct) VALUES (?, ?, ?)",
                [question_id, q[optionKey], false]
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
          return new ApiResponse(200, "contest created successfully", {
            contest_id: contest_id,
          }).send(res);
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

export const getContest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  /* GET CONTEST */
  /**
    {
      contest_id: 1,
      title: test contest,
      description: this is test assessment,
      questions: [
        {
          question_id: 1,
          type: mcqs,
          description: what is type declaration,
          marks: 2,
          options: [
            {
              mcq_id: 1,
              option_text: type checking
            },
          ]
        },
      ]
    } 

   */

  const Pool = getPool();
  const connection = await Pool.getConnection();

  try {
    const [contestRows] = await connection.query<RowDataPacket[]>(
      "SELECT contest_id, title, description FROM CONTESTS WHERE contest_id = ?",
      [req.params.contestId]
    );

    if (contestRows.length === 0) {
      return new ApiResponse(404, "contest not found", null).send(res);
    }

    const contest = contestRows[0];

    const [questions] = await connection.query<RowDataPacket[]>(
      "SELECT question_id, type, description, marks FROM QUESTIONS WHERE contest_id = ?",
      [req.params.contestId]
    );

    // fetch options for each question
    for (const q of questions) {
      const [options] = await connection.query(
        "SELECT mcq_id, option_text FROM MCQS WHERE question_id = ?",
        [q.question_id]
      );
      q.options = options;
    }

    const result = {
      ...contest,
      questions,
    };

    return new ApiResponse(200, "Successfully fetched contest", result).send(
      res
    );
  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};

export const getAllContest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const Pool = getPool();
    const [contests] = await Pool.query(
      "SELECT contest_id, title, description, visibility FROM CONTESTS"
    );

    return new ApiResponse(200, "sucess", contests).send(res);
  } catch (error: any) {
    res.status(500).json({
      message: "failed",
      error: `INTERNAL SERVER ERROR: ${error.message}`,
    });
  }
};

export const updateContest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { title, description, visibility, start_time, end_time } = req.body;
  const contestId = req.params.contestId;
  const Pool = getPool();
  const connection = await Pool.getConnection();

  try {
    // Check if contest exists
    const [contest] = await connection.query<RowDataPacket[]>(
      "SELECT * FROM CONTESTS WHERE CONTEST_ID = ?",
      [contestId]
    );

    if (!contest.length) {
      return new ApiResponse(
        404,
        `Contest with id ${contestId} not found`,
        null
      ).send(res);
    }

    // Collect fields to update
    const fields: string[] = [];
    const values: string[] = [];

    if (title !== undefined) {
      fields.push("TITLE = ?");
      values.push(title);
    }
    if (description !== undefined) {
      fields.push("DESCRIPTION = ?");
      values.push(description);
    }
    if (visibility !== undefined) {
      fields.push("VISIBILITY = ?");
      values.push(visibility);
    }
    if (start_time !== undefined) {
      fields.push("START_TIME = ?");
      values.push(start_time);
    }
    if (end_time !== undefined) {
      fields.push("END_TIME = ?");
      values.push(end_time);
    }

    if (fields.length === 0) {
      return new ApiResponse(400, "No fields provided for update", null).send(
        res
      );
    }

    // Add contestId at the end
    values.push(contestId);

    // Build query dynamically
    const query = `UPDATE CONTESTS SET ${fields.join(
      ", "
    )} WHERE CONTEST_ID = ?`;

    const [updateResult] = await connection.query(query, values);

    if ((updateResult as any).affectedRows === 0) {
      return new ApiResponse(400, "No changes made", null).send(res);
    }

    // Fetch updated contest
    const [updatedContest] = await connection.query<RowDataPacket[]>(
      "SELECT * FROM CONTESTS WHERE CONTEST_ID = ?",
      [contestId]
    );

    return new ApiResponse(
      200,
      "Contest updated successfully",
      updatedContest[0]
    ).send(res);
  } catch (error: any) {
    return new ApiResponse(500, "Internal server error", {
      message: error.message,
      error,
    }).send(res);
  } finally {
    connection.release();
  }
};
