const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1. Getting the tours from the database
  const tours = await Tour.find();

  // 2. Building the template

  // 3. Injecting the data into the template
  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1. Getting the tour from the database
  const tour = await Tour.findOne({ slug: req.params.slugs }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  if (!tour) {
    return next(new AppError("There is no such tour", 404));
  }

  // 2. Building the template

  // 3. Injecting the data into the tour(Rendering)
  res
    .status(200)
    // .set(
    //   "Content-Security-Policy",
    //   "default-src 'self' https://api.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    // )
    .render("tour", {
      title: `${tour.name} Tour`,
      tour,
    });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render("login", {
    title: "Log into your account",
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render("signup", {
    title: "Create a new account",
  });
};

// For your account
exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your Account",
  });
};

// For updating the name and email of the user
exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    { new: true, runValidators: true }
  );
  res.status(200).render("account", {
    title: "Your Account",
    user: updatedUser,
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1. Get all the booking for the user
  const bookings = await Booking.find({ user: req.user.id });

  // 2. Get all the tours with the returned tourId from the booking database.
  const tourIds = bookings.map((el) => el.tour); // storing the tourId from the bookings , tour is the tourId in the Booking model
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render("overview", {
    title: "My tours",
    tours,
  });
});
