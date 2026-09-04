const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { setWorkingHours, addLeave } = require('../controllers/staff.controller');
const { getAvailability } = require('../controllers/availability.controller');

// Public — this is the "select date/time" step
router.get('/:staffId/availability', getAvailability);

// Owner-managed
router.put('/:id/working-hours', authenticate, requireRole('SALON_OWNER', 'ADMIN'), setWorkingHours);
router.post('/:id/leave', authenticate, requireRole('SALON_OWNER', 'ADMIN'), addLeave);

module.exports = router;
