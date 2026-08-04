"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const env_config_1 = require("./env.config");
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Vistora Commerce REST API Specification',
            version: '1.0.0',
            description: 'Enterprise Single Vendor Fashion eCommerce Platform REST API built with Node.js, Express, TypeScript, and Prisma ORM.',
            contact: {
                name: 'Vistora Engineering Team',
                email: 'support@vistoracommerce.com',
            },
        },
        servers: [
            {
                url: `http://localhost:${env_config_1.env.PORT}${env_config_1.env.API_PREFIX}`,
                description: 'Development Server',
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
    apis: ['./src/modules/**/*.routes.ts', './src/routes/**/*.ts'],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
const setupSwagger = (app) => {
    // Swagger Documentation UI endpoint
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(exports.swaggerSpec));
    // Raw JSON spec endpoint
    app.get(`${env_config_1.env.API_PREFIX}/swagger.json`, (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(exports.swaggerSpec);
    });
};
exports.setupSwagger = setupSwagger;
