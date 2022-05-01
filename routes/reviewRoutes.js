const express = require("express");
const reviewController = require("../controller/reviewController");
const authController = require("../controller/authController");

// setting the mergerParam prop to true so that it can take tourId from the route defined in the tourRoute
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo("user"),
    reviewController.setUserTourId,
    reviewController.createReviews
  );
router
  .route("/:id")
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo("user", "admin"),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo("user", "admin"),
    reviewController.deleteReview
  );

module.exports = router;
