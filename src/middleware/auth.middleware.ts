import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, verifyRefreshToken } from '../utils/jwt';

// Extend Express Request interface to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        deviceId: string;
      };
    }
  }
}

export const authenticateAccessToken = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyAccessToken(token);

    if (!payload || !payload.userId || !payload.deviceId) {
      res.status(401).json({ error: 'Invalid or expired access token' });
      return;
    }

    req.user = { 
      userId: payload.userId,
      deviceId: payload.deviceId
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export const authenticateRefreshToken = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token required' });
      return;
    }

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload || !payload.userId || !payload.deviceId) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    req.user = { 
      userId: payload.userId,
      deviceId: payload.deviceId
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export const authenticateAnyToken = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    // Check for access token first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = await verifyAccessToken(token);
      
      if (payload && payload.userId && payload.deviceId) {
        req.user = { 
          userId: payload.userId,
          deviceId: payload.deviceId
        };
        next();
        return;
      }
    }
    
    // If access token fails, check refresh token
    const { refreshToken } = req.body;
    if (refreshToken) {
      const payload = await verifyRefreshToken(refreshToken);
      
      if (payload && payload.userId && payload.deviceId) {
        req.user = { 
          userId: payload.userId,
          deviceId: payload.deviceId
        };
        next();
        return;
      }
    }
    
    res.status(401).json({ error: 'Valid access or refresh token required' });
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}; 