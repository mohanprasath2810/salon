const prisma = require('../config/prisma');

// Used across service/staff/appointment controllers so a SALON_OWNER
// can only ever manage data that belongs to THEIR salon, not someone
// else's. ADMIN always passes.
async function assertOwnsSalon(user, salonId) {
  if (user.role === 'ADMIN') return true;

  const salon = await prisma.salon.findUnique({ where: { id: salonId } });
  if (!salon) {
    const err = new Error('Salon not found.');
    err.statusCode = 404;
    throw err;
  }
  if (salon.ownerId !== user.id) {
    const err = new Error('You do not have permission to manage this salon.');
    err.statusCode = 403;
    throw err;
  }
  return true;
}

module.exports = { assertOwnsSalon };
