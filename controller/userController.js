const multer = require("multer");
const sharp = require("sharp");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

// Creating a function for the storage of the images
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // here dest takes current req, file, and a callback(cb), cb here acts as next
//     cb(null, "public/img/users"); // cb takes first argument as err if there is non it will be set to null and 2nd is the destination
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`); // format of the image user-24234sjbs234-33443344.jpeg
//   },
// });

const multerStorage = multer.memoryStorage(); // Storing the file as buffer

// Creating a function for check if the uploaded file is an image or not
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image, Please upload only images", 400), false);
  }
};

// For uploaded images
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// Middleware for uploading images
exports.uploadUserPhoto = upload.single("photo");

// For resizing the images
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer) // reading the file as buffer
    .resize(500, 500) // resizing the image as square
    .toFormat("jpeg") // specifying the format as JPEG
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`); // quality of jpeg(compressing it)

  next();
});

// function to check the filtered Object
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  // looping through each field of the object and checking if it is one of the allowedFields then storing them in the newObj
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Adding a /me endpoint
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// function to updating the user name and email
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1. Creating error if the user tries to change the password
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("This route is not for password updation", 400));
  }

  // 2. Filter out unwanted field names that should not be updated

  const filteredBody = filterObj(req.body, "name", "email"); // the place where data is stored(body), and the field which we wanto change
  if (req.file) filteredBody.photo = req.file.filename;

  // 3. Update user document
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    {
      new: true, // means it should now dipslay the updated document
      runValidators: true,
    }
  );

  res.status(200).json({
    Status: "Success",
    user: updatedUser,
  });
});

// Function to delete the user or inactive the account
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    Status: "Success",
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    Status: "error",
    message: "This route is not yet defined",
  });
};

// Getting all the user
exports.getAllUsers = factory.getAll(User);

// Getting one user
exports.getUser = factory.getOne(User);

// Updating the user
exports.updateUser = factory.updateOne(User);

// deleting the user
exports.deleteUser = factory.deleteOne(User);
