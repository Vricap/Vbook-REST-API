const crypto = require("crypto"); // node built in module to
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./../models/userModels");
const AppError = require("./../utils/AppError");
const sendEmail = require("./../utils/email");

// Asigning a Token
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = async (res, statusCode, user) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 // convert idk what
    ),
    httpOnly: true, // so that browser can't modified the cookie
    secure: false,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true; // only send cookie in https request

  res.cookie("jwt", token, cookieOptions);

  // remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "succes",
    token,
    data: {
      user,
    },
  });
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      // only select what we only want, so that user cannot change role as admin
      nama: req.body.nama,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      foto: req.body.foto,
      role: req.body.role,
    });

    createAndSendToken(res, 201, newUser);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // 1) Check if email and password inputted
    if (!email || !password) {
      return next(new AppError("Tolong masukan Email dan Password", 400));
    }

    // 2) Check if user exist && passowrd correct
    const user = await User.find({ email: email }).select("+password"); // explicit select password cuz and in schema we unselected & here we need it
    if (!user[0])
      return next(new AppError("Tidak ada user dengan email itu!", 401));

    const comparedPassword = await bcrypt.compare(password, user[0].password);
    if (!comparedPassword) return next(new AppError("Password salah!", 401));

    // 3) If everything ok, send token
    createAndSendToken(res, 201, user[0]);
  } catch (err) {
    next(err);
  }
};

exports.protect = async (req, res, next) => {
  // 1) Getting the token and check if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token)
    return next(
      new AppError(
        "Anda tidak login! Tolong login untuk mendapatkan akses.",
        401
      )
    );

  // 2) Verification token
  // check if token invalid || has exxpired
  let decoded;
  jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
    if (err) return next(err);
    decoded = data; // decoded will return payload obj with id, exp, iat
  });

  // 3) Check if user still exist (opsional)
  // if user is deleted, the token that given should no longer valid
  const currentUser = await User.findById(decoded.id).select("+password"); // explicit select password cuz and in schema we unselected & here we need it
  if (!currentUser) {
    return next(
      new AppError(
        "Pengguna yang termasuk dalam token ini sudah tidak ada lagi!",
        401
      )
    );
  }

  // 4) Check if user changed password after the token issued (opsional)
  // not yet implemented

  // GRANT ACCCES TO PROTECTED ROUTE
  req.user = currentUser; // assigned current user to req obj to use it in next middleware. cuz well req obj is the one who travelling across middleware
  next();
};

exports.restrictTo = (...roles) => {
  // have to do this cuz we can't pass own argumet in middleware
  return (req, res, next) => {
    console.log(req.user.role);
    if (!roles.includes(req.user.role))
      // use the req.user from middleware before
      return next(
        new AppError("Anda tidak punya izin untuk melakukan aksi ini!.", 403)
      );
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  // receive email address
  // 1) Get user based on POSTed email
  let user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError("Tidak ada user dengan email itu!", 404));

  // 2) Generate the random reset token
  const resetToken = crypto.randomBytes(32).toString("hex"); // create random string (token), send the uncrypted token to user email
  user.passwordResetToken = crypto // hash the token. save the encrypted token to user db
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  await user.save({ validateBeforeSave: false });

  // 3) Sent it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Lupa password mu? Kirim request PATCH dengan password barumu dan passwordConfirm ke: ${resetURL}\nJika kamu tidak lupa password, lupakan email ini.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your Password reset token.",
      message,
    });

    res.status(200).json({
      status: "succes",
      message: "Token terkirim ke email.",
    });
  } catch (err) {
    // if theres error, reset the token
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("Terdapat error dalam mengirim email. Coba lagi nanti!"),
      500
    );
  }
};

exports.resetPassword = async (req, res, next) => {
  // receive new password & token
  try {
    // 1) Get user based on token
    const userToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({ passwordResetToken: userToken });

    // 2) If the token match, set the new password
    if (!user) return next(new AppError("Token tidak valid!", 401));
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    await user.save();

    // 3) Log the user in; send JWT
    createAndSendToken(res, 200, user);
  } catch (err) {
    next(err);
  }
};

exports.updateMyPassword = async (req, res, next) => {
  try {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select("+password");

    // 2) Check if POSTed current password is correct
    const comparedPassword = await bcrypt.compare(
      req.body.currentPassword,
      user.password
    );
    if (!comparedPassword)
      return next(new AppError("Password sekarang salah!", 401));

    // 3) If so, update password
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;
    await user.save();

    // 4) Log user in, send JWT
    createAndSendToken(res, 200, user);
  } catch (err) {
    next(err);
  }
};
