import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SWAGGER API DOCUMENTATION CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CADDCORE Job Portal API',
      version: '1.0.0',
      description: 'Complete Job Portal REST API Documentation - Jobs, Applications, Companies, Users, Notifications',
      contact: {
        name: 'CADDCORE',
        email: 'support@caddcore.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      { name: 'Jobs', description: 'Job management endpoints' },
      { name: 'Applications', description: 'Job application endpoints' },
      { name: 'Companies', description: 'Company management endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Notifications', description: 'Notification endpoints' },
    ],
  },
  apis: [
    './src/app/routes/**/*.ts',
    './src/app/modules/**/*.routes.ts',
    './src/swagger-docs/*.ts',
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export function setupSwagger(app: Express): void {
  // Serve Swagger UI at /api-docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'CADDCORE Job Portal API',
  }));

  // Serve raw swagger JSON at /api-docs.json
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('📚 Swagger docs available at: http://localhost:5000/api-docs');
}

export default swaggerSpec;
