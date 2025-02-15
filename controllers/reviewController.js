const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');

const { createOne, getOne, updateOne, deleteOne } = require('./handlerFactory');

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

exports.setTourUserIds = (req, res, next) => {
  req.body.tour = req.body.tour || req.params.tourId;
  req.body.user = req.user._id;
  next();
};

exports.createReview = createOne(Review);
exports.getReview = getOne(Review);
exports.updateReview = updateOne(Review);
exports.deleteOne = deleteOne(Review);
