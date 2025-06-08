import { createClient } from 'redis';
import { config } from './config';

export const redisClient = createClient({
  url: config.redisUrl
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis client connected');
  } catch (error) {
    console.error('Redis connection error:', error);
  }
}; 