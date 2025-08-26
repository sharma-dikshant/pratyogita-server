import mysql from "mysql2/promise";
let pool;

export async function initDB() {
  try {
    const access_credentials = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };
    pool = mysql.createPool(access_credentials);
    // test connection immediately
    const connection = await pool.getConnection();
    console.log("✅ DB Connected!");
    connection.release(); // release back to pool
    return pool;
  } catch (err) {
    console.error("❌ DB Connection failed:", err.message);
    process.exit(1); // stop the server if DB not connected
  }
}

export function getPool() {
  if (!pool) throw new Error("DB Pool not initialized. Call initDB() first.");
  return pool;
}
