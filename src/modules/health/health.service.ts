import { PrismaClient } from '@prisma/client';

export interface HealthStatus {
  status: 'UP' | 'DEGRADED' | 'DOWN';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  version: string;
  database: {
    connected: boolean;
    latencyMs?: number;
  };
  memory: {
    rss: string;
    heapTotal: string;
    heapUsed: string;
    external: string;
  };
}

export class HealthService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  public async getHealthStatus(): Promise<HealthStatus> {
    const memory = process.memoryUsage();
    let dbConnected = false;
    let dbLatencyMs: number | undefined;

    try {
      const startTime = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - startTime;
      dbConnected = true;
    } catch (err) {
      dbConnected = false;
    }

    return {
      status: dbConnected ? 'UP' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env['NODE_ENV'] || 'development',
      version: '1.0.0',
      database: {
        connected: dbConnected,
        latencyMs: dbLatencyMs,
      },
      memory: {
        rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memory.external / 1024 / 1024)} MB`,
      },
    };
  }
}
