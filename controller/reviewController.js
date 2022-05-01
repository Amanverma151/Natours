const Review = require("../models/reviewModel");
const factory = require("./handlerFactory");

// Middleware to set the user and tour id
exports.setUserTourId = (req, res, next) => {
  // if there is no tour or user id in the body of the request then it will automatically takes ids from the URL, allowing nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id; // for currently logged in user
  next();
};

// Function to get all the reviews
exports.getAllReviews = factory.getAll(Review);

// Function to get one review
exports.getReview = factory.getOne(Review);

// For creating the Review
exports.createReviews = factory.createOne(Review);

// For Updating the review
exports.updateReview = factory.updateOne(Review);

// For deleting the Review
exports.deleteReview = factory.deleteOne(Review);
