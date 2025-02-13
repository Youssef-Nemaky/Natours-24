const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const { updateOne } = require('./handlerFactory');

exports.getAllTours = catchAsync(async (req, res, next) => {
  // const tours = fs.createReadStream('./dev-data/data/tours-simple.json', 'utf8');
  // data.pipe(tours);

  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;
  res.status(200).json({ status: 'success', length: tours.length, tours });
});

exports.createTour = catchAsync(async (req, res, next) => {
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  const newTour = await Tour.create(req.body);
  res.status(201).json({ status: 'success', data: newTour });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate('reviews');
  if (!tour) {
    return next(new AppError(`Tour with id: ${req.params.id} not found!`, 404));
  }
  res.status(200).json({ status: 'success', tour });
});

exports.updateTour = updateOne(Tour);

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError(`Tour with id: ${req.params.id} not found!`, 404));
  }
  res.status(204).json({ status: 'success', data: null });
});

exports.aliasTopTours = (req, res, next) => {
  // limit=5&sort=-ratingsAverage,price
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: -1 },
    },
    //   {
    //     $match: { _id: { $ne: 'EASY' } },
    //   },
  ]);

  res.status(200).json({ status: 'success', data: stats });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year;
  const stats = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numToursStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numToursStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({ status: 'success', data: stats });
});
