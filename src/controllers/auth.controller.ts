import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getPool } from "../../db/config";
import ApiResponse from "../utils/ApiResponse";
import { FieldPacket, ResultSetHeader, RowDataPacket } from "mysql2";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
      user: {
        id: qUser.insertId,
        name,
        email,
      },
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
      "SELECT USER_ID, PASSWORD, ROLE_ID, NAME FROM USERS WHERE EMAIL = ?",
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

    return new ApiResponse(200, "success", {
      token,
      user: { id: qUser[0].USER_ID, name: qUser[0].NAME, email, role_id: qUser[0].ROLE_ID },
    }).send(res);
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

export const getLoggedInUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const Pool = getPool();
    const connection = await Pool.getConnection();
    const [qUser] = await connection.query<RowDataPacket[]>(
      "SELECT USER_ID, NAME, EMAIL, ROLE_ID FROM USERS WHERE USER_ID = ?",
      [req.user.id]
    );

    return new ApiResponse(200, "success", {
      user: {
        id: qUser[0].USER_ID,
        name: qUser[0].NAME,
        email: qUser[0].EMAIL,
        role_id: qUser[0].ROLE_ID
      },
    }).send(res);
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
      error,
    });
  }
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

export const googleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const idToken = req.body.id_token as string | undefined;

  if (!idToken)
    return res.status(400).json({ message: "id_token is required" });

  try {
    // verify token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload)
      return res.status(400).json({ message: "invalid Google token" });

    const googleId = payload.sub; // unique google id
    const name = payload.name;
    const email = payload.email;

    const Pool = getPool();
    const connection = await Pool.getConnection();

    try {
      // 1: find if user already exists with this googleId or email
      const [rows] = await connection.query<RowDataPacket[]>(
        "SELECT USER_ID, NAME, EMAIL, GOOGLE_ID, METHOD FROM USERS WHERE GOOGLE_ID = ? OR EMAIL = ?",
        [googleId, email]
      );

      let user_id: number;
      let db_name = name;

      if (rows.length) {
        // existing user found
        const user = rows[0];
        user_id = user.USER_ID;

        // if an account exists but with method == local then tell user to verify with the password
        if (!user.GOOGLE_ID && user.METHOD === "local") {
          return res.status(409).json({
            message:
              "An account with this email already exists. Please login with your password",
          });
        }

        db_name = user.NAME ?? db_name;
      } else {
        // create new user
        const [result] = await connection.query<ResultSetHeader>(
          "INSERT INTO USERS (NAME, EMAIL, ROLE_ID, GOOGLE_ID, METHOD) VALUES (?, ?, ?, ?, ?)",
          [name, email, 3, googleId, "google"]
        );

        user_id = (result as ResultSetHeader).insertId;
      }

      // creating access token
      const token = createAccessToken({
        id: user_id,
        role_id: 3,
        email,
      });

      return new ApiResponse(200, "success", {
        token,
        user: { id: user_id, name: db_name, email, role_id: 3 },
      }).send(res);
    } finally {
      connection.release();
    }
  } catch (err: any) {
    console.error("googleLogin err:", err);
    return res
      .status(500)
      .json({ message: "Google login failed", error: err.message });
  }
};
