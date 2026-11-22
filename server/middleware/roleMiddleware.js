// Usage: router.post('/', protect, allowRoles('organizer'), handler)
// Must run after `protect`, because it relies on req.user.
const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied: this action requires role ${roles.join(' or ')}`,
      data: null,
    });
  }
  next();
};

module.exports = { allowRoles };
