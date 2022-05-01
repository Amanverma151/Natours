const crypto = require("crypto");
const mongoose = require("mongoose");

const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "The email is not valid"], // fun and err msg
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide your password"],
    minlength: 8, // must be of 8 character
    select: false,
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // This only works on CREATE or SAVE!!!! not on update
      validator: function (el) {
        return el === this.password; // return either true or false
      },
      message: "Password are not the same! ",
    },
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    select: false,
    default: true,
  },
});

// Encrypting the password
userSchema.pre("save", async function (next) {
  // if not modified exit the function and call the next()
  if (!this.isModified("password")) return next();

  // setting the current password to the encrypted verison with a cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// function to chnage the passwordChangedAt prop.
userSchema.pre("save", function (next) {
  // if we do not modify the password prop or the doc is new
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Query middleware for the query that starts with find like find and update
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } }); // this points to the current query
  next();
});

// Creating an instance function to compare the password in the database and the one that user entered
userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  // candidatePassword is not hashed it is coming from the user , userPassword is hashed.
  return await bcrypt.compare(candidatePassword, userPassword);
};

// instance function to check if the user has changed the password or not
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // it means return true if the password is changed after the token was issued
    return JWTTimestamp < changedTimestamp;
  }

  // Not changed
  return false;
};

// instance function to generate a random token
userSchema.methods.createRandomResetToken = function () {
  // for generating the random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // For encrypting the reset token, this will be stored in the database.
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);

  // password expires in 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // returning the plaintext resettoken/ unencrypted resetToken on the email
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
