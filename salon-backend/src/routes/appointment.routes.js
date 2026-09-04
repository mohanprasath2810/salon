const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { bookAppointment, getMyAppointments, cancelAppointment } = require('../controllers/appointment.controller');
const { createReview } = require('../controllers/review.controller');

// All appointment actions require login
router.use(authenticate);

router.post('/', requireRole('CUSTOMER'), bookAppointment);
router.get('/me', requireRole('CUSTOMER'), getMyAppointments);
router.patch('/:id/cancel', cancelAppointment); // ownership checked inside controller
router.post('/:id/review', requireRole('CUSTOMER'), createReview);

module.exports = router;
