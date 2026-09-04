const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const adminCtrl = require('../controllers/admin.controller');

// Every route in this file is platform-admin only.
router.use(authenticate, requireRole('ADMIN'));

router.get('/stats', adminCtrl.getStats);
router.get('/users', adminCtrl.listUsers);
router.get('/salons', adminCtrl.listAllSalons);
router.patch('/salons/:id/toggle-active', adminCtrl.toggleSalonActive);
router.get('/categories', adminCtrl.listCategories);
router.post('/categories', adminCtrl.createCategory);

module.exports = router;
