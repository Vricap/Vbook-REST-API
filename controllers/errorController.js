const AppError = require("./../utils/AppError");

// GLOBAL ERROR HANDLING

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Programming or other unknown error: don't leak error details
  else {
    // 1) Log error
    console.error("ERROR 💥", err);
    // 2) Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} at ${err.value}`;

  return new AppError(message, 400);
};

const handleDuplicateFieldDB = (err) => {
  const keyValue = JSON.stringify(err.keyValue) // for some reason, mongodb didn't let me the destructuring keyValue to concate to message. so this will do.
    .replace(/"/g, "")
    .replace(/:/g, ": ")
    .replace(/[{}]/g, "'");

  const message = `Duplicate fields at ${keyValue}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const message = `Error at: ${err.message.slice(24, -1)}`;

  return new AppError(message, 400);
};

const handleJWTError = (err) => {
  return new AppError("Invalid token! Please log in again.", 401);
};

const handleTokenExpError = (err) => {
  return new AppError("Token is expired! Please log in again.", 401);
};

const globalErrorHandler = (err, req, res, next) => {
  let error = {
    ...err,
    name: err.name,
    message: err.message,
  }; // hard copy of err object. for some reason, momgoose doesn't give name property when spread operaton, so destructuring like this instead

  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;

  // DURING DEVELOPMENT
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  }
  // DURING PRODUCTION
  else if (process.env.NODE_ENV === "production") {
    // make mongodb / mongoose error (wich not operational ofc) that we need into operational using our own error class
    if (error.name === "CastError") error = handleCastErrorDB(error); // for invalid db id
    if (error.code === 11000) error = handleDuplicateFieldDB(error); // for duplicate db fields
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error); // for validation error that the message we specified in schema
    if (error.name === "JsonWebTokenError") error = handleJWTError(error);
    if (error.name === "TokenExpiredError") error = handleTokenExpError(error);
    sendErrorProd(error, res);
  }
};

module.exports = globalErrorHandler;
