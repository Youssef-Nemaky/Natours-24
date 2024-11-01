const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    required: [true, 'Tour name is required'],
    unique: true,
    type: String,
  },
  price: { required: [true, 'Tour price is required'], type: Number },
  rating: { type: Number, default: 4.5 },
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
