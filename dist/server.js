"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./config");
const app = (0, app_1.createApp)();
const startServer = async () => {
    // Connect to PostgreSQL via Prisma ORM
    await (0, config_1.connectDatabase)();
    const server = app.listen(config_1.env.PORT, () => {
        config_1.logger.info(`🚀 Vistora Commerce REST API running on port ${config_1.env.PORT} [${config_1.env.NODE_ENV}]`);
        config_1.logger.info(`📍 Base API endpoint: http://localhost:${config_1.env.PORT}${config_1.env.API_PREFIX}`);
        config_1.logger.info(`🏥 Health check endpoint: http://localhost:${config_1.env.PORT}${config_1.env.API_PREFIX}/health`);
    });
    // Graceful Shutdown Handler
    const gracefulShutdown = async (signal) => {
        config_1.logger.info(`Received ${signal}. Gracefully shutting down HTTP server and database connections...`);
        server.close(async () => {
            await (0, config_1.disconnectDatabase)();
            config_1.logger.info('HTTP server and Database pool closed. Exiting process.');
            process.exit(0);
        });
        setTimeout(() => {
            config_1.logger.error('Could not close connections in time, forcefully shutting down.');
            process.exit(1);
        }, 10000);
    };
    process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => void gracefulShutdown('SIGINT'));
    process.on('unhandledRejection', (reason) => {
        config_1.logger.error({ err: reason }, `Unhandled Promise Rejection: ${reason.message}`);
        if (config_1.env.NODE_ENV === 'production') {
            void gracefulShutdown('unhandledRejection');
        }
    });
    process.on('uncaughtException', (error) => {
        config_1.logger.error({ err: error }, `Uncaught Exception: ${error.message}`);
        void gracefulShutdown('uncaughtException');
    });
};
void startServer();
