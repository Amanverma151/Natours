// Exported Modules
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cors = require("cors");
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

// app.use(function (req, res, next) {
//   res.setHeader(
//     "Content-Security-Policy",
//     "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self'"
//   );
//   next();
// });

// const scriptSrcUrls = [
//   "https://api.tiles.mapbox.com/",
//   "https://api.mapbox.com/",
// ];
// const styleSrcUrls = [
//   "https://api.mapbox.com/",
//   "https://api.tiles.mapbox.com/",
//   "https://fonts.googleapis.com/",
// ];
// const connectSrcUrls = [
//   "https://api.mapbox.com/",
//   "https://a.tiles.mapbox.com/",
//   "https://b.tiles.mapbox.com/",
//   "https://events.mapbox.com/",
// ];
// const fontSrcUrls = ["fonts.googleapis.com", "fonts.gstatic.com"];
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: [],
//       connectSrc: ["'self'", ...connectSrcUrls],
//       scriptSrc: ["'self'", ...scriptSrcUrls],
//       styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//       workerSrc: ["'self'", "blob:"],
//       objectSrc: [],
//       imgSrc: ["'self'", "blob:", "data:"],
//       fontSrc: ["'self'", ...fontSrcUrls],
//     },
//   })
// );

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

// For using HTTP headers

// app.use((req, res, next) => {
//   res.setHeader(
//     "Content-Security-Policy",
//     "script-src  'self' api.mapbox.com",
//     "script-src-elem 'self' api.mapbox.com"
//   );
//   next();
// });

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

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // it will convert the date into readable string
  // console.log(req.cookies);
  next();
});

// 2. ROUTES
/**
 * For eg:
 * If there is a request for "/api/v1/users/:id" it will enter the middleware stack and runs the userRouter function because the path has matched.
 */

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
