const express = require("express");
const bookController = require("./../controllers/bookController");
const authController = require("./../controllers/authController");
const reviewController = require("./../controllers/reviewController");

const router = express.Router();

// router.param("id", bookController.checkID);

router
  .route("/top-5-termurah")
  .get(bookController.aliasTopBooks, bookController.getAllBook);

router.route("/book-stats").get(bookController.getBookStats);

router.route("/").get(bookController.getAllBook).post(
  authController.protect,
  authController.restrictTo("admin"), // set the api that gonna be public (other entity can access it /use it) and set who are not
  bookController.createBook
);

router
  .route("/:id")
  .get(bookController.getBook)
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    bookController.updateBook
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    bookController.deleteBook
  );

// Make reviews on specified book and get all reviews on specified book
router
  .route("/:bookId/review")
  .get(authController.protect, reviewController.getAllReview)
  .post(
    authController.protect,
    authController.restrictTo("user"),
    reviewController.createReview
  );

module.exports = router;
