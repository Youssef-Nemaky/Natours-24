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
