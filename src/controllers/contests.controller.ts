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

export const enrollInContest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const contestId = req.params.contestId;

  const Pool = getPool();
  const connection = await Pool.getConnection();

  try {
    const [result] = await connection.query<RowDataPacket[]>(
      "SELECT CONTEST_ID FROM CONTESTS WHERE CONTEST_ID = ?",
      [contestId]
    );

    if (!result.length) {
      return new ApiResponse(
        404,
        `no contest with id ${contestId} found!`,
        null
      ).send(res);
    }

    const [q] = await connection.query<ResultSetHeader>(
      "INSERT INTO PARTICIPANTS (CONTEST_ID, USER_ID) VALUES(?, ?)",
      [contestId, req.user.id]
    );
    const participant_id = (q as ResultSetHeader).insertId;
    return new ApiResponse(
      200,
      `enrolled successfully with id ${participant_id}`,
      null
    ).send(res);
  } catch (error: any) {
    return new ApiResponse(500, "internal server error", {
      message: error.message,
      error,
    }).send(res);
  }
};

export const getContestResult = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const contestId = req.params.contestId;
  const Pool = getPool();
  const connection = await Pool.getConnection();

  try {
    const [qResult] = await connection.query<RowDataPacket[]>(
      `
      SELECT RESULTS.CONTEST_ID, RESULTS.RANKING, USERS.NAME, USERS.EMAIL, RESULTS.TOTAL_SCORE
      FROM RESULTS JOIN USERS
      ON RESULTS.USER_ID = USERS.USER_ID
      WHERE RESULTS.CONTEST_ID = ?
      ORDER BY RESULTS.RANKING ASC
      `,
      [contestId]
    );

    if (!qResult.length) {
      return new ApiResponse(
        404,
        `no result found for contest id ${contestId}`,
        null
      ).send(res);
    }

    return new ApiResponse(200, "success", qResult).send(res);
  } catch (error: any) {
    return new ApiResponse(500, error.message, { error }).send(res);
  } finally {
    connection.release();
  }
};

export const submitContest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const contestId: number = Number(req.params.contestId);
  const { userSubmissions } = req.body;
  const Pool = getPool();
  const connection = await Pool.getConnection();

  try {
    // Check if contest exists
    const [qContest] = await connection.query<RowDataPacket[]>(
      "SELECT CONTEST_ID FROM CONTESTS WHERE CONTEST_ID = ?",
      [contestId]
    );

    if (!qContest.length) {
      return new ApiResponse(
        404,
        `Contest with id ${contestId} not found!`,
        null
      ).send(res);
    }

    // If no submissions
    if (!userSubmissions || !userSubmissions.length) {
      return new ApiResponse(200, "No submissions received", {
        contest_id: contestId,
        total_question_attempted: 0,
      }).send(res);
    }

    // Fetch correctness + marks in one query
    const mcqIds = userSubmissions.map((s: any) => s.mcq_id);

    const [mcqData] = await connection.query<RowDataPacket[]>(
      `SELECT m.mcq_id, m.is_correct, q.marks, q.question_id
       FROM mcqs m
       JOIN questions q ON m.question_id = q.question_id
       WHERE m.mcq_id IN (?)`,
      [mcqIds]
    );

    // Create a lookup { mcq_id: { is_correct, marks, question_id } }
    const mcqMap: Record<number, any> = {};
    mcqData.forEach((row) => {
      mcqMap[row.mcq_id] = row;
    });

    // Build submission values with calculated score
    const values = userSubmissions.map((r: any) => {
      const mcqInfo = mcqMap[r.mcq_id];
      const score = mcqInfo && mcqInfo.is_correct ? mcqInfo.marks : 0;
      return [
        mcqInfo?.question_id || r.question_id,
        req.user.id,
        r.mcq_id,
        contestId,
        score,
      ];
    });

    // Bulk insert query
    await connection.query<ResultSetHeader>(
      `INSERT INTO submissions (question_id, submitted_by, mcq_id, contest_id, score)
       VALUES ?`,
      [values]
    );

    return new ApiResponse(200, "Contest submitted successfully", {
      contest_id: contestId,
      total_question_attempted: userSubmissions.length,
    }).send(res);
  } catch (error: any) {
    return new ApiResponse(500, "Internal server error", {
      message: error.message,
      error,
    }).send(res);
  } finally {
    connection.release();
  }
};

export const evaluateContest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const contestId = req.params.contestId;
  const Pool = getPool();
  const connection = await Pool.getConnection();

  try {
    await connection.beginTransaction();

    // Aggregate scores & rankings
    const [qSubmissions] = await connection.query<RowDataPacket[]>(
      `SELECT 
        CONTEST_ID,
        SUBMITTED_BY AS USER_ID,
        SUM(SCORE) AS TOTAL_SCORE,
        RANK() OVER (PARTITION BY CONTEST_ID ORDER BY SUM(SCORE) DESC) AS RANKING
       FROM SUBMISSIONS
       WHERE CONTEST_ID = ?
       GROUP BY CONTEST_ID, SUBMITTED_BY
       ORDER BY RANKING`,
      [contestId]
    );

    if (!qSubmissions.length) {
      await connection.rollback();
      return new ApiResponse(
        400,
        `No submissions for contest id ${contestId}`,
        null
      ).send(res);
    }

    // Clear old results for this contest
    await connection.query("DELETE FROM RESULTS WHERE CONTEST_ID = ?", [
      contestId,
    ]);

    // Prepare values for bulk insert
    const values = qSubmissions.map((s) => [
      s.CONTEST_ID,
      s.USER_ID,
      s.TOTAL_SCORE,
      s.RANKING,
    ]);

    await connection.query<ResultSetHeader>(
      `INSERT INTO RESULTS (CONTEST_ID, USER_ID, TOTAL_SCORE, RANKING)
       VALUES ?`,
      [values]
    );

    await connection.commit();

    return new ApiResponse(
      200,
      `Results calculated successfully for contest ${contestId}`,
      { contest_id: contestId, total_enroll: qSubmissions.length }
    ).send(res);
  } catch (error: any) {
    await connection.rollback();
    return new ApiResponse(500, "Internal server error", {
      message: error.message,
      error,
    }).send(res);
  } finally {
    connection.release();
  }
};
