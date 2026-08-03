import { createApp } from './app';
import { connectDatabase, disconnectDatabase, env, logger } from './config';

const app = createApp();

const startServer = async (): Promise<void> => {
  // Connect to PostgreSQL via Prisma ORM
  await connectDatabase();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Vistora Commerce REST API running on port ${env.PORT} [${env.NODE_ENV}]`);
    logger.info(`📍 Base API endpoint: http://localhost:${env.PORT}${env.API_PREFIX}`);
    logger.info(`🏥 Health check endpoint: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
  });

  // Graceful Shutdown Handler
  const gracefulShutdown = async (signal: string) => {
    logger.info(
      `Received ${signal}. Gracefully shutting down HTTP server and database connections...`,
    );

    server.close(async () => {
      await disconnectDatabase();
      logger.info('HTTP server and Database pool closed. Exiting process.');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => void gracefulShutdown('SIGINT'));

  process.on('unhandledRejection', (reason: Error) => {
    logger.error({ err: reason }, `Unhandled Promise Rejection: ${reason.message}`);
    if (env.NODE_ENV === 'production') {
      void gracefulShutdown('unhandledRejection');
    }
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error({ err: error }, `Uncaught Exception: ${error.message}`);
    void gracefulShutdown('uncaughtException');
  });
};

void startServer();
