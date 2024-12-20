const express = require('express');
const morgan = require('morgan');

const toursRouter = require('./routes/tourRoutes');
const usersRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);
app.all('*', (req, res, next) => {
  const error = new AppError(
    `Can't find ${req.originalUrl} on this server`,
    404,
  );
  next(error);
});

app.use(globalErrorHandler);

module.exports = app;
