const { promisify } = require('util');

const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = await jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env_JWT_EXPIRES_IN,
  });

  res.status(201).json({
    status: 'sucesss',
    token,
    newUser,
  });
});
