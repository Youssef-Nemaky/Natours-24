const Tour = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
  // const tours = fs.createReadStream('./dev-data/data/tours-simple.json', 'utf8');
  // data.pipe(tours);

  try {
    // Filtering A (equal states -> price = x, name = x)
    let query = { ...req.query };
    const excludedFields = ['sort', 'page', 'limit', 'fields'];

    excludedFields.forEach((el) => {
      delete query[el];
    });

    // Filtering B (Comparision states -> price gte x )
    let queryStr = JSON.stringify(query);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    query = JSON.parse(queryStr);

    query = Tour.find(query);

    // Sorting
    if (req.query.sort) {
      let sortQuery = req.query.sort;
      sortQuery = sortQuery.split(',').join(' ');
      query = query.sort(sortQuery);
    } else {
      // sort by price
      query = query.sort('-createdAt');
    }

    // Limiting Fields
    if (req.query.fields) {
      let fields = req.query.fields;
      fields = fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // Pagination
    // page and limit
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    query.skip(skip).limit(limit);

    const tours = await query;
    res.status(200).json({ status: 'success', length: tours.length, tours });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

exports.createTour = async (req, res) => {
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({ status: 'success', data: newTour });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({ status: 'success', tour });
  } catch (error) {
    res.status(404).json({ status: 'fail', message: error });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ status: 'sucess', data: tour });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: 'sucess', data: tour });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error });
  }
};

exports.aliasTopTours = (req, res, next) => {
  // limit=5&sort=-ratingsAverage,price
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
