const fs = require('fs');

const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env' });

const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

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

const importData = async (field) => {
  try {
    const data = JSON.parse(fs.readFileSync(`./${field}.json`, 'utf-8'));

    await connectDB();
    switch (field) {
      case 'tours':
        await Tour.create(data);
        break;
      case 'users':
        await User.create(data);
        break;
      case 'reviews':
        await Review.create(data);
        break;
      default:
    }

    process.exit();
  } catch (error) {
    console.log(error);
  }
};

const deleteData = async (field) => {
  try {
    await connectDB();
    switch (field) {
      case 'tours':
        await Tour.deleteMany();
        break;
      case 'users':
        await User.deleteMany();
        break;
      case 'reviews':
        await Review.deleteMany();
        break;
      default:
    }
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] !== '--help' && (!process.argv[2] || !process.argv[3])) {
  console.log(
    'invalid argument: run: node import-dev-data.js --help for more info.',
  );
  process.exit();
}

if (process.argv[2] === '--help') {
  console.log(
    '--import (tours/users/reviews) or --delete (tours/users/reviews)',
  );
} else if (process.argv[2] === '--import') {
  importData(process.argv[3]);
  console.log('Imported all the data to the DB');
} else if (process.argv[2] === '--delete') {
  deleteData();
  console.log('Deleted all the data in the DB');
}
