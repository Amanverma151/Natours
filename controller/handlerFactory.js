const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/apiFeatures");

// Function for getting all the documents
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    // if there is a tourId in the URL then we want to display the reviews of the tourId specified in the URL
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // Execute the query
    const features = new APIFeatures(Model.find(filter), req.query) // .find to find the data for the query
      .filter()
      .sort()
      .limitFields()
      .pagination();
    const doc = await features.query;

    // Sending the Response
    res.status(200).json({
      Status: "Success",
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });

// Function to get the Document
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (popOptions) {
      query = query.populate(popOptions);
    }
    const doc = await query;

    // if there is no doc then we have to create an error which can be handled by the AppError class
    if (!doc) {
      return next(new AppError("No document found with this id", 404));
    }

    res.status(200).json({
      Status: "Success",
      data: {
        data: doc,
      },
    });
  });

// Function to Create the Document
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body); // since .create returns a promise
    res.status(201).json({
      status: "Success",
      data: {
        data: doc,
      },
    });
  });

// Factory Function to Update the Document
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // so that only the updated document will be retuned to the client
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("No document found with this id", 404));
    }

    res.status(200).json({
      Status: "Success",
      data: {
        data: doc,
      },
    });
  });

// Factory Function to delete the Document
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No document found with this id", 404));
    }

    res.status(204).json({
      Status: "Successfully Deleted",
      data: null,
    });
  });
