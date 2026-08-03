import pino from 'pino';
import { env } from './env.config';

const isProduction = env.NODE_ENV === 'production';
const isTest = env.NODE_ENV === 'test';

export const logger = pino({
  level: isTest ? 'silent' : process.env['LOG_LEVEL'] || 'info',
  transport:
    !isProduction && !isTest
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  base: isProduction ? { pid: process.pid } : undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
});
