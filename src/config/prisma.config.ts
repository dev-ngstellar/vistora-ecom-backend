import { PrismaClient } from '@prisma/client';
import { env } from './env.config';
import { logger } from './logger.config';

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const createPrismaClient = (): PrismaClient => {
  const client = new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'stdout', level: 'error' },
            { emit: 'stdout', level: 'info' },
            { emit: 'stdout', level: 'warn' },
          ]
        : [{ emit: 'stdout', level: 'error' }],
  });

  if (env.NODE_ENV === 'development') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).$on('query', (e: { query: string; params: string; duration: number }) => {
      logger.debug(`Prisma Query: ${e.query} [Params: ${e.params}] - Duration: ${e.duration}ms`);
    });
  }

  return client;
};

export const prisma = globalThis.prismaGlobal ?? createPrismaClient();

if (env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('🐘 PostgreSQL Database connected successfully via Prisma ORM');
  } catch (error) {
    logger.error({ err: error }, '❌ PostgreSQL Database connection failure');
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('🐘 PostgreSQL Database disconnected cleanly');
  } catch (error) {
    logger.error({ err: error }, '❌ Error during Database disconnection');
  }
};
