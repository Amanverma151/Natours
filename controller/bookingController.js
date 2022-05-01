const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");
const AppError = require("../utils/appError");

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1. Getting the currently booked tour
  const tour = await Tour.findById(req.params.tourId); // because in params we gave the name tourID

  // 2. Create checkout session
  const session = await stripe.checkout.sessions.create({
    // Information about the session
    payment_method_types: ["card"], // it is an array and card is the credit card

    // user will be redirected to this url after successful payment
    success_url: `${req.protocol}://${req.get("host")}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,

    // Information about the product
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100, // to convert into cents
        currency: "usd",
        quantity: 1,
      },
    ],
  });
  // 3. Send it to the client
  res.status(200).json({
    Status: "Success",
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // New booking is created only when these 3 param are specified in the query after that we remove them from the url so that it gets a bit clean look
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });
  res.redirect(req.originalUrl.split("?")[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
