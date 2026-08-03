import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import { env, setupSwagger } from './config';
import { globalErrorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/not-found.middleware';
import { requestLogger } from './middleware/request-logger.middleware';
import { apiRouter } from './routes';

export const createApp = (): Application => {
  const app: Application = express();

  // 1. Security HTTP Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // 2. Cross-Origin Resource Sharing
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    env.CLIENT_URL,
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1')) {
          callback(null, true);
        } else {
          callback(null, true); // Allow dev origins
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }),
  );

  // 3. HTTP Parameter Pollution Protection
  app.use(hpp());

  // 4. Request Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 5. Cookie Parsing
  app.use(cookieParser());

  // 6. HTTP Request Logging
  if (env.NODE_ENV !== 'test') {
    app.use(requestLogger);
  }

  // 7. Setup Swagger UI Documentation
  setupSwagger(app);

  // 8. API Routes Mounting
  app.use(env.API_PREFIX, apiRouter);

  // 9. 404 Route Not Found Middleware
  app.use(notFoundHandler);

  // 10. Global Error Handling Middleware
  app.use(globalErrorHandler);

  return app;
};
