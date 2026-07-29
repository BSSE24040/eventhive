const express = require('express');
const {
  createEvent,
  getEvents,
  getEventById,
  getMyEvents,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/', getEvents);
router.get('/mine', protect, restrictTo('organizer', 'admin'), getMyEvents);
router.get('/:id', getEventById);
router.post('/', protect, restrictTo('organizer', 'admin'), createEvent);
router.put('/:id', protect, restrictTo('organizer', 'admin'), updateEvent);
router.delete('/:id', protect, restrictTo('organizer', 'admin'), deleteEvent);

module.exports = router;
