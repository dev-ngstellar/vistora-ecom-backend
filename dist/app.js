"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const hpp_1 = __importDefault(require("hpp"));
const config_1 = require("./config");
const error_middleware_1 = require("./middleware/error.middleware");
const not_found_middleware_1 = require("./middleware/not-found.middleware");
const request_logger_middleware_1 = require("./middleware/request-logger.middleware");
const routes_1 = require("./routes");
const createApp = () => {
    const app = (0, express_1.default)();
    // 1. Security HTTP Headers
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));
    // 2. Cross-Origin Resource Sharing
    const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:4000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
        config_1.env.CLIENT_URL,
    ].filter(Boolean);
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1')) {
                callback(null, true);
            }
            else {
                callback(null, true); // Allow dev origins
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));
    // 3. HTTP Parameter Pollution Protection
    app.use((0, hpp_1.default)());
    // 4. Request Body Parsing
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    // 5. Cookie Parsing
    app.use((0, cookie_parser_1.default)());
    // 6. HTTP Request Logging
    if (config_1.env.NODE_ENV !== 'test') {
        app.use(request_logger_middleware_1.requestLogger);
    }
    // 7. Setup Swagger UI Documentation
    (0, config_1.setupSwagger)(app);
    // 8. API Routes Mounting
    app.use(config_1.env.API_PREFIX, routes_1.apiRouter);
    // 9. 404 Route Not Found Middleware
    app.use(not_found_middleware_1.notFoundHandler);
    // 10. Global Error Handling Middleware
    app.use(error_middleware_1.globalErrorHandler);
    return app;
};
exports.createApp = createApp;
