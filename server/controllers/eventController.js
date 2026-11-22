const Event = require('../models/Event');
const Registration = require('../models/Registration');
const geocode = require('../utils/geocode');
const uploadToCloudinary = require('../utils/uploadToCloudinary');

// ---------- helpers ----------

// User input goes into a RegExp, so escape special characters like ".*+?"
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Adds registeredCount to each event with ONE query (instead of one per event).
const attachRegisteredCounts = async (events) => {
  const ids = events.map((e) => e._id);

  const counts = await Registration.aggregate([
    { $match: { event: { $in: ids }, status: 'registered' } },
    { $group: { _id: '$event', count: { $sum: 1 } } },
  ]);

  const countMap = {};
  counts.forEach((c) => {
    countMap[c._id.toString()] = c.count;
  });

  return events.map((e) => ({ ...e, registeredCount: countMap[e._id.toString()] || 0 }));
};

const isOwner = (event, user) => event.organizer.toString() === user._id.toString();

// ---------- controllers ----------

// @route GET /api/events?search=&category=&page=&limit=
const getEvents = async (req, res, next) => {
  try {
    const { search, category, includePast } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 9));

    const filter = {};
    if (includePast !== 'true') filter.date = { $gte: new Date() }; // upcoming only by default
    if (search) filter.title = { $regex: escapeRegex(search.trim()), $options: 'i' };
    if (category && category !== 'All') filter.category = category;

    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort({ date: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('organizer', 'name')
        .lean(),
      Event.countDocuments(filter),
    ]);

    res.json({
      success: true,
      message: 'Events fetched',
      data: {
        events: await attachRegisteredCounts(events),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/events/:id
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email').lean();

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found', data: null });
    }

    const registeredCount = await Registration.countDocuments({ event: event._id, status: 'registered' });

    res.json({ success: true, message: 'Event fetched', data: { ...event, registeredCount } });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/events  (organizer, multipart/form-data with optional "banner")
const createEvent = async (req, res, next) => {
  try {
    const { title, description, category, date, venue, capacity } = req.body;

    const bannerUrl = req.file ? await uploadToCloudinary(req.file.buffer) : '';
    const location = await geocode(venue);

    const event = await Event.create({
      title,
      description,
      category,
      date,
      venue,
      capacity,
      bannerUrl,
      location: location || undefined,
      organizer: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: location ? 'Event created' : 'Event created (we could not find this venue on the map)',
      data: { ...event.toObject(), registeredCount: 0 },
    });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/events/:id  (owner only)
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found', data: null });
    }
    if (!isOwner(event, req.user)) {
      return res.status(403).json({ success: false, message: 'You can only edit your own events', data: null });
    }

    const { title, description, category, date, venue, capacity } = req.body;
    const registeredCount = await Registration.countDocuments({ event: event._id, status: 'registered' });

    // Don't let capacity drop below people who already have a spot
    if (capacity !== undefined && Number(capacity) < registeredCount) {
      return res.status(400).json({
        success: false,
        message: `Capacity cannot be less than current registrations (${registeredCount})`,
        data: null,
      });
    }

    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (category !== undefined) event.category = category;
    if (date !== undefined) event.date = date;
    if (capacity !== undefined) event.capacity = capacity;

    // Only hit the geocoding API when the venue actually changed
    if (venue !== undefined && venue !== event.venue) {
      event.venue = venue;
      event.location = (await geocode(venue)) || undefined;
    }

    if (req.file) {
      event.bannerUrl = await uploadToCloudinary(req.file.buffer);
    }

    await event.save();

    res.json({ success: true, message: 'Event updated', data: { ...event.toObject(), registeredCount } });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/events/:id  (owner or admin)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found', data: null });
    }
    if (!isOwner(event, req.user) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only delete your own events', data: null });
    }

    // Remove the event's registrations too, so no orphan records are left
    await Registration.deleteMany({ event: event._id });
    await event.deleteOne();

    res.json({ success: true, message: 'Event deleted', data: null });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/events/:id/attendees  (owner only)
const getEventAttendees = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).lean();

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found', data: null });
    }
    if (!isOwner(event, req.user)) {
      return res.status(403).json({ success: false, message: 'You can only view attendees of your own events', data: null });
    }

    const attendees = await Registration.find({ event: event._id, status: 'registered' })
      .populate('user', 'name email')
      .sort({ createdAt: 1 })
      .lean();

    res.json({
      success: true,
      message: 'Attendees fetched',
      data: {
        event: { _id: event._id, title: event.title, date: event.date, venue: event.venue, capacity: event.capacity },
        attendees,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/events/organizer/mine  (organizer)
const getMyOrganizedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).sort({ date: 1 }).lean();

    res.json({ success: true, message: 'Your events', data: await attachRegisteredCounts(events) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventAttendees,
  getMyOrganizedEvents,
};
