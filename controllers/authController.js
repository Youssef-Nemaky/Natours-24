const { promisify } = require('util');

const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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
    return next(new AppError('Both email and password are required', 400));

  //Check if the user exists and password is correct
  const foundUser = await User.findOne({ email }).select('+password');

  if (!foundUser) return next(new AppError('Invalid email or password', 401));

  //Check if the password is correct
  if (await foundUser.isCorrectPassword(password, foundUser.password)) {
    //if everyything is okay send the token to the client
    const token = createToken(foundUser._id);

    res.status(200).json({
      status: 'success',
      token,
    });
  } else {
    return next(new AppError('Invalid email or password', 401));
  }
});

exports.protect = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];

  //check if the token was provided
  if (!token) {
    return next(new AppError('No token was provided. Invalid Access', 401));
  }

  //check if the token is valid and hasn't expired
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if the user still exists
  const foundUser = await User.findById(decoded.id);

  if (!foundUser) return next(new AppError('user no longer exists', 401));

  //check if the password was modified after the tokenw as issued
  const hasPasswordChanged = foundUser.hasPasswordChanged(decoded.iat);

  if (hasPasswordChanged) {
    return next(
      new AppError(
        'Password has been changed after this token was issued',
        401,
      ),
    );
  }

  req.user = foundUser;
  next();
});
