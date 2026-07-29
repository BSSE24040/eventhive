const mongoose = require('mongoose');

// Each ticket type tracks its own inventory so seat booking can be
// updated atomically per-type without locking the whole event document.
const ticketTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "General", "VIP"
    price: { type: Number, required: true, min: 0 },
    totalQuantity: { type: Number, required: true, min: 0 },
    quantitySold: { type: Number, default: 0, min: 0 },
  },
  { _id: true }
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['music', 'tech', 'sports', 'art', 'business', 'food', 'other'],
    },
    coverImageUrl: { type: String, default: '' },
    location: {
      venueName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true, index: true },
    },
    startsAt: { type: Date, required: true, index: true },
    endsAt: { type: Date, required: true },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ticketTypes: {
      type: [ticketTypeSchema],
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'published',
    },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

eventSchema.index({ title: 'text', description: 'text', 'location.city': 'text' });

// Virtual: total remaining seats across all ticket types
eventSchema.virtual('seatsRemaining').get(function seatsRemaining() {
  if (!Array.isArray(this.ticketTypes)) return 0;

  return this.ticketTypes.reduce(
    (sum, t) => sum + ((t.totalQuantity || 0) - (t.quantitySold || 0)),
    0
  );
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);