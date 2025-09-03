import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getPool } from "../../db/config";
import ApiResponse from "../utils/ApiResponse";

const createAccessToken = (data: object) => {
  const exp = process.env.JWT_EXPIRE_IN;
  const secret = process.env.JWT_SECRET;

  if (!exp || !secret) {
    throw new Error(
      "JWT_EXPIRE_IN or JWT_SECRET is not defined in environment variables"
    );
  }
  //@ts-ignore
  const token = jwt.sign(data, secret, {
    expiresIn: exp,
  });
  return token;
};

const verifyAccessToken = (token: string) => {
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return true;
  } catch (error) {
    return false;
  }
};

export const protect = (req: Request, res: Response, next: NextFunction) => {
  // get token
  let token: string | null;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.auth) {
    token = req.cookies.auth;
  }

  if (!token) {
    return res.status(403).json({
      message: "you're not logged in!",
    });
  }

  // verify token
  if (!verifyAccessToken(token)) {
    return res.status(403).json({
      message: "invalid access token!",
    });
  }

  const loggedInUser = jwt.decode(token);
  console.log(loggedInUser);
  // append user
  //@ts-ignore
  req.user = { id: 1, role: "admin" };
  next();
};

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({
      message: "invalid name, email or password",
    });

  try {
    const Pool = getPool();
    const connection = await Pool.getConnection();
    const hashedPassword = await bcrypt.hash(password, 10);

    const [qUser] = await connection.query(
      "INSERT INTO USERS (NAME, EMAIL, PASSWORD) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );
    //TODO add role id
    const token = createAccessToken({ id: qUser.insertId, name, email });

    return new ApiResponse(200, "success", {
      id: qUser.insertId,
      name,
      email,
      token,
    }).send(res);
  } catch (error) {
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

    const [qUser] = await connection.query(
      "SELECT USER_ID, PASSWORD FROM USERS WHERE EMAIL = ?",
      [email]
    );
    if (!qUser[0])
      return res.status(404).json({ message: "no user with given email" });

    if (!(await bcrypt.compare(password, qUser[0].PASSWORD)))
      return res.status(400).json({ message: "invalid password" });

    //TODO add role id
    const token = createAccessToken({ id: qUser[0].USER_ID, email });

    return new ApiResponse(200, "success", { token }).send(res);
  } catch (error) {
    return res.status(500).json({
      message: "Internal server Error",
      error: error.message,
    });
  }
};

export const logout = (req: Request, res: Response, next: NextFunction) => {};
