class AppError extends Error {
  constructor(message, statusCode) {
    super();
    this.message = message;
    this.statusCode = statusCode;
    this.status = `${this.statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // to tell that this is operational error

    Error.captureStackTrace(this, this.constructor); // to preserve the stack trace to help see where in line the error happen
  }
}
module.exports = AppError;
