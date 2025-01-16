const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.updateMe = catchAsync(async (req, res, next) => {
  // Check if the password was sent in the request
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'Invalid request. Use /update-password for updating current user password',
        400,
      ),
    );
  }

  //Get the user
  const foundUser = await User.findById(req.user._id);

  const { email, name, photo } = req.body; //Only valid attributes to update

  // console.log({ email, name, photo });
  // console.log(JSON.stringify({ email, name, photo }));

  //stringify will skip undefined values (non-passed values) and then parse will make it an object one more time
  Object.assign(foundUser, JSON.parse(JSON.stringify({ email, name, photo })));

  // Another way is to loop through the values one by one and check the value and then assign it. Object.keys.forEach(el=>{//algo})
  // or to create multiple if statements if(name) user.name= name if ...
  // Object.assign is cool tbh and shorter so sticking with it

  await foundUser.save({ validateModifiedOnly: true });

  res.status(200).json({
    status: 'success',
    user: foundUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  //Make sure that the user has confirmed his password.
  if (!req.body.password)
    return next(
      new AppError('Password must be provided to delete your account', 400),
    );

  //Get the user
  const foundUser = await User.findById(req.user._id).select('password');

  //Check the passed password
  if (!(await foundUser.isCorrectPassword(req.body.password)))
    return next(new AppError('Invalid Password', 401));

  //Delete the user (will not set it to inactive like other people to respect the user data and GDPR)
  await User.findByIdAndDelete(foundUser._id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllUsers = (req, res) => {
  res
    .status(500)
    .json({ status: 'failed', message: 'Route is not yet implemented' });
};

exports.getUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'failed', message: 'Route is not yet implemented' });
};

exports.createUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'failed', message: 'Route is not yet implemented' });
};

exports.updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'failed', message: 'Route is not yet implemented' });
};

exports.deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'failed', message: 'Route is not yet implemented' });
};
