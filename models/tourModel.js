const mongoose = require("mongoose");
const slugify = require("slugify");

// creating a schema for using models
const tourSchema = new mongoose.Schema(
  {
    // it takes obj( for schema ), options as args
    name: {
      type: String, // defining schema type options in this field
      required: [true, "A tour must have a name"], // the 2nd option is the error that will be displayed
      unique: true,
      trim: true,
      maxlength: [
        40,
        "A tour name must have less than or equal to 40 characters",
      ],
      minlength: [
        10,
        "A tour name must have more than or equal to 10 characters",
      ],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "difficult", "medium"],
        message: "Only the given values are allowed",
      },
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // "this" will point to the curr doc on NEW doc not on UPDATED ones
          return val < this.price; // it will return true if the cond satisfies
        },
        message: "Discount price should be below the regular price",
      },
    },
    ratingsAverage: {
      type: Number, // defining schema type options in this field
      default: 4.5, // setting default values
      min: [1, "The ratings must me above 1.0"],
      max: [5, "The ratings must me below 5.0"],
      set: (val) => Math.round(val * 10) / 10, // rounding the values
    },
    ratingsQuantity: {
      type: Number,
      default: 0, // in the beginning there should be new reviews
    },
    summary: {
      type: String,
      trim: true, // removes the white spaces
      required: [true, "A tour must a description"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String, // name of the image so that it can then be read
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // it means that we are excluding this field from the schema
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },

    // GeoSpatial data
    startLocation: {
      type: {
        type: String,
        default: "Point", // can be other like graphs, etc.
        enum: ["Point"],
      },
      coordinates: [Number], // first longitude, then latitude
      address: String,
      description: String,
    },
    // Using referencing
    guides: [
      {
        type: mongoose.Schema.ObjectId, // it means that the type should be mongoose id type
        ref: "User", // creating refernece to another model
      },
    ],
    // Embedding a new Doc using Array
    locations: [
      {
        type: {
          type: String,
          default: "Point", // can be other like graphs, etc.
          enum: ["Point"],
        },
        coordinates: [Number], // first longitude, then latitude
        address: String,
        description: String,
        day: Number,
      },
    ],
  },
  {
    toJSON: { virtuals: true }, // it means that each time when the data is outputted as JSON we want virtuals to be true
    toObject: { virtuals: true }, // it means that each time when the data is outputted as object we want virtuals to be true
  }
);

// Setting the indexes (1 for asc and -1 for desc)
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" }); // for geoSpatial data

// creating a virtual prop and get here is a getter because it will be called everytime when we get some data out of the database
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7; // calculating the weeks from number of days
});

// VIRTUAL POPULATE
tourSchema.virtual("reviews", {
  ref: "Review", // reference model
  foreignField: "tour", // field present in the foreign model
  localField: "_id", // field that is used as a reference in the foreign model
});

// DOCUMENT MIDDLEWARE PRE(Mongoose middleware)
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true }); // this will point to the currently save doc
  next();
});

// Embedding
/**
 *  In this middleware humne user doc ko tour doc k andar embed kra h,
   guide ek array h saari user id ka toh is array p loop krke we are getting the user doc for each id
  
   tourSchema.pre("save", async function (next) {
   const guidePromises = this.guide.map(async (id) => await User.findById(id));

  // to run all the promises at the same time and overriding the guide array that contains only the id with the user doc
   this.guide = await Promise.all(guidePromises);
   next();
 });
 * 
 */

// QUERY MIDDLEWARE for specifying the start date in each query that starts with find
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } }); // this will point to the query
  this.start = Date.now();
  next();
});

// Query MIDDLEWARE for populating the fields
tourSchema.pre(/^find/, function (next) {
  // this will point to the current query
  this.populate({
    path: "guides", // the field that we want to populate
    select: "-__v -passwordChangedAt", // for excluding the field
  });
  next();
});

// doc is all the doc that were returned from the query
tourSchema.post(/^find/, function (doc, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

// // AGGREGATE MIDDLEWARE
// tourSchema.pre("aggregate", function (next) {
//   this.pipeline().unshift({
//     $match: { secretTour: { $ne: true } },
//   });
//   console.log(this.pipeline()); // this will point to the current aggregation object
//   next();
// });

// creating a model out of schema (model name starts with capital letter)
const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
