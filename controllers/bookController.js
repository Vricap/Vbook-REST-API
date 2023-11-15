const { json } = require("express");
const Book = require("./../models/bookModels");
const APIFeatures = require("./../utils/APIFeatures");
const AppError = require("./../utils/AppError");

exports.aliasTopBooks = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = "-rating harga";

  next();
};

exports.getAllBook = async (req, res, next) => {
  try {
    // BUILD QUERY

    // EXECUTE QUERY
    const features = new APIFeatures(Book.find(), req.query)
      .filter()
      .sort()
      .fields()
      .page();

    const books = await features.query;

    res.status(200).json({
      status: "Succes",
      results: books.length,
      requestedAt: req.requestTime,
      data: {
        books,
      },
    });
  } catch (err) {
    // in controller, we dont pass our own error with AppError, cuz the error that get catch is mongoose error, and well theres many mongoose error so we cant defined
    next(err);
  }
};

exports.getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate("reviews");
    if (!book) return next(new AppError("No Book found!", 404));
    res.status(200).json({
      status: "Succes",
      data: {
        book,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.createBook = async (req, res, next) => {
  try {
    const newBook = await Book.create(req.body);

    res.status(201).json({
      status: "Succes",
      data: {
        book: newBook,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateBook = async (req, res, next) => {
  try {
    // await Book.updateOne({ _id: req.params.id }, req.body);
    // const book = await Book.findById(req.params.id);

    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // to return the new updated document,
      runValidators: true, // to run validator again
    });
    if (!book) return next(new AppError("No Book found with that ID!", 404));

    res.status(200).json({
      status: "Succes",
      data: {
        book,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteBook = async (req, res, next) => {
  try {
    // await Book.deleteOne({ _id: req.params.id });
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return next(new AppError("No Book found with that ID!", 404));

    res.status(204).json({
      status: "Succes",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

exports.getBookStats = async (req, res, next) => {
  try {
    const stats = await Book.aggregate([
      {
        $match: { rating: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: "$kategori" },
          numBook: { $sum: 1 },
          numRating: { $sum: "$ratingKuantitas" },
          avgRating: { $avg: "$rating" },
          avgPrice: { $avg: "$harga" },
          maxPrice: { $max: "$harga" },
          minPrice: { $min: "$harga" },
          bookName: { $push: "$nama" },
        },
      },
      {
        $sort: { avgRating: -1 },
      },
      // {
      //   // $match: { _id: { $ne: "BENTANG PUSTAKA" } }, // exluding some stuff
      // },
    ]);

    res.status(200).json({
      status: "Succes",
      data: {
        stats,
      },
    });
  } catch (err) {
    next(err);
  }
};
