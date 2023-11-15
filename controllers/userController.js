const User = require("./../models/userModels");
const AppError = require("./../utils/AppError");
const APIFeatures = require("./../utils/APIFeatures");

// for user to update itself
exports.updateMe = async (req, res, next) => {
  try {
    // 1) Create error if user POSTed password
    if (req.body.password || req.body.passwordConfirm)
      return next(
        new AppError(
          "Route ini bukan untuk update password! Tolong gunakan /updatePassword",
          400
        )
      );

    // 2) Filtered out uwanted field names that are not allowed to updated
    const sanitazed = {
      email: req.body.email || req.user.email,
      nama: req.body.nama || req.user.nama,
    };

    // 3) Update user document
    const user = await User.findByIdAndUpdate(req.user._id, sanitazed, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "succes",
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

// for admin to update user
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id.req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) return next(new AppError("Tidak ada user dengan ID itu!", 404));

    res.status(200).json({
      status: "succes",
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

// for user to delete itself (when logged ofc)
exports.deleteMe = async (req, res, next) => {
  try {
    // await User.findByIdAndUpdate(req.user._id, { active: false });
    await User.findByIdAndDelete(req.user._id);

    res.status(200).json({
      status: "succes",
      data: null,
    });
  } catch (err) {}
};

// for admin to delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(new AppError("Tidak ada user dengan ID itu!", 404));

    res.status(204).json({
      status: "succes",
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllUser = async (req, res, next) => {
  try {
    const features = new APIFeatures(User.find(), req.query)
      .filter()
      .sort()
      .fields()
      .page();

    const users = await features.query;

    res.status(200).json({
      status: "succes",
      results: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
    next(err);
  }
};

// user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return next(new AppError("Tidak ada user dengan ID itu!", 404));

    res.status(200).json({
      status: "succes",
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError("Tidak ada user dengan ID itu!", 404));

    res.status(200).json({
      status: "succes",
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};
