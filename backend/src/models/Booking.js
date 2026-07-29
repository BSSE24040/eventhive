const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    ticketTypeId: { type: mongoose.Schema.Types.ObjectId, required: true },
    ticketTypeName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending_payment', 'confirmed', 'cancelled', 'expired'],
      default: 'pending_payment',
      index: true,
    },
    // Reservation hold expiry — while pending_payment, seats are soft-locked.
    // A background sweep (or lazy check on read) releases inventory if this passes.
    holdExpiresAt: { type: Date, required: true },
    stripePaymentIntentId: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
