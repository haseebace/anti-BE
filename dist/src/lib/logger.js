"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const path_1 = __importDefault(require("path"));
const streams = [
    { stream: process.stdout },
    { stream: pino_1.default.destination(path_1.default.resolve(process.cwd(), 'logs', 'worker.log')) },
];
exports.logger = (0, pino_1.default)({
    level: process.env.LOG_LEVEL || 'debug', // Default to debug for now
    transport: {
        targets: [
            {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                },
            },
            {
                target: 'pino/file',
                options: {
                    destination: path_1.default.resolve(process.cwd(), 'logs', 'worker.log'),
                    mkdir: true
                }
            }
        ],
    },
});
