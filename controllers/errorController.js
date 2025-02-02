const AppError = require('../utils/appError');
const appError = require('../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

const handleCastErrorDB = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateFieldsDB = (err) => {
  const values = Object.values(err.keyValue).join(', ');
  return new AppError(
    `Duplicate field value(s): ${values}. Please, try different value(s).`,
    400,
  );
};

const handleValidationErrorDB = (err) => {
  let errorMessages = Object.values(err.errors)
    .map((el) => {
      return el.message;
    })
    .reverse()
    .join(' & ');

  return new AppError(`${errorMessages}`, 400);
};

const handleJwtError = (err) => {
  return new AppError(`${err.message}`, 401);
};

const handleJwtExpiredToken = (err) => {
  return new AppError(`${err.message}`, 401);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJwtError(error);
    if (err.name === 'TokenExpiredError') error = handleJwtExpiredToken(error);

    sendErrorProd(error, res);
  }
};
