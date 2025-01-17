const express = require('express');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');
const helmet = require('helmet');

const toursRouter = require('./routes/tourRoutes');
const usersRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// set security headers
app.use(helmet());

const appLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  message: 'Too many requests from this IP. Please, try again in 15 minutes',
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  message: 'Too many requests from this IP. Please, try again in 15 minutes',
});

app.use('/api', appLimiter);
app.use('/api/v1/users/login', loginLimiter);

//body parser
app.use(express.json({ limit: '10kb' }));
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
