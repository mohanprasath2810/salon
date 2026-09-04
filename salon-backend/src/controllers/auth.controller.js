const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const { signToken } = require('../utils/jwt');

// POST /api/auth/register
// Public. Anyone can register as a CUSTOMER through this endpoint.
// SALON_OWNER / STAFF / ADMIN accounts are created differently
// (owners self-register but as a distinct step; staff are invited
// by their salon owner; admins are seeded directly in the DB) —
// see README for the reasoning on why we don't let people just
// pick "admin" from a dropdown at signup.
async function register(req, res, next) {
  try {
    const { name, email, password, phone, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Only allow self-registration as CUSTOMER or SALON_OWNER.
    // STAFF accounts are created by the salon dashboard (owner invites them).
    // ADMIN accounts are never created through this public endpoint.
    const allowedSelfRegisterRoles = ['CUSTOMER', 'SALON_OWNER'];
    const finalRole = allowedSelfRegisterRoles.includes(role) ? role : 'CUSTOMER';

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, phone, role: finalRole },
    });

    const token = signToken(user);

    res.status(201).json({
      message: 'Registered successfully.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
// Public. Same endpoint for every role — the returned token's
// `role` field is what determines which dashboard/app the
// frontend routes them into after login.
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user);

    res.json({
      message: 'Logged in successfully.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
// Protected. Lets any frontend fetch "who am I" on app load to
// restore session state from a stored token.
async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe };
