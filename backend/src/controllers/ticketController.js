const asyncHandler = require('express-async-handler');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const { ApiError, sendSuccess } = require('../utils/apiResponse');

const getMyTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({ user: req.user._id })
    .populate('event', 'title startsAt location coverImageUrl ticketTypes')
    .populate('booking')
    .sort('-createdAt');

  sendSuccess(res, 200, { tickets }, 'Your tickets fetched');
});

// @desc  Organizer scans a QR code at the door to check a ticket in
const checkInTicket = asyncHandler(async (req, res) => {
  const { serialCode } = req.body;

  const ticket = await Ticket.findOne({ serialCode }).populate('event');
  if (!ticket) throw new ApiError(404, 'Ticket not found — invalid QR code');

  const isOwner = ticket.event.organizer.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'Only the event organizer can check in tickets for this event');
  }

  if (ticket.isCheckedIn) {
    throw new ApiError(409, `Ticket already checked in at ${ticket.checkedInAt.toLocaleString()}`);
  }

  ticket.isCheckedIn = true;
  ticket.checkedInAt = new Date();
  await ticket.save();

  sendSuccess(res, 200, { ticket }, 'Ticket checked in successfully');
});

module.exports = { getMyTickets, checkInTicket };
