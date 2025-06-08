import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { redisClient } from '../config/redis';
import type { StringValue } from 'ms';

interface TokenPayload {
  userId: string;
}

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.accessTokenExpiry as StringValue
  });
};

export const generateRefreshToken = (userId: string): string => {
  const refreshToken = jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.refreshTokenExpiry as StringValue
  });

  // Store refresh token in Redis
  const redisKey = `refresh_token:${userId}`;
  redisClient.set(redisKey, refreshToken, {
    EX: 60 * 60 * 24 * 7 // 7 days in seconds
  });

  return refreshToken;
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, config.jwtSecret) as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = async (token: string): Promise<TokenPayload | null> => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;
    const userId = decoded.userId;

    // Check if token is in Redis
    const redisKey = `refresh_token:${userId}`;
    const storedToken = await redisClient.get(redisKey);

    if (token !== storedToken) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
};

export const invalidateRefreshToken = async (userId: string): Promise<boolean> => {
  try {
    const redisKey = `refresh_token:${userId}`;
    await redisClient.del(redisKey);
    return true;
  } catch (error) {
    return false;
  }
}; 