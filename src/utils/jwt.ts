import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { activeRedisClient } from '../config/redis';
import type { StringValue } from 'ms';

interface TokenPayload {
  userId: string;
  deviceId?: string;
  exp?: number;
  iat?: number;
  jti?: string; // JWT ID for token identification
}

// Generate a unique token ID
const generateTokenId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export const generateAccessToken = (userId: string, deviceId: string): string => {
  // Generate a unique token ID
  const tokenId = generateTokenId();
  
  // Create the token with jti claim
  const token = jwt.sign({ userId, deviceId, jti: tokenId }, config.jwtSecret, {
    expiresIn: config.accessTokenExpiry as StringValue
  });
  
  // Store the token ID in Redis for tracking
  const decoded = jwt.decode(token) as TokenPayload;
  if (decoded && decoded.exp) {
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    if (expiresIn > 0) {
      try {
        // Add to user's active tokens set
        const userTokensKey = `user_tokens:${userId}`;
        // @ts-ignore - Redis client type definition issue
        activeRedisClient.sAdd(userTokensKey, tokenId);
        // @ts-ignore - Redis client type definition issue
        activeRedisClient.expire(userTokensKey, 60 * 60 * 24 * 7); // 7 days
        
        // Map token ID to the actual token for blacklisting
        const tokenMapKey = `token_map:${tokenId}`;
        activeRedisClient.set(tokenMapKey, token, {
          EX: expiresIn
        });
      } catch (error) {
        console.error('Error storing token tracking info:', error);
      }
    }
  }
  
  return token;
};

export const generateRefreshToken = (userId: string, deviceId: string): string => {
  const refreshToken = jwt.sign({ userId, deviceId }, config.jwtSecret, {
    expiresIn: config.refreshTokenExpiry as StringValue
  });

  // Store refresh token in Redis or fallback storage with device ID
  const redisKey = `refresh_token:${userId}:${deviceId}`;
  activeRedisClient.set(redisKey, refreshToken, {
    EX: 60 * 60 * 24 * 7 // 7 days in seconds
  });

  return refreshToken;
};

export const verifyAccessToken = async (token: string): Promise<TokenPayload | null> => {
  try {
    // First check if token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return null;
    }
    
    const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;
    
    // Check if the token ID is in the blacklist
    if (decoded.jti) {
      const isJtiBlacklisted = await isTokenIdBlacklisted(decoded.jti);
      if (isJtiBlacklisted) {
        return null;
      }
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = async (token: string): Promise<TokenPayload | null> => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;
    const { userId, deviceId } = decoded;
    
    if (!userId || !deviceId) {
      return null;
    }
    
    // Check if token is in Redis or fallback storage
    const redisKey = `refresh_token:${userId}:${deviceId}`;
    const storedToken = await activeRedisClient.get(redisKey);
    
    if (token !== storedToken) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
};

// Check if a token is blacklisted
export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  try {
    const redisKey = `blacklisted_token:${token}`;
    const result = await activeRedisClient.get(redisKey);
    return !!result;
  } catch (error) {
    console.error('Error checking token blacklist:', error);
    return false;
  }
};

// Check if a token ID is blacklisted
export const isTokenIdBlacklisted = async (jti: string): Promise<boolean> => {
  try {
    const redisKey = `blacklisted_jti:${jti}`;
    const result = await activeRedisClient.get(redisKey);
    return !!result;
  } catch (error) {
    console.error('Error checking token ID blacklist:', error);
    return false;
  }
};

