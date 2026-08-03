import { Application } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { env } from './env.config';

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vistora Commerce REST API Specification',
      version: '1.0.0',
      description:
        'Enterprise Single Vendor Fashion eCommerce Platform REST API built with Node.js, Express, TypeScript, and Prisma ORM.',
      contact: {
        name: 'Vistora Engineering Team',
        email: 'support@vistoracommerce.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}${env.API_PREFIX}`,
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token in the format: Bearer <token>',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts', './src/routes/**/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);

export const setupSwagger = (app: Application): void => {
  // Swagger Documentation UI endpoint
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Raw JSON spec endpoint
  app.get(`${env.API_PREFIX}/swagger.json`, (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};
