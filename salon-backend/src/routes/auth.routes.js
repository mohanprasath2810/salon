const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../middleware/validators/auth.validator');
const authenticate = require('../middleware/auth');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new customer or salon owner account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               phone: { type: string }
 *               role: { type: string, enum: [CUSTOMER, SALON_OWNER] }
 *     responses:
 *       201: { description: Registered successfully }
 *       409: { description: Email already exists }
 */
router.post('/register', registerValidator, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password (works for every role)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Logged in successfully }
 *       401: { description: Invalid credentials }
 */
router.post('/login', loginValidator, login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get the currently logged-in user's profile
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Current user }
 */
router.get('/me', authenticate, getMe);

module.exports = router;
