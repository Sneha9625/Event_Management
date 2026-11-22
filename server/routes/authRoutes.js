const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');

const { register, verifyOtp, resendOtp, login, getMe, getAllUsers } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// Rate limits slow down password guessing and email spamming.
const limiterMessage = (msg) => ({ success: false, message: msg, data: null });

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: limiterMessage('Too many attempts, please try again in 15 minutes'),
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: limiterMessage('Too many code requests, please wait 15 minutes'),
});

const emailRule = body('email').trim().isEmail().withMessage('Please enter a valid email').toLowerCase();

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name is too long'),
    emailRule,
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['attendee', 'organizer']).withMessage('Role must be attendee or organizer'),
  ],
  validate,
  register
);

router.post(
  '/verify-otp',
  [emailRule, body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits').bail().isNumeric().withMessage('Code must contain only numbers')],
  validate,
  verifyOtp
);

router.post('/resend-otp', otpLimiter, [emailRule], validate, resendOtp);

router.post(
  '/login',
  authLimiter,
  [emailRule, body('password').notEmpty().withMessage('Password is required')],
  validate,
  login
);

router.get('/me', protect, getMe);
router.get('/users', protect, allowRoles('admin'), getAllUsers);

module.exports = router;
