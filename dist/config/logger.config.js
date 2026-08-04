"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const env_config_1 = require("./env.config");
const isProduction = env_config_1.env.NODE_ENV === 'production';
const isTest = env_config_1.env.NODE_ENV === 'test';
exports.logger = (0, pino_1.default)({
    level: isTest ? 'silent' : process.env['LOG_LEVEL'] || 'info',
    transport: !isProduction && !isTest
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
    timestamp: pino_1.default.stdTimeFunctions.isoTime,
});
