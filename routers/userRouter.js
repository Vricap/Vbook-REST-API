const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/resetPassword/:token").patch(authController.resetPassword);

router.use(authController.protect); // protect all router that comes after this middleware

router.route("/updateMyPassword").patch(authController.updateMyPassword);

router.route("/me").get(userController.getMe);

router.route("/updateMe").patch(userController.updateMe);

router.route("/deleteMe").delete(userController.deleteMe);

router.use(authController.restrictTo("admin"));

router.route("/").get(userController.getAllUser);
router
  .route("/:id")
  .patch(userController.updateUser)
  .get(userController.getUser);

module.exports = router;
