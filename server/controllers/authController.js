const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateOtp = require('../utils/generateOtp');
const { sendEmail, otpEmailTemplate } = require('../utils/sendEmail');

const OTP_EXPIRY_MINUTES = 10;

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Creates a fresh OTP, stores its hash on the user, and emails the plain code.
const createAndSendOtp = async (user) => {
  const otp = generateOtp();
  user.otp = await bcrypt.hash(otp, 10);
  user.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  await user.save();

  // Makes local testing possible without a real inbox
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔑 OTP for ${user.email}: ${otp}`);
  }

  await sendEmail(user.email, 'Verify your EventHub account', otpEmailTemplate(user.name, otp));
};

// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    // Only these two roles may be self-chosen; "admin" is never accepted from the form.
    const role = req.body.role === 'organizer' ? 'organizer' : 'attendee';

    let user = await User.findOne({ email });

    if (user && user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email is already registered', data: null });
    }

    if (user) {
      // Unverified account: let them retry signup instead of being stuck forever
      user.name = name;
      user.password = password;
      user.role = role;
    } else {
      user = new User({ name, email, password, role });
    }

    await createAndSendOtp(user);

    res.status(201).json({
      success: true,
      message: 'Registered! We sent a 6-digit code to your email',
      data: { email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/verify-otp
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select('+otp +otpExpiry');

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with that email', data: null });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified, please log in', data: null });
    }
    if (!user.otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'Code has expired, please request a new one', data: null });
    }

    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect verification code', data: null });
    }

    user.isVerified = true;
    user.otp = undefined; // undefined removes the field from the document
    user.otpExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified! You can now log in', data: null });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/resend-otp
const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with that email', data: null });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified, please log in', data: null });
    }

    await createAndSendOtp(user);

    res.json({ success: true, message: 'A new code has been sent to your email', data: null });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    // Same message for both cases so attackers can't tell which emails exist
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password', data: null });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
        data: { email: user.email, needsVerification: true },
      });
    }

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      data: { token: signToken(user._id), user }, // toJSON strips the password
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, message: 'Current user', data: req.user });
};

// @route GET /api/auth/users  (admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, message: 'All users', data: users });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, verifyOtp, resendOtp, login, getMe, getAllUsers };
