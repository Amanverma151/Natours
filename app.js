// Exported Modules
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize"); // to remove all the dollar signs and dots.
const xss = require("xss-clean");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const viewRouter = require("./routes/viewRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controller/errorControllers");

////// GLOBAL MIDDLEWARE////////////////
const app = express(); // app will store all the methods and function that express contains

// Setting pug template engine in express
app.set("view engine", "pug");

// Setting the path of the views
app.set("views", path.join(__dirname, "views")); // we are using .join because we don't know wheter the path has / or " " so it is always a good practice

app.use(helmet());

// for using static files of our own folders
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());

app.options("*", cors());

console.log(process.env.NODE_ENV);

if (process.env.NODE_ENV === "developement") {
  app.use(morgan("dev"));
}

// for using rate limiting
const limiter = rateLimit({
  max: 100, // 100 request on the same IP
  windowMs: 60 * 60 * 1000, // 100 request per hr
  message: "Too many request from this IP, Please try again later",
});
app.use("/api", limiter);

// for limiting the amount of data, it parses the data from the body
app.use(express.json({ limit: "10kb" })); // "express.json" is the middleware

// For parsing the data coming from a form
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// For parsing data from the cookie
app.use(cookieParser());

// Data sanitation against NOSQL query injection
app.use(mongoSanitize());

// Data sanitation against XSS(Cross-site Scripting Attacks)
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

app.use(compression()); // to compress all the text.

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // it will convert the date into readable string
  // console.log(req.cookies);
  next();
});

// For the API routes
app.use("/", viewRouter); // creating a middle ware which runs on this route only
app.use("/api/v1/tours", tourRouter); // creating a middle ware which runs on this route only
app.use("/api/v1/users", userRouter); // middleware which runs on this route
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);

// For all other invalid urls
app.all("*", (req, res, next) => {
  next(
    // creating new error using AppError class
    new AppError(`Can't find ${req.originalUrl} on this server`, 404)
  );
});

// Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
