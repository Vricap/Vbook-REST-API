const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, "Review tidak boleh kosong!"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  book: {
    type: mongoose.Schema.ObjectId,
    ref: "Book",
    required: [true, "Review harus kepunyaan sebuah buku!"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Review harus kepunyaan sebuah user!"],
  },
});

// indexing (compound) to avoid duplicate review. achieved by making sure the combination of book & user has always to be unique
reviewSchema.index({ book: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "book",
    select: "nama _id rating penulis",
  }).populate("user"); // populating the referencing id. pass an object to pass option

  next();
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
