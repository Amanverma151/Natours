const multer = require("multer");
const sharp = require("sharp");
const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");
const AppError = require("../utils/appError");

/////////////////////////// Route Handler(functions)/////////////////////////////////////

const multerStorage = multer.memoryStorage(); // Storing the file as buffer

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image, Please upload only images", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// Middleware for uploading images
exports.uploadTourImages = upload.fields([
  {
    name: "imageCover", // name of the field
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 3,
  },
]);

/*
when there is a single field 
upload.single("image")

when there are multiple files of the same name
upload.array("images", 5)  // 5 is max count

when there are multiple fields
upload.field([{.....}])
*/

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`; // putting the image on the body because req.body will be updated
  // For Cover Images
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333) // (2:3)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // For Images, since images is also an array
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333) // (2:3)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      // Pushing the file in the images array, if we dont push this images will be empty
      req.body.images.push(filename);
    })
  );
  next();
});

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5"; // since it is a string in the URL
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

// Getting all the tours
exports.getAllTours = factory.getAll(Tour);

// getting tour by ID
exports.getTour = factory.getOne(Tour, { path: "reviews" });
// Creating Tour
exports.createTour = factory.createOne(Tour);

// Updating Tour
exports.updateTour = factory.updateOne(Tour);

// Deleting Tour
exports.deleteTour = factory.deleteOne(Tour);

// Aggregation Pipeline
exports.getTourStats = catchAsync(async (req, res, next) => {
  // .aggregate returs agg. object
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 }, // for counting the number of tours
        numRatings: { $sum: "$ratingsQuantity" }, // number of ratings
        avgRating: { $avg: "$ratingsAverage" }, // average ratings
        avgPrice: { $avg: "$price" }, // average price
        minPrice: { $min: "$price" }, // min price
        maxPrice: { $max: "$price" }, // max price
      },
    },
    { $sort: { avgPrice: 1 } }, // 1 for ascend order and sorting by avgPrice
  ]);
  res.status(200).json({
    Status: "Success",
    data: {
      stats,
    },
  });
});

// Getting the bussiest month (again by agg pipeline)
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`), // because we want the date to be in b|w 2021 and 2022
          $lte: new Date(`${year}-12-31`), // dec 2021
        },
      },
    },
    {
      $group: {
        // grouping it by the month
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      // it will add a new field "month" and assign the value same as "_id"
      $addFields: { month: "$_id" }, // month is the name of the field
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12, // only 6 docs per page
    },
  ]);
  res.status(200).json({
    Status: "Success",
    data: {
      plan,
    },
  });
});

// Middleware for getting tours within a radius
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlon, unit } = req.params; // getting the data(args) all at once once
  const [lat, lon] = latlon.split(","); // Again Using destructuring

  // Converting the distance in radians because of MongoDB rules
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lon) {
    next(new AppError("Please provide the coordinates as lat,lon"), 400);
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lon, lat], radius] } },
  });

  console.log(distance, lat, lon, unit);
  res.status(200).json({
    Status: "Success",
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

// For Calculating the distance from a certain point
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlon, unit } = req.params; // getting the data(args) all at once once
  const [lat, lon] = latlon.split(","); // Again Using destructuring

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  if (!lat || !lon) {
    next(new AppError("Please provide the coordinates as lat,lon"), 400);
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lon * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier, // converting the distance to km
      },
    },
    {
      $project: {
        distance: 1, // 1 means that we want to keep this field in the output
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    Status: "Success",
    data: {
      data: distances,
    },
  });
});
