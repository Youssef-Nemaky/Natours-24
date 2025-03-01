const mongoose = require('mongoose');

const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      minLength: [10, 'review must be at least 10 characters long'],
      maxLength: [1000, "review can't exceed 1000 characters"],
      required: [true, 'review must be provided'],
    },
    rating: {
      type: Number,
      required: [true, 'a rating must be provided'],
      min: [1, "rating can't be lower than 1"],
      max: [5, "rating can' exceed 5"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'review must belong to a user'],
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'review must belong to a tour'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  },
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  }).populate({
    path: 'tour',
    select: 'name',
  });
  next();
});

reviewSchema.statics.calcAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: null,
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);
  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0].avgRating,
    ratingsQuantity: stats[0].nRatings,
  });
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.tour._id);
});

reviewSchema.post(/^findOneAnd/, function (result) {
  if (result) {
    this.model.calcAverageRating(result.tour._id);
  }
});

reviewSchema.index({ user: 1, tour: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
