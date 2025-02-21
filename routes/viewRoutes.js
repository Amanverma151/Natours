const express = require("express");
const viewController = require("../controller/viewsController");
const authController = require("../controller/authController");
const bookingController = require("../controller/bookingController");

// const CSP = "Content-Security-Policy";
// const POLICY =
//   "default-src 'self' https://*.mapbox.com ;" +
//   "base-uri 'self';block-all-mixed-content;" +
//   "font-src 'self' https: data:;" +
//   "frame-ancestors 'self';" +
//   "img-src http://localhost:8000 'self' blob: data:;" +
//   "object-src 'none';" +
//   "script-src https: cdn.jsdelivr.net cdnjs.cloudflare.com api.mapbox.com 'self' blob: ;" +
//   "script-src-attr 'none';" +
//   "style-src 'self' https: 'unsafe-inline';" +
//   "upgrade-insecure-requests;";

const router = express.Router();

// router.use((req, res, next) => {
//   res.setHeader(CSP, POLICY);
//   next();
// });

// For Redering the template

router.get(
  "/",
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);
router.get(
  "/tours/:slugs",
  authController.isLoggedIn,
  viewController.getTour
);
router.get("/signup", viewController.getSignupForm);
router.get("/login", authController.isLoggedIn, viewController.getLoginForm);
router.get("/me", authController.protect, viewController.getAccount);
router.get("/my-tours", authController.protect, viewController.getMyTours);
router.post(
  "/submit-user-data",
  authController.protect,
  viewController.updateUserData
);

module.exports = router;
