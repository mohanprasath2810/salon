const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./utils/swagger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const salonRoutes = require('./routes/salon.routes');
const serviceRoutes = require('./routes/service.routes');
const staffRoutes = require('./routes/staff.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// --- Security & core middleware ---
app.use(helmet()); // sets safe HTTP headers
app.use(
  cors({
    origin: (process.env.CORS_ORIGINS || '').split(',').filter(Boolean),
    credentials: true,
  })
);
app.use(express.json()); // parse JSON bodies
app.use(morgan('dev')); // request logging

// --- API docs ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Health check (useful for uptime monitoring / deploy checks) ---
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// --- Routes ---
// Every frontend (web, mobile, salon dashboard, admin dashboard) hits
// these SAME routes. Which data they get back / what they're allowed
// to do is controlled entirely by the JWT role, not by which app called it.
app.use('/api/auth', authRoutes);
app.use('/api/salons', salonRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);

// --- 404 fallback ---
app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));

// --- Central error handler (must be last) ---
app.use(errorHandler);

module.exports = app;
