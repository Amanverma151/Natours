/* eslint-disable node/no-unsupported-features/es-syntax */
const AppError = require("../utils/appError");

// Converting the mongoose error into a operational error
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// function to handle the duplicate field
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  // console.log(value);
  const message = `Duplicate Field value ${value}. Please use another value!`;
  return new AppError(message, 400);
};

// function to handle the validation error
const handleValidatorErrorDB = (err) => {
  // error is the array of the objects the values that we want to update like [name, ratingsAverage, difficulty] so we want these values
  const error = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data ${error.join(". ")}`;
  return new AppError(message, 400);
};

// function to handle JWT web token errors
const handleJWTError = () =>
  new AppError("Invalid token, Please login again", 401);

// function to handle JWT expired token errors
const handleJWTExpiredError = () =>
  new AppError("Your token has expired, Please login again", 401);

// Function for sending error msg for development
const sendErrorDev = (req, err, res) => {
  // err is the instance of the AppError class like an object

  // If the url starts with / then we want the error message to be a JSON
  // FOR API
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      Status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // FOR RENDERED WEBPAGE
    console.error("ERROR 💥", err);

    return res.status(err.statusCode).render("error", {
      title: "Something went wrong",
      msg: err.message,
    });
  }
};

// Function for sending error msg for production
const sendErrorProd = (req, err, res) => {
  // FOR API

  if (req.originalUrl.startsWith("/api")) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // 1) Log error
    console.error("ERROR 💥", err);

    // // 2) Send generic message
    return res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  } else {
    // FOR RENDERED WEBPAGE
    if (err.isOperational) {
      return res.status(err.statusCode).render("error", {
        title: "Something went wrong",
        msg: err.message,
      });
    }
    // 1) Log error
    console.error("ERROR 💥", err);

    // // 2) Send generic message
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong",
      msg: "Please try again later",
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "developement") {
    sendErrorDev(req, err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;
    if (err.name === "CastError") err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === "ValidationError") err = handleValidatorErrorDB(err);
    if (err.name === "JsonWebTokenError") err = handleJWTError();
    if (err.name === "TokenExpiredError") err = handleJWTExpiredError();

    sendErrorProd(req, err, res);
  }
};
