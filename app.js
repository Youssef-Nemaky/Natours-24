const fs = require('fs');

const express = require('express');
const morgan = require('morgan');

const toursRouter = require('./routes/tourRoutes');

const app = express();
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1/tours', toursRouter);

const getAllUsers = (req, res) => {
  res
    .status(500)
    .json({ status: 'failed', message: 'Route is not yet implemented' });
};

const getUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'failed', message: 'Route is not yet implemented' });
};

const createUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'failed', message: 'Route is not yet implemented' });
};

const updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'failed', message: 'Route is not yet implemented' });
};

const deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'failed', message: 'Route is not yet implemented' });
};

app.route('/api/v1/users').get(getAllUsers).post(createUser);
app
  .route('/api/v1/users/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
