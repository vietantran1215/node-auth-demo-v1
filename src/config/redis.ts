import { createClient } from 'redis';
import { config } from './config';

// Create Redis client with retry strategy
export const redisClient = createClient({
  url: config.redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      // Maximum retry delay is 10 seconds
      const delay = Math.min(retries * 500, 10000);
      console.log(`Redis reconnecting in ${delay}ms (attempt ${retries})`);
      return delay;
    }
  }
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Redis client connected'));
redisClient.on('reconnecting', () => console.log('Redis client reconnecting...'));
redisClient.on('ready', () => console.log('Redis client ready'));

// Define an interface for the Redis client operations we need
interface RedisClientInterface {
  connect(): Promise<void>;
  set(key: string, value: string, options?: { EX?: number }): Promise<string>;
  get(key: string): Promise<string | null>;
  del(keys: string | string[]): Promise<number>;
  keys(pattern: string): Promise<string[]>;
}

// Mock Redis client implementation
const mockRedisClient = {
  isConnected: false,
  storage: new Map<string, string>(),
  
  async connect(): Promise<void> {
    this.isConnected = true;
    console.log('Using in-memory mock Redis storage');
  },
  
  async set(key: string, value: string, options?: { EX?: number }): Promise<string> {
    this.storage.set(key, value);
    return 'OK';
  },
  
  async get(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  },
  
  async del(keys: string | string[]): Promise<number> {
    if (typeof keys === 'string') {
      const exists = this.storage.has(keys);
      this.storage.delete(keys);
      return exists ? 1 : 0;
    } else {
      let count = 0;
      for (const key of keys) {
        if (this.storage.has(key)) {
          this.storage.delete(key);
          count++;
        }
      }
      return count;
    }
  },
  
  async keys(pattern: string): Promise<string[]> {
    const result: string[] = [];
    // Simple pattern matching for keys (only supports pattern:*)
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      for (const key of this.storage.keys()) {
        if (key.startsWith(prefix)) {
          result.push(key);
        }
      }
    } else {
      // Exact match
      if (this.storage.has(pattern)) {
        result.push(pattern);
      }
    }
    return result;
  }
};

// Export the client to use (real Redis or mock)
export let activeRedisClient: RedisClientInterface;

export const connectRedis = async (): Promise<void> => {
  try {
    // Try to connect to Redis
    await redisClient.connect();
    activeRedisClient = redisClient as unknown as RedisClientInterface;
    console.log('Connected to Redis successfully');
  } catch (error) {
    console.error('Redis connection failed, using in-memory storage instead:', error);
    // Fallback to mock implementation
    await mockRedisClient.connect();
    activeRedisClient = mockRedisClient as unknown as RedisClientInterface;
  }
}; 