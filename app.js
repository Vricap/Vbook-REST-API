const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const bookRouter = require("./routers/bookRouter");
const userRouter = require("./routers/userRouter");
const reviewRouter = require("./routers/reviewRouter");
const AppError = require("./utils/AppError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

// GLOBAL MIDDLEWARE
// Set security  HTTP headers
app.use(helmet());

// Limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Terlalu banyak request dari IP ini. Coba 1 jam lagi nanti!",
});
app.use("/api", limiter); // only limit in api route

// Development logging
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" })); // limit the body data request

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
// app.use(hpp())

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// MOUNTING
app.use("/api/v1/users", userRouter);
app.use("/api/v1/books", bookRouter);
app.use("/api/v1/reviews", reviewRouter);

// handling undefined route
app.all("*", (req, res, next) => {
  next(new AppError(`Route '${req.originalUrl}' does not exist!`, 404));
});

// GLOBAL ERROR HANDLING
app.use(globalErrorHandler);

module.exports = app;
