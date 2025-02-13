const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
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
