const express = require('express');
const { body, param } = require('express-validator');

const {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  toggleAttendance,
} = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// Every registration route needs a logged-in user
router.use(protect);

const eventIdRule = [param('eventId').isMongoId().withMessage('Invalid event id')];

// "/my" must be declared before "/:eventId"-style routes
router.get('/my', getMyRegistrations);

router.post('/:eventId', eventIdRule, validate, registerForEvent);
router.delete('/:eventId', eventIdRule, validate, cancelRegistration);

router.patch(
  '/:registrationId/attendance',
  allowRoles('organizer'),
  [
    param('registrationId').isMongoId().withMessage('Invalid registration id'),
    body('attended').optional().isBoolean().withMessage('attended must be true or false').toBoolean(),
  ],
  validate,
  toggleAttendance
);

module.exports = router;
