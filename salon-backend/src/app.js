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
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0 || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed === origin) return true;
        if (allowed.includes('vercel.app') && origin.endsWith('.vercel.app')) return true;
        return false;
      });
      if (isAllowed) return callback(null, true);
      // Fallback: allow vercel.app domains and localhost by default for ease of deployment
      if (origin.endsWith('.vercel.app') || origin.includes('localhost')) {
        return callback(null, true);
      }
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json()); // parse JSON bodies
app.use(morgan('dev')); // request logging

// --- API docs ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Health check (useful for uptime monitoring / deploy checks) ---
app.get(['/api/health', '/health', '/'], (req, res) => res.json({ status: 'ok' }));

// --- Routes ---
// Mounted on both /api/* and /* so requests succeed regardless of whether
// the client includes the /api prefix in its base URL.
const apiRoutes = [
  ['/auth', authRoutes],
  ['/salons', salonRoutes],
  ['/services', serviceRoutes],
  ['/staff', staffRoutes],
  ['/appointments', appointmentRoutes],
  ['/admin', adminRoutes],
];

apiRoutes.forEach(([routePath, router]) => {
  app.use(`/api${routePath}`, router);
  app.use(routePath, router);
});

// --- 404 fallback ---
app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));

// --- Central error handler (must be last) ---
app.use(errorHandler);

module.exports = app;
