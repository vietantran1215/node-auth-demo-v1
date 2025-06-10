import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: process.env.PORT || 8080,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
};