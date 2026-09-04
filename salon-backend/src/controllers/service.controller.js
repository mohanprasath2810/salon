const prisma = require('../config/prisma');
const { assertOwnsSalon } = require('../utils/ownership');

// GET /api/salons/:salonId/services — public
async function listServices(req, res, next) {
  try {
    const services = await prisma.service.findMany({
      where: { salonId: req.params.salonId, isActive: true },
      include: { category: true },
    });
    res.json({ services });
  } catch (err) {
    next(err);
  }
}

// POST /api/salons/:salonId/services — SALON_OWNER (own salon) or ADMIN
async function createService(req, res, next) {
  try {
    await assertOwnsSalon(req.user, req.params.salonId);

    const { name, description, durationMinutes, price, categoryId } = req.body;

    const service = await prisma.service.create({
      data: {
        salonId: req.params.salonId,
        name,
        description,
        durationMinutes,
        price,
        categoryId,
      },
    });

    res.status(201).json({ service });
  } catch (err) {
    next(err);
  }
}

// PUT /api/services/:id — SALON_OWNER (own salon) or ADMIN
async function updateService(req, res, next) {
  try {
    const service = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!service) return res.status(404).json({ error: 'Service not found.' });

    await assertOwnsSalon(req.user, service.salonId);

    const updated = await prisma.service.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json({ service: updated });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/services/:id — soft delete (isActive: false), preserves booking history
async function deleteService(req, res, next) {
  try {
    const service = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!service) return res.status(404).json({ error: 'Service not found.' });

    await assertOwnsSalon(req.user, service.salonId);

    await prisma.service.update({ where: { id: req.params.id }, data: { isActive: false } });

    res.json({ message: 'Service removed.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listServices, createService, updateService, deleteService };
