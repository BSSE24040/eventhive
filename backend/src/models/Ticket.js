const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    serialCode: { type: String, required: true, unique: true }, // encoded into QR
    qrCodeDataUrl: { type: String, required: true }, // base64 PNG data URL
    isCheckedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ticket', ticketSchema);
