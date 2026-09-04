const prisma = require('../config/prisma');

// SLOT_INTERVAL_MINUTES controls the granularity of bookable start
// times, e.g. slots start every 15 mins (9:00, 9:15, 9:30 ...)
// regardless of how long the service itself takes.
const SLOT_INTERVAL_MINUTES = 15;

function timeStringToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Computes the list of bookable start times for a given staff member,
// on a given date, for a service of a given duration.
//
// Steps:
//  1. Find that staff's working hours for the day of week of `date`.
//     If none exist, they don't work that day -> no slots.
//  2. Check if the whole date falls inside an approved Leave range.
//     If so -> no slots at all that day.
//  3. Fetch existing BOOKED appointments for that staff on that date.
//  4. Walk forward through the working window in SLOT_INTERVAL steps,
//     and keep any candidate slot that:
//       - has enough room before the working day ends, AND
//       - does not overlap any existing appointment.
async function getAvailableSlots(staffId, dateStr, durationMinutes) {
  const date = new Date(dateStr + 'T00:00:00.000Z');
  const dayOfWeek = date.getUTCDay();

  const dayStart = new Date(dateStr + 'T00:00:00.000Z');
  const dayEnd = new Date(dateStr + 'T23:59:59.999Z');

  // 1. Working hours for this day of week
  const workingHours = await prisma.workingHour.findMany({
    where: { staffId, dayOfWeek },
  });
  if (workingHours.length === 0) return [];

  // 2. Leave check
  const leave = await prisma.leave.findFirst({
    where: {
      staffId,
      startDate: { lte: dayEnd },
      endDate: { gte: dayStart },
    },
  });
  if (leave) return [];

  // 3. Existing appointments that day (only BOOKED ones block slots)
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      staffId,
      status: 'BOOKED',
      startTime: { lte: dayEnd },
      endTime: { gte: dayStart },
    },
    select: { startTime: true, endTime: true },
  });

  const slots = [];

  // 4. Generate candidates within each working-hour window for the day
  //    (usually just one window, but this supports split shifts too)
  for (const window of workingHours) {
    const windowStartMin = timeStringToMinutes(window.startTime);
    const windowEndMin = timeStringToMinutes(window.endTime);

    for (let start = windowStartMin; start + durationMinutes <= windowEndMin; start += SLOT_INTERVAL_MINUTES) {
      const slotStart = new Date(dayStart.getTime() + start * 60000);
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);

      // Don't offer slots in the past for today
      if (slotStart < new Date()) continue;

      const overlaps = existingAppointments.some(
        (appt) => slotStart < appt.endTime && slotEnd > appt.startTime
      );

      if (!overlaps) {
        slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
      }
    }
  }

  return slots;
}

module.exports = { getAvailableSlots };
