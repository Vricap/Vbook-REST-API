const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Book = require("./../../models/bookModels");
const Review = require("./../../models/reviewModels");
const User = require("./../../models/userModels");

dotenv.config({ path: `${__dirname}/../../config.env` });

mongoose
  .connect(
    process.env.DATABASE.replace("<password>", process.env.DATABASE_PASSWORD),
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connections Succesfull");
  });

const book = JSON.parse(fs.readFileSync(`${__dirname}/books.json`, "utf-8"));
const user = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
const review = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, "utf-8")
);

// for (let i = 0; i < obj.length; i++) {
//   const newBook = new Book(obj[i]);
//   newBook.save();
// }

const importDatabase = async () => {
  try {
    // await Book.create(book);
    // await User.create(user, { validateBeforeSave: false });
    // await Review.create(review, { validateBeforeSave: false });

    console.log("Import data to database complete!");
  } catch (err) {
    console.log(`Import data fail!: \n${err.message}`);
  }
  process.exit();
};

const deleteDatabase = async () => {
  try {
    // await Book.deleteMany();
    // await User.deleteMany();
    // await Review.deleteMany();

    console.log("Delete data from database complete!");
  } catch (err) {
    console.log(`Import data fail!: \n${err.message}`);
  }
  process.exit();
};

if (process.argv[2] === "--import") importDatabase();
else if (process.argv[2] === "--delete") deleteDatabase();
