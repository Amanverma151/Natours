const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review cannot be empty"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Query Middleware for populating the fields of user and the tour at the same time
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: "user",
  //   select: "name photo",
  // }).populate({
  //   path: "tour",
  //   select: "name",
  // });

  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

// Function to calculate the ratings Average and number of ratings
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        numRating: { $sum: 1 }, // add 1 to each count
        avgRating: { $avg: "$rating" }, // $rating is from review model
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].numRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

//  Setting index so that one user can write one review
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.tour);
});

// If there is a change it will not persist in the database because it is a pre middleware
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne(); // get the document from the database (unchanged Doc) and storing a "r" prop on "this"
  next();
});

// Now after the pre the doc is changed so we can use post for updating the doc
reviewSchema.post(/^findOneAnd/, async function () {
  // this.r.tour= humne upar r k andar wo query await kri h toh isliye hume usse yaha use kr sakte h
  // is jagah this.r(from here)= this(from above)
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
