const mongoose = require('mongoose');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const { ApiError } = require('../utils/apiResponse');
const { generateTicketQr } = require('../utils/qrGenerator');
const stripe = require('../config/stripe');

const HOLD_DURATION_MS = 10 * 60 * 1000; // 10 minute reservation window

/**
 * Reserve seats for a ticket type using an atomic conditional update.
 *
 * Why this matters: if two users try to buy the last seat at the same instant,
 * a naive "read remaining count, then write" approach has a race condition —
 * both requests can read "1 seat left" before either writes, and both succeed,
 * overselling the event. Instead we push the availability check INTO the
 * update's filter itself. MongoDB guarantees findOneAndUpdate is atomic, so
 * only one of the two concurrent requests can match the filter and succeed;
 * the loser gets null back and is told the event is sold out.
 */
const reserveSeats = async ({ eventId, ticketTypeId, quantity, userId }) => {
  const updatedEvent = await Event.findOneAndUpdate(
    {
      _id: eventId,
      status: 'published',
      $expr: {
        $gte: [
          {
            $subtract: [
              {
                $arrayElemAt: [
                  '$ticketTypes.totalQuantity',
                  { $indexOfArray: ['$ticketTypes._id', new mongoose.Types.ObjectId(ticketTypeId)] },
                ],
              },
              {
                $arrayElemAt: [
                  '$ticketTypes.quantitySold',
                  { $indexOfArray: ['$ticketTypes._id', new mongoose.Types.ObjectId(ticketTypeId)] },
                ],
              },
            ],
          },
          quantity,
        ],
      },
    },
    { $inc: { 'ticketTypes.$[t].quantitySold': quantity } },
    { arrayFilters: [{ 't._id': ticketTypeId }], new: true }
  );

  if (!updatedEvent) {
    throw new ApiError(409, 'Not enough seats available for this ticket type');
  }

  const ticketType = updatedEvent.ticketTypes.find((t) => t._id.toString() === ticketTypeId);

  const booking = await Booking.create({
    user: userId,
    event: eventId,
    ticketTypeId,
    ticketTypeName: ticketType.name,
    quantity,
    unitPrice: ticketType.price,
    totalAmount: ticketType.price * quantity,
    status: 'pending_payment',
    holdExpiresAt: new Date(Date.now() + HOLD_DURATION_MS),
  });

  return booking;
};

  
// Releases the held inventory back to the event (used on cancellation/expiry)
const releaseSeats = async (booking) => {
  await Event.updateOne(
    { _id: booking.event, 'ticketTypes._id': booking.ticketTypeId },
    { $inc: { 'ticketTypes.$.quantitySold': -booking.quantity } }
  );
};

// Creates a Stripe PaymentIntent for a pending booking (test mode)
const createPaymentIntent = async (booking) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(booking.totalAmount * 100), // Stripe uses smallest currency unit
    currency: 'usd',
    metadata: { bookingId: booking._id.toString() },
  });

  booking.stripePaymentIntentId = paymentIntent.id;
  await booking.save();

  return paymentIntent.client_secret;
};

// Called after Stripe confirms payment succeeded (via webhook or client confirmation).
// Generates individual scannable tickets for the quantity purchased.
const confirmBookingAndIssueTickets = async (bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.status === 'confirmed') return booking; // idempotent

  booking.status = 'confirmed';
  booking.paidAt = new Date();
  await booking.save();

  const ticketDocs = [];
  for (let i = 0; i < booking.quantity; i += 1) {
    const { serialCode, qrCodeDataUrl } = await generateTicketQr(booking._id);
    ticketDocs.push({
      booking: booking._id,
      event: booking.event,
      user: booking.user,
      serialCode,
      qrCodeDataUrl,
    });
  }
  await Ticket.insertMany(ticketDocs);

  return booking;
};

// Sweeps bookings whose payment hold has expired without confirmation,
// releasing their reserved seats back into inventory. Intended to run on
// an interval (see server.js) and/or opportunistically before reads.
const releaseExpiredHolds = async () => {
  const expired = await Booking.find({
    status: 'pending_payment',
    holdExpiresAt: { $lt: new Date() },
  });

  await Promise.all(
    expired.map(async (booking) => {
      await releaseSeats(booking);
      booking.status = 'expired';
      await booking.save();
    })
  );

  return expired.length;
};

module.exports = {
  reserveSeats,
  releaseSeats,
  createPaymentIntent,
  confirmBookingAndIssueTickets,
  releaseExpiredHolds,
};
