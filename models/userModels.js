const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: [true, "Harus mempunyai nama!"],
    maxlength: [50, "Nama harus kurang sama dengan 50 karakter!"],
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Harus mengisi password!"],
    maxlength: [50, "Password harus kurang sama dengan 50 karakter!"],
    minlength: [8, "Password harus memiliki setidaknya 8 karakter!"],
    select: false, // to not show the output when doing find, NOT create
  },
  passwordConfirm: {
    type: String,
    required: [true, "Tolong konfirmasi password Anda!"],
    validate: [
      function () {
        // costum validator ONLY work on CREATE & SAVE. not on findOneAndUpdate or smthing
        return this.password === this.passwordConfirm;
      },
      "Konfirmasi password tidak sama!",
    ],
  },
  email: {
    type: String,
    required: [true, "Harus mengisi email!"],
    maxlength: [50, "Nama harus kurang sama dengan 50 karakter!"],
    lowercase: true,
    validate: [validator.isEmail, "Email tidak valid!"],
    unique: true,
  },
  foto: String,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  passwordResetToken: String,
  // active: {
  //   type: Boolean,
  //   default: true,
  //   select: false,
  // },
});

// ENCRYPTION / HASHING PASSWORD
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // only encrypt when password is modified. i.e when creating first password & update password

  this.password = await bcrypt.hash(this.password, 12); // cost parameter, how cpu intesif the hashing will be
  this.passwordConfirm = undefined; // delete the field, we only use that as validator when user sign up. well yes we required in schema, but only to input NOT to persisted to db
  next();
});

// userSchema.pre(/^find/, function (next) {
//   // this point to current query; since this is query middleware
//   this.find({ active: { $ne: false } });

//   next();
// });

const User = mongoose.model("User", userSchema);

module.exports = User;
