const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const { assertOwnsSalon } = require('../utils/ownership');

// GET /api/salons/:salonId/staff?serviceId= — public
// serviceId filter powers the "select stylist" step: only show
// staff who actually perform the service the customer picked.
async function listStaff(req, res, next) {
  try {
    const { serviceId } = req.query;

    const staff = await prisma.staff.findMany({
      where: {
        salonId: req.params.salonId,
        isActive: true,
        ...(serviceId && { services: { some: { serviceId } } }),
      },
      include: {
        user: { select: { id: true, name: true } },
        services: { include: { service: true } },
      },
    });

    res.json({ staff });
  } catch (err) {
    next(err);
  }
}

// POST /api/salons/:salonId/staff — SALON_OWNER invites/creates a stylist
// Creates a User (role: STAFF) + Staff profile in one step, with a
// temporary password the owner shares with the stylist.
async function createStaff(req, res, next) {
  try {
    await assertOwnsSalon(req.user, req.params.salonId);

    const { name, email, phone, tempPassword, bio, serviceIds = [] } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Wrap in a transaction: either both the User and Staff rows get
    // created, or neither do. Prevents "orphan" user accounts with
    // role STAFF but no linked staff profile.
    const staff = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email, phone, passwordHash, role: 'STAFF' },
      });

      return tx.staff.create({
        data: {
          userId: user.id,
          salonId: req.params.salonId,
          bio,
          services: { create: serviceIds.map((serviceId) => ({ serviceId })) },
        },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
    });

    res.status(201).json({ staff });
  } catch (err) {
    next(err);
  }
}

// PUT /api/staff/:id/working-hours — replace weekly schedule
// Body: [{ dayOfWeek: 1, startTime: "09:00", endTime: "18:00" }, ...]
async function setWorkingHours(req, res, next) {
  try {
    const staff = await prisma.staff.findUnique({ where: { id: req.params.id } });
    if (!staff) return res.status(404).json({ error: 'Staff not found.' });

    await assertOwnsSalon(req.user, staff.salonId);

    const { hours } = req.body; // array

    // Replace-all is simplest and safest for a weekly recurring schedule
    await prisma.$transaction([
      prisma.workingHour.deleteMany({ where: { staffId: req.params.id } }),
      prisma.workingHour.createMany({
        data: hours.map((h) => ({ ...h, staffId: req.params.id })),
      }),
    ]);

    const updated = await prisma.workingHour.findMany({ where: { staffId: req.params.id } });
    res.json({ workingHours: updated });
  } catch (err) {
    next(err);
  }
}

// POST /api/staff/:id/leave — mark staff unavailable for a date range
async function addLeave(req, res, next) {
  try {
    const staff = await prisma.staff.findUnique({ where: { id: req.params.id } });
    if (!staff) return res.status(404).json({ error: 'Staff not found.' });

    await assertOwnsSalon(req.user, staff.salonId);

    const { startDate, endDate, reason } = req.body;

    const leave = await prisma.leave.create({
      data: { staffId: req.params.id, startDate: new Date(startDate), endDate: new Date(endDate), reason },
    });

    res.status(201).json({ leave });
  } catch (err) {
    next(err);
  }
}

module.exports = { listStaff, createStaff, setWorkingHours, addLeave };
