import dotenv from 'dotenv';
import Redis from 'ioredis';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error('❌ REDIS_URL environment variable is not set.');
  process.exit(1);
}

// Mask password for logging
const maskedUrl = redisUrl.replace(/(:[^:@]+@)/, ':****@');
console.log(`Testing connection to: ${maskedUrl}`);

const redis = new Redis(redisUrl, {
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
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    await redis.quit();
    process.exit(1);
  }
}

testConnection();
