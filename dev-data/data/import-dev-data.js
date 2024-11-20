const fs = require('fs');

const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env' });

const Tour = require('../../models/tourModel');

const connectDB = async () => {
  try {
    await mongoose
      .connect(process.env.MONGO_URI)
      .then(console.log('Connected to DB'))
      .catch((err) => console.log('error connecting to db ', err));
  } catch (error) {
    console.log(error);
  }
};

const importData = async () => {
  try {
    const tours = JSON.parse(fs.readFileSync('./tours-simple.json', 'utf-8'));
    tours.forEach((tour) => {
      delete tour.id;
    });
    await connectDB();
    await Tour.create(tours);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

const deleteData = async () => {
  try {
    await connectDB();
    await Tour.deleteMany();
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === '--import') {
  importData();
  console.log('Imported all the data to the DB');
} else if (process.argv[2] === '--delete') {
  deleteData();
  console.log('Deleted all the data in the DB');
} else {
  console.log(
    'invalid argument: run node import-dev-data.js [--import / --delete] ',
  );
}
