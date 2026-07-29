const express = require('express');
const {
  createBooking,
  confirmBooking,
  getMyBookings,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);
router.post('/', createBooking);
router.post('/confirm', confirmBooking);
router.get('/mine', getMyBookings);
router.patch('/:id/cancel', cancelBooking);

module.exports = router;
