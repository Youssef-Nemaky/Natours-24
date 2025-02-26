const Review = require('../models/reviewModel');

const {
  createOne,
  getAll,
  getOne,
  updateOne,
  deleteOne,
  deleteOneIfOwner,
} = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  req.body.tour = req.body.tour || req.params.tourId;
  req.body.user = req.user._id;
  next();
};

exports.createReview = createOne(Review);
exports.getAllReviews = getAll(Review);
exports.getReview = getOne(Review);
exports.updateReview = updateOne(Review);
exports.deleteReview = deleteOneIfOwner(Review, 'user');
