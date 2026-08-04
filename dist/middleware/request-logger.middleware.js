"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const pino_http_1 = __importDefault(require("pino-http"));
const logger_config_1 = require("../config/logger.config");
exports.requestLogger = (0, pino_http_1.default)({
    logger: logger_config_1.logger,
    customLogLevel: (_req, res, err) => {
        if (res.statusCode >= 500 || err) {
            return 'error';
        }
        if (res.statusCode >= 400) {
            return 'warn';
        }
        return 'info';
    },
    customSuccessMessage: (req, res) => {
        return `${req.method} ${req.url} - ${res.statusCode}`;
    },
    customErrorMessage: (req, res, err) => {
        return `${req.method} ${req.url} - ${res.statusCode}: ${err.message}`;
    },
});
