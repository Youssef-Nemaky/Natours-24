const Tour = require('../models/tourModel');

class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    // Filtering A (equal states -> price = x, name = x)
    let query = { ...this.queryStr };
    const excludedFields = ['sort', 'page', 'limit', 'fields'];

    excludedFields.forEach((el) => {
      delete query[el];
    });

    // Filtering B (Comparision states -> price gte x )
    let queryStr = JSON.stringify(query);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    query = JSON.parse(queryStr);
    this.query.find(query);
    return this;
  }

  sort() {
    //Sorting
    if (this.queryStr.sort) {
      let sortQuery = this.queryStr.sort;
      sortQuery = sortQuery.split(',').join(' ');
      this.query.sort(sortQuery);
    } else {
      // sort by createdAt
      this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    // Limiting Fields
    if (this.queryStr.fields) {
      let fields = this.queryStr.fields;
      fields = fields.split(',').join(' ');
      this.query.select(fields);
    } else {
      this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    // Pagination
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query.skip(skip).limit(limit);

    return this;
  }
}
exports.getAllTours = async (req, res) => {
  // const tours = fs.createReadStream('./dev-data/data/tours-simple.json', 'utf8');
  // data.pipe(tours);

  try {
    let features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;
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
