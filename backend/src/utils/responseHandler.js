const sendResponse = (res, { statusCode = 200, success, message, data }) => {
  const body = { success, message };
  if (data !== undefined) body.data = data;
  return res.status(statusCode).json(body);
};

const sendSuccess = (res, { statusCode = 200, message = "Request completed successfully.", data }) =>
  sendResponse(res, { statusCode, success: true, message, data });

const sendFailure = (res, { statusCode = 500, message = "Internal server error.", data }) =>
  sendResponse(res, { statusCode, success: false, message, data });

module.exports = { sendFailure, sendSuccess };
