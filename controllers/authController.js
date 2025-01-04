const { promisify } = require('util');

const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');

const createToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return token;
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = createToken(newUser._id);

  res.status(201).json({
    status: 'sucesss',
    token,
    newUser,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //Check if email and password are provided
  if (!email || !password)
    return next(new appError('Both email and password are required', 400));

  //Check if the user exists and password is correct
  const foundUser = await User.findOne({ email }).select('+password');

  if (!foundUser) return next(new appError('Invalid email or password', 401));

  //Check if the password is correct
  if (await foundUser.isCorrectPassword(password, foundUser.password)) {
    //if everyything is okay send the token to the client
    const token = createToken(foundUser._id);

    res.status(200).json({
      status: 'success',
      token,
    });
  } else {
    return next(new appError('Invalid email or password', 401));
  }
});
