const express = require('express');

const {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
} = require('../controllers/tourController');

const router = express.Router();

// router.param('id', findTourById);

router.route('/').get(getAllTours).post(createTour);
router.route('/tours-stats').get(getTourStats);
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