// Blacklist an access token
export const blacklistAccessToken = async (token: string): Promise<boolean> => {
  try {
    // Get token expiration time to set the blacklist duration
    const decoded = jwt.decode(token) as TokenPayload;
    let expiration = 3600; // Default 1 hour if can't determine
    
    if (decoded && decoded.exp && decoded.iat) {
      // Calculate remaining time (exp - current time) in seconds
      expiration = decoded.exp - Math.floor(Date.now() / 1000);
      if (expiration < 0) expiration = 0; // Already expired
    }
    
    // Add token to blacklist with expiration
    const redisKey = `blacklisted_token:${token}`;
    await activeRedisClient.set(redisKey, '1', {
      EX: expiration > 0 ? expiration : 1 // Minimum 1 second
    });
    
    // Also blacklist the token ID if present
    if (decoded && decoded.jti) {
      await blacklistTokenId(decoded.jti, expiration);
      
      // Remove token ID from user's active tokens set
      if (decoded.userId) {
        try {
          const userTokensKey = `user_tokens:${decoded.userId}`;
          // @ts-ignore - Redis client type definition issue
          await activeRedisClient.sRem(userTokensKey, decoded.jti);
        } catch (error) {
          console.error('Error removing token from user tokens set:', error);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error blacklisting token:', error);
    return false;
  }
};

// Blacklist a token ID
export const blacklistTokenId = async (jti: string, expiration: number): Promise<boolean> => {
  try {
    const redisKey = `blacklisted_jti:${jti}`;
    await activeRedisClient.set(redisKey, '1', {
      EX: expiration > 0 ? expiration : 1 // Minimum 1 second
    });
    return true;
  } catch (error) {
    console.error('Error blacklisting token ID:', error);
    return false;
  }
};

// Blacklist all active access tokens for a user
export const blacklistAllUserTokens = async (userId: string): Promise<boolean> => {
  try {
    // Get all active token IDs for the user
    const userTokensKey = `user_tokens:${userId}`;
    // @ts-ignore - Redis client type definition issue
    const tokenIds = await activeRedisClient.sMembers(userTokensKey);
    
    if (!tokenIds || tokenIds.length === 0) {
      return true; // No tokens to blacklist
    }
    
    // Blacklist each token ID
    const blacklistPromises = tokenIds.map(async (jti: string) => {
      // Get the actual token from the map
      const tokenMapKey = `token_map:${jti}`;
      const token = await activeRedisClient.get(tokenMapKey);
      
      if (token) {
        // Get token expiration
        const decoded = jwt.decode(token) as TokenPayload;
        let expiration = 3600;
        
        if (decoded && decoded.exp) {
          expiration = decoded.exp - Math.floor(Date.now() / 1000);
          if (expiration < 0) expiration = 0;
        }
        
        // Blacklist the token ID
        await blacklistTokenId(jti, expiration);
      }
    });
    
    await Promise.all(blacklistPromises);
    
    // Clear the user's tokens set
    await activeRedisClient.del(userTokensKey);
    
    return true;
  } catch (error) {
    console.error('Error blacklisting all user tokens:', error);
    return false;
  }
};

// Invalidate a single device's refresh token and blacklist the access token
export const invalidateRefreshToken = async (userId: string, deviceId: string, accessToken?: string): Promise<boolean> => {
  try {
    // Invalidate refresh token
    const redisKey = `refresh_token:${userId}:${deviceId}`;
    await activeRedisClient.del(redisKey);
    
    // Blacklist access token if provided
    if (accessToken) {
      await blacklistAccessToken(accessToken);
    }
    
    return true;
  } catch (error) {
    console.error('Error invalidating tokens:', error);
    return false;
  }
};

// Invalidate all refresh tokens and access tokens for a user (logout from all devices)
export const invalidateAllRefreshTokens = async (userId: string, currentAccessToken?: string): Promise<boolean> => {
  try {
    // Find all keys matching the pattern refresh_token:userId:*
    const keys = await activeRedisClient.keys(`refresh_token:${userId}:*`);
    
    if (keys && keys.length > 0) {
      // Delete all found keys
      await activeRedisClient.del(keys);
    }
    
    // Blacklist all active access tokens for the user
    await blacklistAllUserTokens(userId);
    
    // Blacklist current access token if provided
    if (currentAccessToken) {
      await blacklistAccessToken(currentAccessToken);
    }
    
    return true;
  } catch (error) {
    console.error('Error invalidating all tokens:', error);
    return false;
  }
}; 