const express = require('express');

const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

const router = express.Router();

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

router.route('/signup').post(signup);
router.route('/login').post(login);

router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:token').patch(resetPassword);

module.exports = router;
