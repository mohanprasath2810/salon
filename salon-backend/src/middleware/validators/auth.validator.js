const { body, validationResult } = require('express-validator');

// Reusable "run the checks above, and if any failed, stop and
// respond with 400" — put this as the LAST item in the array
// before the controller in every route that uses validators.
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number.'),
  body('role').optional().isIn(['CUSTOMER', 'SALON_OWNER']).withMessage('Invalid role.'),
  handleValidation,
];

const loginValidator = [
  body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
  handleValidation,
];

module.exports = { registerValidator, loginValidator, handleValidation };
