import { Response, Request, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";

import { getPool } from "../../db/config";
import ApiResponse from "../utils/ApiResponse";
import { ResultSetHeader, RowDataPacket } from "mysql2";



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