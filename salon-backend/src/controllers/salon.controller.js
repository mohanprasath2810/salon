const prisma = require('../config/prisma');

// GET /api/salons?city=&search=
// Public. This powers the "discover salons" screen for customers.
async function listSalons(req, res, next) {
  try {
    const { city, search } = req.query;

    const salons = await prisma.salon.findMany({
      where: {
        isActive: true,
        ...(city && { city: { equals: city, mode: 'insensitive' } }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ salons });
  } catch (err) {
    next(err);
  }
}

// GET /api/salons/:id
// Public. Full salon detail page: services + staff + reviews.
async function getSalon(req, res, next) {
  try {
    const salon = await prisma.salon.findUnique({
      where: { id: req.params.id },
      include: {
        services: { where: { isActive: true } },
        staff: {
          where: { isActive: true },
          include: { user: { select: { id: true, name: true } } },
        },
        reviews: {
          include: { customer: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!salon) return res.status(404).json({ error: 'Salon not found.' });

    res.json({ salon });
  } catch (err) {
    next(err);
  }
}

// POST /api/salons
// Protected: SALON_OWNER only. Owner creates their own salon.
async function createSalon(req, res, next) {
  try {
    const { name, description, address, city, phone, imageUrl, latitude, longitude } = req.body;

    const salon = await prisma.salon.create({
      data: {
        ownerId: req.user.id,
        name,
        description,
        address,
        city,
        phone,
        imageUrl,
        latitude,
        longitude,
      },
    });

    res.status(201).json({ salon });
  } catch (err) {
    next(err);
  }
}

// PUT /api/salons/:id
// Protected: SALON_OWNER (only their own salon) or ADMIN.
async function updateSalon(req, res, next) {
  try {
    const salon = await prisma.salon.findUnique({ where: { id: req.params.id } });
    if (!salon) return res.status(404).json({ error: 'Salon not found.' });

    // Ownership check: an owner can only edit THEIR salon. Admins bypass this.
    if (req.user.role !== 'ADMIN' && salon.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'You do not own this salon.' });
    }

    const updated = await prisma.salon.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json({ salon: updated });
  } catch (err) {
    next(err);
  }
}

// GET /api/salons/mine
// Protected: SALON_OWNER. Used by the salon dashboard to load "my salon".
async function getMySalons(req, res, next) {
  try {
    const salons = await prisma.salon.findMany({ where: { ownerId: req.user.id } });
    res.json({ salons });
  } catch (err) {
    next(err);
  }
}

module.exports = { listSalons, getSalon, createSalon, updateSalon, getMySalons };
