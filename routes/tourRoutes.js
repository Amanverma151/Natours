// Exporting the files
const express = require("express");
const tourController = require("../controller/tourController");
const authController = require("../controller/authController");
const reviewRouter = require("./reviewRoutes");

const router = express.Router(); // creating one router function for tour

// if it encouter this route it will be redirected to the reviewRouter
router.use("/:tourId/reviews", reviewRouter);

// Param middleware
// router.param("id", tourController.checkId); // using checkID to check if the ID is valid before passing it to the route.

router.route("/top-5-cheap").get(
  // manipulating the query string by using aliasTopTour() before we can get all tour and after executing this we call the getAll..
  tourController.aliasTopTours,
  tourController.getAllTours
);

router.route("/tour-stats").get(tourController.getTourStats);

router
  .route("/monthly-plan/:year")
  .get(tourController.getMonthlyPlan)
  .get(
    authController.protect,
    authController.restrictTo("admin", "guide", "lead-guide")
  );

// latlon = coordinates where you live and unit = dist in km or miles
router
  .route("/tours-within/:distance/center/:latlon/unit/:unit")
  .get(tourController.getToursWithin);

// Route for calculating the distance from a certain point
router
  .route("/distances/:latlon/unit/:unit")
  .get(tourController.getDistances);

router
  .route("/")
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.createTour
  );

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );

module.exports = router;
