import { Application } from 'express';
import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { env } from './env.config';

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VISTORA TRADING PRIVATE LIMITED API Documentation',
      version: '1.0.0',
      description:
        'Official E-Commerce API for VISTORA TRADING PRIVATE LIMITED — High performance marketplace backend.',
      contact: {
        name: 'Vistora Customer & Technical Support',
        email: 'vistoraoffice123@gmail.com',
      },
    },

    servers: [
      {
        url: `http://localhost:${env.PORT || 4000}${env.API_PREFIX}`,
        description: 'Local Development Server',
      },
      {
        url: `https://api-vistora-ecom.ngstellar.com${env.API_PREFIX}`,
        description: 'Production Live Server',
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
  apis: [
    path.join(__dirname, '../modules/**/*.routes.{ts,js}'),
    path.join(__dirname, '../routes/**/*.{ts,js}'),
    path.join(process.cwd(), 'src/modules/**/*.routes.ts'),
    path.join(process.cwd(), 'dist/modules/**/*.routes.js'),
  ],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);

export const setupSwagger = (app: Application): void => {
  const swaggerUiOptions: swaggerUi.SwaggerUiOptions = {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'Vistora Commerce API Specs & Testing',
  };

  // 1. Swagger Documentation UI endpoint (at /api-docs and /api/v1/docs)
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
  app.use(`${env.API_PREFIX}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  // 2. Raw JSON specification endpoint
  app.get(`${env.API_PREFIX}/swagger.json`, (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};
