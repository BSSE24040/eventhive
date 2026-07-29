const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { ApiError, sendSuccess } = require('../utils/apiResponse');

const createReview = asyncHandler(async (req, res) => {
  const { eventId, rating, comment } = req.body;

  // Only attendees who actually had a confirmed booking may review
  const hasAttended = await Booking.exists({
    event: eventId,
    user: req.user._id,
    status: 'confirmed',
  });
  if (!hasAttended) throw new ApiError(403, 'Only attendees who booked this event can review it');

  const review = await Review.create({ event: eventId, user: req.user._id, rating, comment });

  // Recompute the event's aggregate rating
  const stats = await Review.aggregate([
    { $match: { event: review.event } },
    { $group: { _id: '$event', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  await Event.findByIdAndUpdate(eventId, {
    averageRating: stats[0]?.avgRating || 0,
    reviewCount: stats[0]?.count || 0,
  });

  sendSuccess(res, 201, { review }, 'Review submitted');
});

const getEventReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ event: req.params.eventId })
    .populate('user', 'name avatarUrl')
    .sort('-createdAt');
  sendSuccess(res, 200, { reviews }, 'Reviews fetched');
});

module.exports = { createReview, getEventReviews };
