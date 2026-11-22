const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    // select: false → never loaded unless we explicitly ask with .select('+password')
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['attendee', 'organizer', 'admin'],
      default: 'attendee',
    },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, select: false }, // stored hashed, like a password
    otpExpiry: { type: Date, select: false },
  },
  { timestamps: true }
);

// Hash the password only when it is new or changed, otherwise we would
// re-hash an already-hashed password on every save.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Safety net: even if a secret field was selected, strip it from JSON output.
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.otp;
    delete ret.otpExpiry;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
