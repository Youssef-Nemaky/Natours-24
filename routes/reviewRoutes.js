const express = require('express');

const {
  getAllReviews,
  setTourUserIds,
  createReview,
  updateReview,
  getReview,
} = require('../controllers/reviewController');

const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), setTourUserIds, createReview);

router.route('/:id').get(getReview).patch(updateReview);
module.exports = router;
