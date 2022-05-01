const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Email = require("../utils/email");

// function to create a new token
// eslint-disable-next-line arrow-body-style
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// function for sending the token
const createSendToken = (user, statusCode, res) => {
  // sign("payload","secret","options/callback function")
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // to ensure that cookie cannot be modified.
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true; // cookie will be set to an encrypted connection

  res.cookie("jwt", token, cookieOptions); // .cookie("name",value, options)

  user.password = undefined;

  res.status(statusCode).json({
    Status: "Success",
    token,
    data: {
      user,
    },
  });
};

// Creating new User
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.get("host")}/me`;
  // console.log(url);
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
});

// logging in user
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. checking the user exist or not
  if (!email || !password) {
    return next(new AppError("Please provide email and password! ", 400));
  }

  // 2. validating email and password
  const user = await User.findOne({ email }).select("+password"); // to include the password explicitly
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError("Invalid user or password!! ", 401));
  }

  // 3. If ok send the token to the client
  createSendToken(user, 200, res);
});

// logging out user
exports.logout = (req, res) => {
  res.cookie("jwt", "Logged Out", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ Status: "Success" });
};

// middleware to check if the user is logged in or not and then provide him the access of routes
exports.protect = catchAsync(async (req, res, next) => {
  // 1. Getting the token and checking if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in, Please login to get access ", 401)
    );
  }

  // 2. Verification of token( promisifying the token)
  // eslint-disable-next-line no-unused-vars
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); // decoding the payload

  // 3. Check if the user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The token belonging to this user does no longer exist ",
        401
      )
    );
  }

  // 4.Check if the user has changed the password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    // if the password was changed
    return next(
      new AppError(
        "User recently changed the password, Please login again!",
        401
      )
    );
  }

  // Finally granting the access the access to the protected route
  req.user = currentUser; // putting the user data on the request
  res.locals.user = currentUser;
  next();
});

// Only for the rendered page, there will be no errors
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // eslint-disable-next-line no-unused-vars
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      ); // decoding the payload

      //  Check if the user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 4.Check if the user has changed the password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        // if the password was changed
        return next(
          new AppError(
            "User recently changed the password, Please login again!",
            401
          )
        );
      }

      // Finally granting the access the access to the protected route
      res.locals.user = currentUser; // putting the user data on the response
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// function to restrict the user from deleting the tour
// eslint-disable-next-line arrow-body-style
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // this line means that if the role of the user is not present in the passed roles("admin","lead-guide")
    // req.user.role means that the roles which is present in the schema.
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

// function for forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. get user based on posted email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("No user with provided email address", 404));
  }

  // 2. generate random token
  const resetToken = user.createRandomResetToken();
  user.save({ validateBeforeSave: false }); // this will deactivate all the required field

  // 3. Send it back to the user, we have to create a URL that will act as a link

  try {
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/user/resetPassword/${resetToken}`;

    await new Email(user, resetUrl).sendPasswordReset();

    res.status(200).json({
      Status: "Success",
      message: "Token sent to the mail",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending email, Please try again! "),
      500
    );
  }
});

// function for resetting the password
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on token
  const hashedToken = crypto // encrypting the simple Token
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken, // finding the user based on token
    passwordResetExpires: { $gt: Date.now() }, // checking if the token has expired
  }); // password reset token is a field in schema

  // 2. If the token has not expired and there is a user then set the new password
  if (!user) {
    return next(new AppError("Token is invalid or Expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3. update the changedPasswordAt prop for the current user
  // 4. log the user in, send JWT
  createSendToken(user, 200, res);
});

// funtion for updating the password
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get the user from the collection
  const user = await User.findById(req.user.id).select("+password");

  // 2. Check if the user has posted the correct current password
  if (await !user.comparePassword(req.body.passwordCurrent, user.password)) {
    return next(new AppError("Your current password is incorrect", 401));
  }
  // 3. If so, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // 4. Login the user, send the JWT
  createSendToken(user, 200, res);
});
