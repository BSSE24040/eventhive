const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { ApiError, sendSuccess } = require('../utils/apiResponse');
const bookingService = require('../services/bookingService');
const emailService = require('../services/emailService');
const { getIO } = require('../sockets/socketHandler');

// @desc  Reserve seats and create a Stripe payment intent (2-step checkout)
const createBooking = asyncHandler(async (req, res) => {
  const { eventId, ticketTypeId, quantity } = req.body;

  if (!quantity || quantity < 1) throw new ApiError(400, 'Quantity must be at least 1');

  const booking = await bookingService.reserveSeats({
    eventId,
    ticketTypeId,
    quantity,
    userId: req.user._id,
  });

  const clientSecret = await bookingService.createPaymentIntent(booking);

  // Broadcast the updated seat count to everyone viewing this event page
  const event = await Event.findById(eventId);
  getIO()?.to(`event:${eventId}`).emit('seatsUpdated', {
    eventId,
    ticketTypes: event.ticketTypes,
  });

  sendSuccess(
    res,
    201,
    { booking, clientSecret },
    'Seats reserved — complete payment within 10 minutes'
  );
});

// @desc  Confirm booking after client-side Stripe payment succeeds
const confirmBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  const booking = await bookingService.confirmBookingAndIssueTickets(bookingId);
  const event = await Event.findById(booking.event);
  const user = req.user;

  await emailService.sendBookingConfirmationEmail({
    to: user.email,
    eventTitle: event.title,
    quantity: booking.quantity,
    totalAmount: booking.totalAmount,
  });

  sendSuccess(res, 200, { booking }, 'Booking confirmed and tickets issued');
});

const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('event', 'title startsAt location coverImageUrl')
    .sort('-createdAt');
  sendSuccess(res, 200, { bookings }, 'Your bookings fetched');
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only cancel your own bookings');
  }
  if (booking.status !== 'pending_payment') {
    throw new ApiError(400, 'Only unpaid bookings can be cancelled');
  }

  await bookingService.releaseSeats(booking);
  booking.status = 'cancelled';
  await booking.save();

  sendSuccess(res, 200, { booking }, 'Booking cancelled and seats released');
});

module.exports = { createBooking, confirmBooking, getMyBookings, cancelBooking };
