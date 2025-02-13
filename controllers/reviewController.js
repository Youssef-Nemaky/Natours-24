const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');

const { updateOne, deleteOne } = require('./handlerFactory');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  // support getting reviews on a specific tour
  const filter = req.params.tourId ? { tour: req.params.tourId } : {};

  const reviews = await Review.find(filter).sort('-createdAt');
  res.status(200).json({
    status: 'success',
    length: reviews.length,
    reviews,
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  req.body.tour = req.body.tour || req.params.tourId;
  req.body.user = req.body.user || req.user._id;

  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'sucesss',
    review: newReview,
  });
});

exports.updateReview = updateOne(Review);
exports.deleteOne = deleteOne(Review);
