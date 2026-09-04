const prisma = require('../config/prisma');
const { Prisma } = require('@prisma/client');

// POST /api/appointments — CUSTOMER books
//
// *** THIS IS THE MOST IMPORTANT FUNCTION IN THE WHOLE APP ***
//
// The double-booking problem: two customers could both call
// GET /availability, both see 3:00pm as free, and both try to
// book it milliseconds apart. If we just check "is this slot
// free?" then "create the appointment" as two separate steps,
// there's a race condition — both checks could pass before either
// booking is written.
//
// The fix: wrap the check + create in a single database
// transaction with SERIALIZABLE isolation. Postgres will make the
// second transaction fail/retry if it conflicts with the first,
// instead of letting both succeed. We catch that and return a
// clean "slot no longer available" error.
async function bookAppointment(req, res, next) {
  try {
    const { salonId, staffId, serviceId, startTime } = req.body;

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return res.status(404).json({ error: 'Service not found.' });

    const start = new Date(startTime);
    const end = new Date(start.getTime() + service.durationMinutes * 60000);

    if (start < new Date()) {
      return res.status(400).json({ error: 'Cannot book a time in the past.' });
    }

    const appointment = await prisma.$transaction(
      async (tx) => {
        // Re-check for overlap INSIDE the transaction, right before creating.
        const conflict = await tx.appointment.findFirst({
          where: {
            staffId,
            status: 'BOOKED',
            startTime: { lt: end },
            endTime: { gt: start },
          },
        });

        if (conflict) {
          const err = new Error('This time slot was just booked by someone else. Please pick another.');
          err.statusCode = 409;
          throw err;
        }

        return tx.appointment.create({
          data: {
            customerId: req.user.id,
            salonId,
            staffId,
            serviceId,
            startTime: start,
            endTime: end,
            status: 'BOOKED',
          },
          include: {
            service: true,
            staff: { include: { user: { select: { name: true } } } },
            salon: { select: { name: true } },
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    res.status(201).json({ appointment });
  } catch (err) {
    next(err);
  }
}

// GET /api/appointments/me — CUSTOMER's own booking history
async function getMyAppointments(req, res, next) {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { customerId: req.user.id },
      include: {
        service: true,
        salon: { select: { name: true, address: true } },
        staff: { include: { user: { select: { name: true } } } },
      },
      orderBy: { startTime: 'desc' },
    });

    res.json({ appointments });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/appointments/:id/cancel
// CUSTOMER (their own booking), or SALON_OWNER/STAFF (their salon's booking).
async function cancelAppointment(req, res, next) {
  try {
    const appointment = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found.' });

    const isOwnBooking = appointment.customerId === req.user.id;
    const isPrivileged = ['SALON_OWNER', 'ADMIN', 'STAFF'].includes(req.user.role);
    if (!isOwnBooking && !isPrivileged) {
      return res.status(403).json({ error: 'You cannot cancel this appointment.' });
    }

    // Simple cancellation policy: no cancelling within 2 hours of start.
    // Salon owners/admins can override this (e.g. customer called in).
    const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
    if (isOwnBooking && appointment.startTime < twoHoursFromNow) {
      return res.status(400).json({
        error: 'Appointments can only be cancelled at least 2 hours in advance.',
      });
    }

    if (appointment.status !== 'BOOKED') {
      return res.status(400).json({ error: `Appointment is already ${appointment.status.toLowerCase()}.` });
    }

    const updated = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
    });

    res.json({ appointment: updated, message: 'Appointment cancelled.' });
  } catch (err) {
    next(err);
  }
}

// GET /api/salons/:salonId/appointments — SALON_OWNER/STAFF dashboard view
async function getSalonAppointments(req, res, next) {
  try {
    const { salonId } = req.params;
    const { status, date } = req.query;

    const appointments = await prisma.appointment.findMany({
      where: {
        salonId,
        ...(status && { status }),
        ...(date && {
          startTime: {
            gte: new Date(date + 'T00:00:00.000Z'),
            lte: new Date(date + 'T23:59:59.999Z'),
          },
        }),
      },
      include: {
        customer: { select: { name: true, phone: true } },
        service: true,
        staff: { include: { user: { select: { name: true } } } },
      },
      orderBy: { startTime: 'asc' },
    });

    res.json({ appointments });
  } catch (err) {
    next(err);
  }
}

module.exports = { bookAppointment, getMyAppointments, cancelAppointment, getSalonAppointments };
