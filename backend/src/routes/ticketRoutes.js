const express = require('express');
const { getMyTickets, checkInTicket } = require('../controllers/ticketController');
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(protect);
router.get('/mine', getMyTickets);
router.post('/check-in', restrictTo('organizer', 'admin'), checkInTicket);

module.exports = router;
