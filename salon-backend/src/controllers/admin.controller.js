const prisma = require('../config/prisma');

// All functions here are mounted behind requireRole('ADMIN') in the routes file.

// GET /api/admin/stats — basic platform statistics for the admin dashboard home page
async function getStats(req, res, next) {
  try {
    const [customers, salons, staff, appointments, reviews] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.salon.count(),
      prisma.staff.count(),
      prisma.appointment.count(),
      prisma.review.count(),
    ]);

    const avgRating = await prisma.review.aggregate({ _avg: { rating: true } });

    res.json({
      stats: {
        totalCustomers: customers,
        totalSalons: salons,
        totalStaff: staff,
        totalAppointments: appointments,
        totalReviews: reviews,
        averageRating: avgRating._avg.rating || 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/users?role=
async function listUsers(req, res, next) {
  try {
    const { role } = req.query;
    const users = await prisma.user.findMany({
      where: role ? { role } : undefined,
      select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/salons — every salon on the platform, regardless of owner
async function listAllSalons(req, res, next) {
  try {
    const salons = await prisma.salon.findMany({
      include: { owner: { select: { name: true, email: true } }, _count: { select: { staff: true, appointments: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ salons });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/salons/:id/toggle-active — suspend or reinstate a salon
async function toggleSalonActive(req, res, next) {
  try {
    const salon = await prisma.salon.findUnique({ where: { id: req.params.id } });
    if (!salon) return res.status(404).json({ error: 'Salon not found.' });

    const updated = await prisma.salon.update({
      where: { id: req.params.id },
      data: { isActive: !salon.isActive },
    });

    res.json({ salon: updated });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/categories, POST /api/admin/categories — manage service categories
async function listCategories(req, res, next) {
  try {
    const categories = await prisma.serviceCategory.findMany();
    res.json({ categories });
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const category = await prisma.serviceCategory.create({ data: { name: req.body.name } });
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStats,
  listUsers,
  listAllSalons,
  toggleSalonActive,
  listCategories,
  createCategory,
};
