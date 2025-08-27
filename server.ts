import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

import app from "./app";
import { initDB } from "./db/config";

async function startServer() {
  await initDB()
    .then(() =>
      // ensures DB is reachable before server starts
      app.listen(3000, () => {
        console.log("🚀 Server is running on port 3000");
      })
    )
    .catch((e) => {
      console.log("SERVER CRASHED 💥", e);
    });
}

startServer();
