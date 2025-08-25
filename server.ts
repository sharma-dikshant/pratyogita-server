import mysql from "mysql2/promise";
import app from "./app";
import dotenv from "dotenv";
dotenv.config({path : "./config.env"});


const access = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

async function main() {
  try {
    const conn = await mysql.createConnection(access);
    console.log("db is connected ✅");

    // Optional: run query here or expose it in routes
    const [rows] = await conn.query("SELECT * FROM users");
    console.log(rows);
  } catch (err) {
    console.error("❌ Failed to connect or query DB:", err);
  }
}

main();

app.listen(3000, () => console.log("Server is listening on port 3000"));
