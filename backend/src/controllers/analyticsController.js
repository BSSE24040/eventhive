const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { sendSuccess } = require('../utils/apiResponse');

// @desc  Organizer dashboard: revenue, sales-over-time, ticket-type breakdown
const getOrganizerAnalytics = asyncHandler(async (req, res) => {
  const organizerId = new mongoose.Types.ObjectId(req.user._id);

  const myEvents = await Event.find({ organizer: organizerId }).select('_id');
  const eventIds = myEvents.map((e) => e._id);

  const [revenueOverTime, ticketTypeBreakdown, summary] = await Promise.all([
    // Revenue grouped by day for confirmed bookings
    Booking.aggregate([
      { $match: { event: { $in: eventIds }, status: 'confirmed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
          revenue: { $sum: '$totalAmount' },
          ticketsSold: { $sum: '$quantity' },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Breakdown of sales by ticket type name across all events
    Booking.aggregate([
      { $match: { event: { $in: eventIds }, status: 'confirmed' } },
      {
        $group: {
          _id: '$ticketTypeName',
          totalSold: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]),

    // Overall summary numbers
    Booking.aggregate([
      { $match: { event: { $in: eventIds }, status: 'confirmed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalTicketsSold: { $sum: '$quantity' },
          totalBookings: { $sum: 1 },
        },
      },
    ]),
  ]);

  sendSuccess(
    res,
    200,
    {
      totalEvents: eventIds.length,
      summary: summary[0] || { totalRevenue: 0, totalTicketsSold: 0, totalBookings: 0 },
      revenueOverTime,
      ticketTypeBreakdown,
    },
    'Analytics fetched'
  );
});

module.exports = { getOrganizerAnalytics };
