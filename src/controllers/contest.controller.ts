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
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const Pool = getPool();
    const userId = req.user.id;
    const { my, sorted, visibility, page, limit } = req.query;

    // building base query
    let query = `SELECT C.CONTEST_ID, C.TITLE, C.VISIBILITY, C.START_TIME, C.END_TIME FROM
                 CONTESTS AS C`;
    let conditions: string[] = [];
    let params: any[] = [];

    // getting only users contests
    if (my === "true") {
      query = query + " JOIN PARTICIPANTS AS P "
      conditions.push(" P.USER_ID = ? ");
      params.push(userId);
    }
    // sorting
    // pagination

    if (conditions.length) {
      query = query + " WHERE " + conditions.join(" AND ");
    }

    console.log(query);

    const [contests] = await Pool.query(query, params);

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

/**
        {
          contest_id: 1,
          title: test contest,
          description: this is the test contest,
          start_time: 10:20:2025,
          end_time: 01:01:2026,
          result: {
            total_score: 29,
            ranking: 3
          },
          questions: [
            {
              question_id: 101,
              type: mcq,
              description: what is mysql?,
              mcqs: [
                {
                  mcq_id: 1001,
                  option_text: relational database,
                  is_correct: true
                },
              ],
              marked: true,
              score: 2
            },
          ]
        }
   */
export const getContestDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const contestId = req.params.contestId;
  const Pool = getPool();
  const connection = await Pool.getConnection();

  try {
    // GETTING CONTEST
    const [qContest] = await connection.query<RowDataPacket[]>(
      "SELECT CONTEST_ID, TITLE, DESCRIPTION, START_TIME, END_TIME FROM CONTESTS WHERE CONTEST_ID = ?",
      [contestId]
    );

    if (!qContest.length) {
      return new ApiResponse(
        404,
        `contest with id ${contestId} not found`,
        null
      ).send(res);
    }

    const contest = qContest[0];

    // GETTING PARTICIPATION DETAILS
    const [qParticipant] = await connection.query<RowDataPacket[]>(
      "SELECT * FROM PARTICIPANTS WHERE CONTEST_ID = ? AND USER_ID = ?",
      [contestId, req.user.id]
    );

    let result: any = null;
    let questions: any[] = [];

    if (qParticipant.length) {
      // Get contest result if available
      const [qResult] = await connection.query<RowDataPacket[]>(
        "SELECT * FROM RESULTS WHERE CONTEST_ID = ? AND USER_ID = ?",
        [contestId, req.user.id]
      );

      if (qResult.length) {
        result = {
          contest_id: qResult[0].contest_id,
          total_score: qResult[0].total_score,
          ranking: qResult[0].ranking,
        };
      }

      // Fetching questions for the contest
      const [qQuestions] = await connection.query<RowDataPacket[]>(
        `SELECT Q.QUESTION_ID, Q.TYPE, Q.DESCRIPTION, Q.MARKS 
         FROM QUESTIONS AS Q 
         WHERE Q.CONTEST_ID = ?`,
        [contestId]
      );

      for (const Q of qQuestions) {
        // Fetch all MCQ options for this question
        const [qMcqs] = await connection.query<RowDataPacket[]>(
          "SELECT MCQ_ID, OPTION_TEXT, IS_CORRECT FROM MCQS WHERE QUESTION_ID = ?",
          [Q.QUESTION_ID]
        );

        // Check if user has a submission for this question
        const [qSubmission] = await connection.query<RowDataPacket[]>(
          `SELECT SCORE, MCQ_ID, SUBMITTED_AT 
           FROM SUBMISSIONS 
           WHERE QUESTION_ID = ? AND CONTEST_ID = ? AND SUBMITTED_BY = ? 
           ORDER BY SUBMITTED_AT DESC LIMIT 1`,
          [Q.QUESTION_ID, contestId, req.user.id]
        );

        questions.push({
          question_id: Q.QUESTION_ID,
          type: Q.TYPE,
          description: Q.DESCRIPTION,
          marks: Q.MARKS,
          mcqs: qMcqs,
          marked: qSubmission.length > 0,
          selected_mcq_id: qSubmission.length ? qSubmission[0].MCQ_ID : null,
          score: qSubmission.length ? qSubmission[0].SCORE : 0,
        });
      }
    }

    // Final response object
    const finalData = {
      contest_id: contest.CONTEST_ID,
      title: contest.TITLE,
      description: contest.DESCRIPTION,
      start_time: contest.START_TIME,
      end_time: contest.END_TIME,
      result,
      questions,
    };

    return new ApiResponse(200, "success", finalData).send(res);
  } catch (error) {
    console.error("getContestDetails error:", error);
    return new ApiResponse(500, "INTERNAL SERVER ERROR", null).send(res);
  } finally {
    connection.release();
  }
};
