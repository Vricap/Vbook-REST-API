const Review = require("./../models/reviewModels");
const AppError = require("./../utils/AppError");
const APIFeatures = require("./../utils/APIFeatures");

exports.getAllReview = async (req, res, next) => {
  try {
    let filter = {};
    if (req.params.bookId) filter = { book: req.params.bookId };

    const features = new APIFeatures(Review.find(filter), req.query)
      .filter()
      .sort()
      .fields()
      .page();

    // const reviews = await Review.find(filter);
    const reviews = await features.query;

    res.status(200).json({
      status: "succes",
      results: reviews.length,
      data: {
        reviews,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review)
      return next(new AppError("Tidak ada review dengan ID itu!", 404));

    res.status(200).json({
      status: "succes",
      data: {
        review,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    req.body.user = req.body.user || req.user._id;
    req.body.book = req.body.book || req.params.bookId;
    const review = await Review.create(req.body);

    res.status(201).json({
      status: "succes",
      data: {
        review,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!review)
      return next(new AppError("Tidak ada review dengan ID itu!", 404));

    res.status(200).json({
      status: "succes",
      data: {
        review,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return next(new AppError("ID tidak ada!", 404));

    res.status(204).json({
      status: "succes",
    });
  } catch (err) {
    next(err);
  }
};
