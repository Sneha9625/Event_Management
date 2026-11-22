const { validationResult } = require('express-validator');

// Runs after the express-validator rules in a route and stops the request
// with a 400 if any rule failed.
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const list = errors.array().map((err) => ({ field: err.path, message: err.msg }));
    return res.status(400).json({
      success: false,
      message: list.map((e) => e.message).join(', '),
      data: list,
    });
  }

  next();
};

module.exports = validate;
