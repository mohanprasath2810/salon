const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Salon Booking Platform API',
      version: '1.0.0',
      description:
        'Shared backend API for the customer web app, customer mobile app, salon dashboard, and admin dashboard.',
    },
    servers: [{ url: '/', description: 'API base path' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  // swagger-jsdoc scans these files for /** @swagger ... */ comment blocks
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
