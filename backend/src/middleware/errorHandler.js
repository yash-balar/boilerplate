const multer = require("multer");

const errorHandler = (error, _req, res, _next) => {
  let status = error.status || error.statusCode || 500;
  let message = error.message || "Internal server error.";

  if (error.code === 11000) {
    status = 409;
    message = "A record with this value already exists.";
  } else if (error.name === "ValidationError") {
    status = 400;
    message = Object.values(error.errors).map((issue) => issue.message).join(" ");
  } else if (error.name === "CastError") {
    status = 400;
    message = "The requested resource identifier is invalid.";
  } else if (error.type === "entity.parse.failed") {
    status = 400;
    message = "Request body contains invalid JSON.";
  } else if (error instanceof multer.MulterError) {
    status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    message = error.code === "LIMIT_FILE_SIZE"
      ? "The avatar image exceeds the maximum file size."
      : "The uploaded file is invalid.";
  }

  if (status >= 500) console.error(error);
  return res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && status >= 500
      ? { stack: error.stack }
      : {}),
  });
};

module.exports = errorHandler;
