"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("@/lib/redis"));
exports.mediaQueue = new bullmq_1.Queue('media-ingestion', {
    connection: redis_1.default,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 1000 },
    },
});
