"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const env_config_1 = require("./env.config");
const logger_config_1 = require("./logger.config");
const createPrismaClient = () => {
    const client = new client_1.PrismaClient({
        log: env_config_1.env.NODE_ENV === 'development'
            ? [
                { emit: 'event', level: 'query' },
                { emit: 'stdout', level: 'error' },
                { emit: 'stdout', level: 'info' },
                { emit: 'stdout', level: 'warn' },
            ]
            : [{ emit: 'stdout', level: 'error' }],
    });
    if (env_config_1.env.NODE_ENV === 'development') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        client.$on('query', (e) => {
            logger_config_1.logger.debug(`Prisma Query: ${e.query} [Params: ${e.params}] - Duration: ${e.duration}ms`);
        });
    }
    return client;
};
exports.prisma = globalThis.prismaGlobal ?? createPrismaClient();
if (env_config_1.env.NODE_ENV !== 'production') {
    globalThis.prismaGlobal = exports.prisma;
}
const connectDatabase = async () => {
    try {
        await exports.prisma.$connect();
        logger_config_1.logger.info('🐘 PostgreSQL Database connected successfully via Prisma ORM');
    }
    catch (error) {
        logger_config_1.logger.error({ err: error }, '❌ PostgreSQL Database connection failure');
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    try {
        await exports.prisma.$disconnect();
        logger_config_1.logger.info('🐘 PostgreSQL Database disconnected cleanly');
    }
    catch (error) {
        logger_config_1.logger.error({ err: error }, '❌ Error during Database disconnection');
    }
};
exports.disconnectDatabase = disconnectDatabase;
