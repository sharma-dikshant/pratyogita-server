import { Response, Request, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";

import { getPool } from "../../db/config";
import ApiResponse from "../utils/ApiResponse";
import { ResultSetHeader, RowDataPacket } from "mysql2";

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
