const prisma = require('../config/prisma');

// POST /api/appointments/:id/review — CUSTOMER, only after COMPLETED
async function createReview(req, res, next) {
  try {
    const appointment = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found.' });

    if (appointment.customerId !== req.user.id) {
      return res.status(403).json({ error: 'You can only review your own appointments.' });
    }
    if (appointment.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'You can only review completed appointments.' });
    }

    const { rating, comment } = req.body;
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    const review = await prisma.review.create({
      data: {
        appointmentId: appointment.id,
        customerId: req.user.id,
        salonId: appointment.salonId,
        rating,
        comment,
      },
    });

    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
}

// GET /api/salons/:salonId/reviews — public
async function getSalonReviews(req, res, next) {
  try {
    const reviews = await prisma.review.findMany({
      where: { salonId: req.params.salonId },
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
}

module.exports = { createReview, getSalonReviews };
