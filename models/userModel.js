const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name field is required'],
  },
  email: {
    type: String,
    unique: [true, 'This email was already used before'],
    required: [true, 'Email is required'],
    validate: {
      message: 'Invalid Email.',
      validator: function () {
        return validator.isEmail(this.email);
      },
    },
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Password confirm is required'],
    validate: {
      message: 'Passwords do not match.',
      validator: function (pwd) {
        return this.password === pwd;
      },
    },
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
