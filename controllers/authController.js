const fs = require('fs');
const crypto = require('crypto');
const { promisify } = require('util');

const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

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
  //check if the token was provided
  if (!req.headers.authorization) {
    return next(new AppError('No token was provided. Invalid Access', 401));
  }

  const token = req.headers.authorization.split(' ')[1];

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

// eslint-disable-next-line arrow-body-style
exports.restrictTo = (...authRoles) => {
  return function (req, res, next) {
    if (!authRoles.includes(req.user.role)) {
      return next(
        new AppError('You do not have access to perform this action', 403),
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //check if the email was provided
  const { email } = req.body;
  if (!email) return next(new AppError('Email must be provided', 400));

  const foundUser = await User.findOne({ email });

  //Will not return an error message if the email was not found to keep the data secret so will only comment the code

  // if (!foundUser)
  //   return next(new AppError('There is no user with the provided email', 404));

  if (!foundUser) {
    return res.status(200).json({
      status: 'success',
      message: 'A reset email was sent',
    });
  }
  // Generate random reset token
  const resetToken = foundUser.createPasswordResetToken();
  foundUser.save({ validateModifiedOnly: true });

  //send the email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;

  const message = `We’ve received your request to reset your password. 
  Please click the link below to complete the reset.
  \n${resetURL}\nThis link is valid for a single use and expires in 10 minutes.`;

  let resetEmailHTMLObj = await promisify(fs.readFile)(
    `${__dirname}/../dev-data/templates/resetEmail.html`,
    'utf-8',
  );

  const resetEmailHTML = JSON.stringify(resetEmailHTMLObj)
    .replace('[User]', foundUser.name)
    .replace('[Your Company]', 'Natours')
    .replace('[Reset Link]', resetURL);

  resetEmailHTMLObj = JSON.parse(resetEmailHTML);

  try {
    await sendEmail({
      email,
      subject: 'Password Reset',
      message,
      html: resetEmailHTMLObj,
    });

    res.status(200).json({
      status: 'success',
      message: 'A reset email was sent',
    });
  } catch (err) {
    foundUser.passwordResetToken = undefined;
    foundUser.passwordResetExpiresIn = undefined;
    return next(new AppError('There was an error sending the email', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get the token
  const passedToken = req.params.token;

  // Hash the token to search for the user
  const hashedToken = crypto
    .createHash('sha256')
    .update(passedToken)
    .digest('hex');

  // Get the user and also make sure that the token hasn't expired
  const foundUser = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresIn: { $gt: Date.now() }, // check if the token has not expired
  });

  if (!foundUser) {
    return next(new AppError('Token has expired or invalid', 400));
  }

  foundUser.password = req.body.password;
  foundUser.passwordConfirm = req.body.passwordConfirm;
  foundUser.passwordResetToken = undefined;
  foundUser.passwordResetExpiresIn = undefined;

  await foundUser.save();

  const token = createToken(foundUser._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});
