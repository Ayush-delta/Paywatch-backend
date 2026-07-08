import mongoose from 'mongoose';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: './.env.development.local' });

const { DB_URI, REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD } = process.env;

console.log('Env variables loaded:');
console.log('DB_URI:', DB_URI ? 'Exists' : 'Missing');
console.log('REDIS_HOST:', REDIS_HOST);

const testMongo = async () => {
  console.log('\n--- Testing MongoDB ---');
  const start = Date.now();
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(DB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB Connected in ${Date.now() - start}ms`);
    await mongoose.disconnect();
  } catch (err) {
    console.error(`MongoDB Connection Failed after ${Date.now() - start}ms:`, err.message);
  }
};

const testRedis = async () => {
  console.log('\n--- Testing Redis ---');
  const start = Date.now();
  const isUpstash = REDIS_HOST?.includes('upstash');
  const redis = new Redis({
    host: REDIS_HOST || '127.0.0.1',
    port: parseInt(REDIS_PORT || '6379'),
    username: REDIS_USERNAME || undefined,
    password: REDIS_PASSWORD || undefined,
    tls: isUpstash ? {} : undefined,
    enableReadyCheck: false,
    maxRetriesPerRequest: 0, // Fail immediately for testing
    connectTimeout: 5000,
  });

  return new Promise((resolve) => {
    redis.on('connect', () => {
      console.log(`Redis Connected in ${Date.now() - start}ms`);
      redis.disconnect();
      resolve();
    });

    redis.on('error', (err) => {
      console.error(`Redis Connection Error after ${Date.now() - start}ms:`, err.message);
      redis.disconnect();
      resolve();
    });

    setTimeout(() => {
      console.error(`Redis connection timed out after 5000ms`);
      redis.disconnect();
      resolve();
    }, 6000);
  });
};

const run = async () => {
  await testMongo();
  await testRedis();
  process.exit(0);
};

run();
