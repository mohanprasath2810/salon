const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const staffList = await prisma.staff.findMany();
  console.log(`Found ${staffList.length} staff members.`);

  for (const staff of staffList) {
    for (const day of [0, 6]) { // 0 = Sunday, 6 = Saturday
      const exists = await prisma.workingHour.findFirst({
        where: { staffId: staff.id, dayOfWeek: day },
      });
      if (!exists) {
        await prisma.workingHour.create({
          data: {
            staffId: staff.id,
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '18:00',
          },
        });
        console.log(`Added day ${day} for staff ${staff.id}`);
      }
    }
  }

  const counts = await prisma.workingHour.groupBy({
    by: ['dayOfWeek'],
    _count: true,
  });
  console.log('Updated working hours breakdown by day:');
  console.log(counts);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
