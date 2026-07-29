const express = require('express');
const { createReview, getEventReviews } = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/:eventId', getEventReviews);
router.post('/', protect, createReview);

module.exports = router;
