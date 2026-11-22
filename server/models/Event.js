const mongoose = require('mongoose');

const CATEGORIES = ['Tech', 'Music', 'Sports', 'Workshop', 'Other'];

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      enum: { values: CATEGORIES, message: 'Invalid category' },
      default: 'Other',
    },
    date: { type: Date, required: [true, 'Date is required'] },
    venue: { type: String, required: [true, 'Venue is required'], trim: true },
    // Filled automatically by geocoding the venue; may be missing if lookup failed
    location: {
      lat: Number,
      lng: Number,
    },
    capacity: { type: Number, default: 100, min: [1, 'Capacity must be at least 1'] },
    bannerUrl: { type: String, default: '' },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// We list upcoming events sorted by date all the time, so index it.
eventSchema.index({ date: 1 });

module.exports = mongoose.model('Event', eventSchema);
module.exports.CATEGORIES = CATEGORIES;
