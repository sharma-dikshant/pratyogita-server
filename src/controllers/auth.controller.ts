import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getPool } from "../../db/config";
import ApiResponse from "../utils/ApiResponse";
import { FieldPacket, ResultSetHeader, RowDataPacket } from "mysql2";

// ---------------- JWT helpers ----------------
const createAccessToken = (data: Record<string, unknown>): string => {
  const exp = process.env.JWT_EXPIRE_IN;
  const secret = process.env.JWT_SECRET;

  if (!exp || !secret) {
    throw new Error(
      "JWT_EXPIRE_IN or JWT_SECRET is not defined in environment variables"
    );
  }

  //@ts-ignore
  return jwt.sign(data, secret, { expiresIn: exp });
};

const verifyAccessToken = (token: string): JwtPayload | string | null => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
};

// ---------------- Controllers ----------------
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "invalid name, email or password" });
  }

  try {
    const Pool = getPool();
    const connection = await Pool.getConnection();
    const hashedPassword = await bcrypt.hash(password, 10);

    const [qUser] = await connection.query<ResultSetHeader>(
      "INSERT INTO USERS (NAME, EMAIL, PASSWORD) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    const token = createAccessToken({
      id: qUser.insertId,
      role_id: 3, // register only participants
      email,
    });

    return new ApiResponse(200, "success", {
      id: qUser.insertId,
      name,
      email,
      token,
    }).send(res);
  } catch (error: any) {
    return res.status(500).json({
      message: "Internal server Error",
      error: error.message,
    });
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  try {
    const Pool = getPool();
    const connection = await Pool.getConnection();

    const [qUser] = await connection.query<RowDataPacket[]>(
      "SELECT USER_ID, PASSWORD, ROLE_ID FROM USERS WHERE EMAIL = ?",
      [email]
    );

    if (!qUser.length) {
      return res.status(404).json({ message: "no user with given email" });
    }

    if (!(await bcrypt.compare(password, qUser[0].PASSWORD))) {
      return res.status(400).json({ message: "invalid password" });
    }

    const token = createAccessToken({
      id: qUser[0].USER_ID,
      role_id: qUser[0].ROLE_ID,
      email,
    });

    return new ApiResponse(200, "success", { token }).send(res);
  } catch (error: any) {
    return res.status(500).json({
      message: "Internal server Error",
      error: error.message,
    });
  }
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  // Implementation depends on whether you're handling tokens in cookies or headers
  return res.status(200).json({ message: "logged out successfully" });
};

// ---------------- Middleware ----------------
export const protect = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // get token
  let token: string | null = null;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.auth) {
    token = req.cookies.auth;
  }

  if (!token) {
    return res.status(403).json({ message: "you're not logged in!" });
  }

  // verify token
  const verified = verifyAccessToken(token);
  if (!verified || typeof verified === "string") {
    return res.status(403).json({ message: "invalid access token!" });
  }

  // append user
  req.user = verified as { id: number; role_id: number; email: string };
  return next();
};

export const restricted = (...roles: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const Pool = getPool();
      const connection = await Pool.getConnection();

      const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.query<
        RowDataPacket[]
      >("SELECT ROLE_NAME FROM ROLES WHERE ROLE_ID = ?", [req.user.role_id]);

      const userRole = rows[0]?.ROLE_NAME ?? null;
      if (!roles.includes(userRole)) {
        return res.status(403).json({
          message: "you're not allowed to access this service",
        });
      }

      next();
    } catch (error: any) {
      return res.status(500).json({
        message: "internal server error",
        error: error.message,
      });
    }
  };
};
