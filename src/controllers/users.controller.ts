import { Response, Request } from "express";
import { getPool } from "../../db/config";

export const createUser = async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const [users] = await pool.query("SELECT * FROM users;");
    res.status(200).json({ message: "testing", data: users });
  } catch (err: any) {
    console.error("DB Query Error:", err);
    res.status(500).json({ error: "DB Error", details: err.message });
  }
};
