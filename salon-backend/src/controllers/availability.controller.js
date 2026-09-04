const prisma = require('../config/prisma');
const { getAvailableSlots } = require('../utils/availability');

// GET /api/staff/:staffId/availability?date=2026-08-26&serviceId=xxx
// Public. This is the "select date/time" step in the booking flow.
// Note we don't store slots in the DB — they're computed live from
// working hours + leave + existing bookings, so they're always accurate.
async function getAvailability(req, res, next) {
  try {
    const { staffId } = req.params;
    const { date, serviceId } = req.query;

    if (!date || !serviceId) {
      return res.status(400).json({ error: 'date and serviceId query params are required.' });
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return res.status(404).json({ error: 'Service not found.' });

    const slots = await getAvailableSlots(staffId, date, service.durationMinutes);

    res.json({ date, staffId, serviceId, durationMinutes: service.durationMinutes, slots });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAvailability };
