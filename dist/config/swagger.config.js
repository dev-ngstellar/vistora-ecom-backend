"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = exports.swaggerSpec = void 0;
const path_1 = __importDefault(require("path"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const env_config_1 = require("./env.config");
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'VISTORA TRADING PRIVATE LIMITED API Documentation',
            version: '1.0.0',
            description: 'Official E-Commerce API for VISTORA TRADING PRIVATE LIMITED — High performance marketplace backend.',
            contact: {
                name: 'Vistora Customer & Technical Support',
                email: 'vistoraoffice123@gmail.com',
            },
        },
        servers: [
            {
                url: `http://localhost:${env_config_1.env.PORT || 4000}${env_config_1.env.API_PREFIX}`,
                description: 'Local Development Server',
            },
            {
                url: `https://api-vistora-ecom.ngstellar.com${env_config_1.env.API_PREFIX}`,
                description: 'Production Live Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT access token in the format: Bearer <token>',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [
        path_1.default.join(__dirname, '../modules/**/*.routes.{ts,js}'),
        path_1.default.join(__dirname, '../routes/**/*.{ts,js}'),
        path_1.default.join(process.cwd(), 'src/modules/**/*.routes.ts'),
        path_1.default.join(process.cwd(), 'dist/modules/**/*.routes.js'),
    ],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
const setupSwagger = (app) => {
    const swaggerUiOptions = {
        explorer: true,
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            docExpansion: 'list',
            filter: true,
            tryItOutEnabled: true,
        },
        customSiteTitle: 'Vistora Commerce API Specs & Testing',
    };
    // 1. Swagger Documentation UI endpoint (at /api-docs and /api/v1/docs)
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(exports.swaggerSpec, swaggerUiOptions));
    app.use(`${env_config_1.env.API_PREFIX}/docs`, swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(exports.swaggerSpec, swaggerUiOptions));
    // 2. Raw JSON specification endpoint
    app.get(`${env_config_1.env.API_PREFIX}/swagger.json`, (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(exports.swaggerSpec);
    });
};
exports.setupSwagger = setupSwagger;
