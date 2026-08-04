"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const client_1 = require("@prisma/client");
class HealthService {
    prisma;
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async getHealthStatus() {
        const memory = process.memoryUsage();
        let dbConnected = false;
        let dbLatencyMs;
        try {
            const startTime = Date.now();
            await this.prisma.$queryRaw `SELECT 1`;
            dbLatencyMs = Date.now() - startTime;
            dbConnected = true;
        }
        catch (err) {
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
exports.HealthService = HealthService;
