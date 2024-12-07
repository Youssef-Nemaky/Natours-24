const mongoose = require('mongoose');
const { default: slugify } = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour name is required'],
      unique: true,
    },

    slug: {
      type: String,
    },

    price: {
      type: Number,
      required: [true, 'Tour price is required'],
    },

    priceDiscount: Number,

    rating: { type: Number, default: 4.5 },

    duration: {
      type: Number,
      required: [true, 'Tour durations is required'],
    },

    maxGroupSize: {
      type: Number,
      required: [true, 'Tour maxGroupSize is required'],
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    difficulty: {
      type: String,
      required: [true, 'Tour difficulty is required'],
    },

    guides: [String],

    summary: {
      type: String,
      required: [true, 'Tour summary is required'],
      trim: true,
    },

    description: {
      type: String,
      required: [true, 'Tour description is required'],
      trim: true,
    },

    images: [String],
    imageCover: {
      type: String,
      required: [true, 'Tour image cover is required'],
    },

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },

    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  if (this.duration) return this.duration / 7;
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
