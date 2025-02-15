const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({ status: 'success', data: newDoc });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // shouldn't change passwords in here
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError('Bad Request: use update-password instead', 400),
      );
    }
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(
        new AppError(`document with id: ${req.params.id} not found!`, 404),
      );
    }
    res.status(200).json({ status: 'success', data: doc });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(
        new AppError(`document with id: ${req.params.id} not found!`, 404),
      );
    }
    res.status(204).json({ status: 'success', data: null });
  });
