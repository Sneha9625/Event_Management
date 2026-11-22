const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { sendEmail, rsvpEmailTemplate } = require('../utils/sendEmail');

// @route POST /api/registrations/:eventId
const registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found', data: null });
    }
    if (event.date < new Date()) {
      return res.status(400).json({ success: false, message: 'This event has already happened', data: null });
    }
    if (event.organizer.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You're the organizer of this event", data: null });
    }

    const existing = await Registration.findOne({ user: req.user._id, event: event._id });
    if (existing && existing.status === 'registered') {
      return res.status(400).json({ success: false, message: 'You are already registered for this event', data: null });
    }

    const registeredCount = await Registration.countDocuments({ event: event._id, status: 'registered' });
    if (registeredCount >= event.capacity) {
      return res.status(400).json({ success: false, message: 'Sorry, this event is full', data: null });
    }

    // Re-use a cancelled registration instead of creating a duplicate
    // (the unique index on {user, event} would reject a second document).
    let registration;
    if (existing) {
      existing.status = 'registered';
      existing.attended = false;
      registration = await existing.save();
    } else {
      registration = await Registration.create({ user: req.user._id, event: event._id });
    }

    // Email is a nice-to-have: if it fails, the RSVP should still succeed.
    sendEmail(req.user.email, `You're going to ${event.title}!`, rsvpEmailTemplate(req.user.name, event)).catch(
      (err) => console.error(`RSVP email failed: ${err.message}`)
    );

    res.status(201).json({ success: true, message: "You're registered! 🎉", data: registration });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/registrations/:eventId
const cancelRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findOne({
      user: req.user._id,
      event: req.params.eventId,
      status: 'registered',
    });

    if (!registration) {
      return res.status(404).json({ success: false, message: 'You are not registered for this event', data: null });
    }

    registration.status = 'cancelled';
    await registration.save();

    res.json({ success: true, message: 'Your RSVP has been cancelled', data: registration });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/registrations/my
const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ user: req.user._id, status: 'registered' })
      .populate({ path: 'event', populate: { path: 'organizer', select: 'name' } })
      .lean();

    // An event may have been deleted after the user registered — skip those.
    const valid = registrations
      .filter((r) => r.event)
      .sort((a, b) => new Date(a.event.date) - new Date(b.event.date));

    res.json({ success: true, message: 'Your registrations', data: valid });
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/registrations/:registrationId/attendance  (owner organizer)
const toggleAttendance = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.registrationId).populate('event', 'organizer');

    if (!registration || !registration.event) {
      return res.status(404).json({ success: false, message: 'Registration not found', data: null });
    }
    if (registration.event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the event organizer can mark attendance', data: null });
    }

    // Accept an explicit value from the checkbox; otherwise simply flip it
    registration.attended =
      typeof req.body.attended === 'boolean' ? req.body.attended : !registration.attended;
    await registration.save();

    res.json({
      success: true,
      message: registration.attended ? 'Marked as attended' : 'Marked as not attended',
      data: { _id: registration._id, attended: registration.attended },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerForEvent, cancelRegistration, getMyRegistrations, toggleAttendance };
