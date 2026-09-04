const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const salonCtrl = require('../controllers/salon.controller');
const serviceCtrl = require('../controllers/service.controller');
const staffCtrl = require('../controllers/staff.controller');
const appointmentCtrl = require('../controllers/appointment.controller');
const reviewCtrl = require('../controllers/review.controller');

// --- Public discovery ---
router.get('/', salonCtrl.listSalons);
router.get('/mine', authenticate, requireRole('SALON_OWNER'), salonCtrl.getMySalons);
router.get('/:id', salonCtrl.getSalon);

// --- Owner-managed ---
router.post('/', authenticate, requireRole('SALON_OWNER'), salonCtrl.createSalon);
router.put('/:id', authenticate, requireRole('SALON_OWNER', 'ADMIN'), salonCtrl.updateSalon);

// --- Nested: services ---
router.get('/:salonId/services', serviceCtrl.listServices);
router.post('/:salonId/services', authenticate, requireRole('SALON_OWNER', 'ADMIN'), serviceCtrl.createService);

// --- Nested: staff ---
router.get('/:salonId/staff', staffCtrl.listStaff);
router.post('/:salonId/staff', authenticate, requireRole('SALON_OWNER', 'ADMIN'), staffCtrl.createStaff);

// --- Nested: appointments (salon dashboard view) ---
router.get(
  '/:salonId/appointments',
  authenticate,
  requireRole('SALON_OWNER', 'STAFF', 'ADMIN'),
  appointmentCtrl.getSalonAppointments
);

// --- Nested: reviews ---
router.get('/:salonId/reviews', reviewCtrl.getSalonReviews);

module.exports = router;
