const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const { ApiError, sendSuccess } = require('../utils/apiResponse');

// @desc  Create a new event (organizer/admin only)
const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({ ...req.body, organizer: req.user._id });
  sendSuccess(res, 201, { event }, 'Event created successfully');
});

// @desc  Public listing with search, filters, and pagination
const getEvents = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    city,
    minPrice,
    maxPrice,
    sortBy = 'startsAt',
    page = 1,
    limit = 12,
  } = req.query;

  const filter = { status: 'published' };

  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  if (city) filter['location.city'] = new RegExp(city, 'i');
  if (minPrice || maxPrice) {
    filter['ticketTypes.price'] = {};
    if (minPrice) filter['ticketTypes.price'].$gte = Number(minPrice);
    if (maxPrice) filter['ticketTypes.price'].$lte = Number(maxPrice);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [events, total] = await Promise.all([
    Event.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit))
      .populate('organizer', 'name avatarUrl'),
    Event.countDocuments(filter),
  ]);

  sendSuccess(
    res,
    200,
    {
      events,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    },
    'Events fetched'
  );
});

const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('organizer', 'name avatarUrl');
  if (!event) throw new ApiError(404, 'Event not found');
  sendSuccess(res, 200, { event }, 'Event fetched');
});

// @desc  Organizer's own events (for their dashboard)
const getMyEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user._id }).sort('-createdAt');
  sendSuccess(res, 200, { events }, 'Your events fetched');
});

const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');

  const isOwner = event.organizer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only edit your own events');
  }

  Object.assign(event, req.body);
  await event.save();
  sendSuccess(res, 200, { event }, 'Event updated');
});

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');

  const isOwner = event.organizer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only delete your own events');
  }

  await event.deleteOne();
  sendSuccess(res, 200, null, 'Event deleted');
});

module.exports = { createEvent, getEvents, getEventById, getMyEvents, updateEvent, deleteEvent };
