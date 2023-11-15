const dotenv = require("dotenv");
const mongoose = require("mongoose");

// process.on("uncaughtException", (err) => {
//   console.log("UNCAUGHT EXCEPTION! Shutting down...");
//   console.log(err);
//   server.close(() => {
//     process.exit(1); // 0 -> succes, 1 -> uncaught exception
//   });
// });

dotenv.config({ path: "./config.env" });
const app = require("./app");

const DATABASE_STRING = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DATABASE_STRING, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connection succesful!");
  });
// .catch((err) => {
//   const x = {
//     status: `error`,
//     message: err.codeName,
//   };
//   console.log(x);
// });

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

// process.on("unhandledRejection", (err) => {
//   console.log("UNHANDLED REJECTION! Shutting down...");
//   console.log(err);
//   server.close(() => {
//     process.exit(1); // 0 -> succes, 1 -> uncaught exception
//   });
// });
