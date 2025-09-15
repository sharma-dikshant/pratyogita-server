import { Response, Request, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";

import { getPool } from "../../db/config";
import ApiResponse from "../utils/ApiResponse";
import { ResultSetHeader, RowDataPacket } from "mysql2";

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
