const http = require("node:http");
const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be configured and contain at least 32 characters.");
}
if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI must be configured.");
}

const app = require("./app");
const connectDatabase = require("./config/database");
const port = Number(process.env.PORT || 5000);

const startServer = async () => {
  await connectDatabase();
  const server = http.createServer(app);

  server.listen(port, () => {
    console.info(`API listening on port ${port}.`);
  });

  const shutdown = (signal) => {
    console.info(`${signal} received; shutting down.`);
    server.close(async () => {
      const mongoose = require("mongoose");
      await mongoose.disconnect();
      process.exit(0);
    });
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

startServer().catch((error) => {
  console.error("Server startup failed:", error);
  process.exitCode = 1;
});
