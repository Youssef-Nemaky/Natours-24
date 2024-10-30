const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync('./dev-data/data/tours-simple.json', 'utf8')
);

exports.getAllTours = (req, res) => {
  // const tours = fs.createReadStream('./dev-data/data/tours-simple.json', 'utf8');
  // data.pipe(tours);
  res.status(200).json(tours);
};

exports.findTourById = (req, res, next, idVal) => {
  const tour = tours.find((el) => el.id == idVal);
  if (!tour) {
    return res.status(404).json({ status: 'Failed', data: 'Tour not found' });
  } else {
    req.tour = tour;
    next();
  }
};

exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = { id: newId, ...req.body };
  tours.push(newTour);
  fs.writeFile(
    './dev-data/data/tours-simple.json',
    JSON.stringify(tours, null, 4),
    (err) => {
      if (err) console.log('Error Writing the file: ', err);
    }
  );
  res.status(201).json(tours);
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
