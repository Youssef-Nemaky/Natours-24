const mongoose = require('mongoose');

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

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
