class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // msg is the only thing that built in error class accepts
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    // this function call will not be executed when a new object is created
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
