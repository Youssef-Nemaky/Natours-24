const express = require('express');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const toursRouter = require('./routes/tourRoutes');
const usersRouter = require('./routes/userRoutes');
const reviewsRouter = require('./routes/reviewRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();
app.set('trust proxy', 1); // OR `true` if you really know what you're doing
//body parser
app.use(express.json({ limit: '10kb' }));

// set security headers
app.use(helmet());

// sanitize data against NoSQL query injection
app.use(mongoSanitize());
// sanitize data against xss (cross-site scipt)
app.use(xss());
// sanitize data aginst hpp (http parameter polution)
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

const appLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  message: 'Too many requests from this IP. Please, try again in 15 minutes',
  validate: {
    trustProxy: 'acknowledged', // 🔥 Must be set if trust proxy is true
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  message: 'Too many requests from this IP. Please, try again in 15 minutes',
  validate: {
    trustProxy: 'acknowledged', // 🔥 Must be set if trust proxy is true
  },
});

app.use('/api', appLimiter);
app.use('/api/v1/users/login', loginLimiter);

app.use(morgan(process.env.NODE_ENV === 'prod' ? 'prod' : 'dev'));

app.get('/', (req, res) => {
  res.json({
    status: 'scuccess',
    message: 'Hello World',
  });
});

app.get('/api/data', async (req, res) => {
  try {
    // const data = await fetch('https://example.com/api');
    // // API might be slow
    // const json = await data.json();
    res.json({ aloo: 'gamd' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewsRouter);

app.all('*', (req, res, next) => {
  const error = new AppError(
    `Can't find ${req.originalUrl} on this server`,
    404,
  );
  next(error);
});

app.use(globalErrorHandler);

module.exports = app;
