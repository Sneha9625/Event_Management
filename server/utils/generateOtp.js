const crypto = require('crypto');

// crypto.randomInt is cryptographically secure, unlike Math.random().
// Range 100000–999999 guarantees exactly 6 digits.
const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

module.exports = generateOtp;
