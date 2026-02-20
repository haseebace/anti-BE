"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const ioredis_1 = __importDefault(require("ioredis"));
const path_1 = __importDefault(require("path"));
// Load environment variables from .env.local
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env.local') });
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
    console.error('❌ REDIS_URL environment variable is not set.');
    process.exit(1);
}
// Mask password for logging
const maskedUrl = redisUrl.replace(/(:[^:@]+@)/, ':****@');
console.log(`Testing connection to: ${maskedUrl}`);
const redis = new ioredis_1.default(redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
        if (times > 3) {
            return null; // Stop retrying
        }
        return Math.min(times * 50, 2000);
    },
});
redis.on('error', (err) => {
    console.error('❌ Redis Connection Error:', err.message);
    if (err.message.includes('ENOTFOUND')) {
        console.error(`
    Diagnosing ENOTFOUND:
    - Hostname could not be resolved.
    - Check if the hostname is correct.
    - Check your internet connection.
    - Check if you have any firewall/VPN blocking DNS.
    `);
    }
});
async function testConnection() {
    try {
        console.log('Attempting to connect...');
        await redis.ping();
        console.log('✅ Redis Connection Successful! PONG received.');
        await redis.quit();
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Failed to connect to Redis:', error);
        await redis.quit();
        process.exit(1);
    }
}
testConnection();
