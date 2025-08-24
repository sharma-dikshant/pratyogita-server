import express from "express";
import mysql from "mysql2/promise";

const app = express();

const access = {
  host: "host",
  user: "mock_user",
  password: "mock_password",
  database: "pratyogita",
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
