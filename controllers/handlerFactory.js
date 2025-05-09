const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({ status: 'success', data: newDoc });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // support getting reviews on a specific tour
    const filter = req.params.tourId ? { tour: req.params.tourId } : {};

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const docs = await features.query;
    res
      .status(200)
      .json({ status: 'success', length: docs.length, data: docs });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id).populate(popOptions);
    if (!doc) {
      return next(
        new AppError(`Document with id: ${req.params.id} not found!`, 404),
      );
    }
    res.status(200).json({ status: 'success', data: doc });
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

exports.updateOneIfOwner = (Model, idField) =>
  catchAsync(async (req, res, next) => {
    // shouldn't change passwords in here
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError('Bad Request: use update-password instead', 400),
      );
    }

    let doc = Model.findById(req.params.id);

    if (!doc) {
      return next(
        new AppError(`document with id: ${req.params.id} not found!`, 404),
      );
    }

    if (req.user.role === 'admin') {
      doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
    } else {
      // user case
      doc = await Model.findOneAndUpdate(
        {
          _id: req.params.id,
          [idField]: req.user._id,
        },
        req.body,
      );

      if (!doc) {
        return next(
          new AppError('You do not have access to perform this action', 403),
        );
      }
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

exports.deleteOneIfOwner = (Model, idField) =>
  catchAsync(async (req, res, next) => {
    console.log(req.params.id);

    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError(`Invalid ${Model.modelName} ID`, 404));
    }

    let deletedDoc = null;

    if (req.user.role !== 'admin') {
      deletedDoc = await Model.findOneAndDelete({
        _id: req.params.id,
        [idField]: req.user._id,
      });
    } else {
      deletedDoc = await Model.findByIdAndDelete(req.params.id);
    }

    if (!deletedDoc) {
      return next(
        new AppError('You do not have access to perform this action', 403),
      );
    }

    res.status(204).json({ status: 'success', data: null });
  });
