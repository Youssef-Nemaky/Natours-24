const express = require('express');

const {
  getAllReviews,
  setTourUserIds,
  createReview,
  updateReview,
  getReview,
  deleteReview,
} = require('../controllers/reviewController');

const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), setTourUserIds, createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(protect, restrictTo('user', 'admin'), updateReview)
  .delete(protect, restrictTo('user', 'admin'), deleteReview);
module.exports = router;
