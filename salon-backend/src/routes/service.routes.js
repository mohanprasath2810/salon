const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { updateService, deleteService } = require('../controllers/service.controller');

router.put('/:id', authenticate, requireRole('SALON_OWNER', 'ADMIN'), updateService);
router.delete('/:id', authenticate, requireRole('SALON_OWNER', 'ADMIN'), deleteService);

module.exports = router;
