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

export const getContest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const Pool = getPool();
  const connection = await Pool.getConnection();

  try {
    const [contestRows] = await connection.query<RowDataPacket[]>(
      "SELECT contest_id, title, description FROM CONTESTS WHERE contest_id = ?",
      [req.params.contestId]
    );

    if (contestRows.length === 0) {
      return res.status(404).json({ message: "Contest not found" });
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
