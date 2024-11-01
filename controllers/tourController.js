const Tour = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
  // const tours = fs.createReadStream('./dev-data/data/tours-simple.json', 'utf8');
  // data.pipe(tours);

  try {
    const tours = await Tour.find();
    res.status(200).json({ status: 'success', tours });
  } catch (err) {
    res.status(400).json({ status: 'success', message: err });
  }
};

exports.createTour = async (req, res) => {
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({ status: 'success', data: newTour });
  } catch (err) {
    res.status(400).json({ status: 'success', message: err });
  }
};

exports.getTour = (req, res) => {
  res.status(200).json({ status: 'Sucess', data: req.tour });
};

exports.updateTour = (req, res) => {
  //not actually updating it
  res.status(200).json({ status: 'Sucess', data: req.tour });
};

exports.deleteTour = (req, res) => {
  //not actually deleting it
  res.status(204).json({ status: 'Sucess', data: req.tour });
};
