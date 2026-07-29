const express = require('express');
const { getOrganizerAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/organizer', protect, restrictTo('organizer', 'admin'), getOrganizerAnalytics);

module.exports = router;
