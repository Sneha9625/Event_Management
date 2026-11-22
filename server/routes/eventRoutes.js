const express = require('express');
const { body, param } = require('express-validator');

const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventAttendees,
  getMyOrganizedEvents,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { CATEGORIES } = require('../models/Event');

const router = express.Router();

// Same rules for create and update; on update every field is optional.
const eventRules = (isUpdate = false) => {
  const field = (name) => (isUpdate ? body(name).optional() : body(name));

  return [
    field('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3–100 characters'),
    field('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be 10–2000 characters'),
    field('category').isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
    field('date')
      .isISO8601()
      .withMessage('Date must be a valid date')
      .custom((value) => new Date(value) > new Date())
      .withMessage('Date must be in the future'),
    field('venue').trim().notEmpty().withMessage('Venue is required'),
    body('capacity').optional().isInt({ min: 1, max: 100000 }).withMessage('Capacity must be a whole number ≥ 1').toInt(),
  ];
};

const idRule = [param('id').isMongoId().withMessage('Invalid event id')];

// NOTE: "/organizer/mine" must be declared before "/:id",
// otherwise Express would treat "organizer" as an event id.
router.get('/organizer/mine', protect, allowRoles('organizer'), getMyOrganizedEvents);

router.get('/', getEvents);
router.get('/:id', idRule, validate, getEventById);

// upload.single() must run before the validators: it is what fills req.body for multipart forms
router.post('/', protect, allowRoles('organizer'), upload.single('banner'), eventRules(), validate, createEvent);
router.put('/:id', protect, allowRoles('organizer'), upload.single('banner'), idRule, eventRules(true), validate, updateEvent);
router.delete('/:id', protect, allowRoles('organizer', 'admin'), idRule, validate, deleteEvent);

router.get('/:id/attendees', protect, allowRoles('organizer'), idRule, validate, getEventAttendees);

module.exports = router;
