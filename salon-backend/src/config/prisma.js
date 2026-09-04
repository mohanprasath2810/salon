// Single shared Prisma client instance.
// Why: creating a new PrismaClient() in every file opens a new DB
// connection pool each time — this file makes sure the whole app
// reuses ONE client.
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
