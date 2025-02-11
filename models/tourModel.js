const mongoose = require('mongoose');
const { default: slugify } = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour name is required'],
      unique: true,
      minLength: [10, 'Tour name must be more or equal to 10 characters'],
      maxLength: [50, 'Tour name must be less or equal to 50 characters'],
    },

    slug: {
      type: String,
    },

    price: {
      type: Number,
      required: [true, 'Tour price is required'],
    },

    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return this.price >= val;
        },
        message: 'Price discount must be lower than original price',
      },
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Tour rating must be above or equal to 1.0'],
      max: [5, 'Tour rating must be below or equal to 5.0'],
    },

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
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty can either be easy, medium or difficult',
      },
    },

    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

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
    secretTour: {
      type: Boolean,
      default: false,
      select: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
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

tourSchema.pre(/^find/, function (next) {
  if (!this._fields || this._fields.hasOwnProperty('guides')) {
    this.populate({
      path: 'guides',
      select:
        '-__v -passwordChangedAt -passwordResetExpiresIn -passwordResetToken',
    });
  }
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
