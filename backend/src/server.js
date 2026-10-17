import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

const startServer = async () => {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });

  process.on("unhandledRejection", (err) => {
    console.error(`UNHANDLED REJECTION! Shutting down ...`, err);
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();
