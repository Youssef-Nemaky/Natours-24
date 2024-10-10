const fs = require('fs');

const express = require('express');

const app = express();
app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync('./dev-data/data/tours-simple.json', 'utf8')
);

app.get('/api/v1/tours', (req, res) => {
  // const tours = fs.createReadStream('./dev-data/data/tours-simple.json', 'utf8');
  // data.pipe(tours);
  res.status(200).json(tours);
});

app.post('/api/v1/tours', (req, res) => {
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
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
