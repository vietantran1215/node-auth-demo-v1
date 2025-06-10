import { NextFunction, Request, Response } from 'express';
import { findUserByUsername, createUser, findUserById, comparePasswords } from '../models/user.model';
import { generateAccessToken, generateRefreshToken, invalidateRefreshToken, invalidateAllRefreshTokens } from '../utils/jwt';
import { validateSignupData, validateLoginData } from '../utils/validation';
import { v4 as uuidv4 } from 'uuid';

// Helper to generate device ID
const getDeviceId = (req: Request): string => {
  const headerDeviceId = req.headers['x-device-id'];
  return headerDeviceId ? headerDeviceId as string: uuidv4();
};

// Helper to extract access token from Authorization header
const getAccessToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
};

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Validate input
    const validationResult = validateSignupData(req.body);
    if (!validationResult.isValid) {
      res.status(400).json({ 
        error: 'Validation failed', 
        details: validationResult.errors 
      });
      return;
    }
    
    const { username, password, email, name } = req.body;
    
    // Check if user already exists
    const existingUser = findUserByUsername(username);
    if (existingUser) {
      res.status(400).json({ 
        error: 'Validation failed',
        details: [{ field: 'username', message: 'Username already exists' }] 
      });
      return;
    }
    
    // Create new user with hashed password
    const newUser = await createUser({
      username,
      password, // Password will be hashed in the createUser function
      email,
      name
    });
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Validate input
    const validationResult = validateLoginData(req.body);
    if (!validationResult.isValid) {
      res.status(400).json({ 
        error: 'Validation failed', 
        details: validationResult.errors 
      });
      return;
    }
    
    const { username, password } = req.body;
    
    // Find user
    const user = findUserByUsername(username); // --> mongoose find()
    if (!user) {
      // Use generic error message to prevent username enumeration
      res.status(401).json({ 
        error: 'Authentication failed',
        details: [{ field: 'auth', message: 'Invalid username or password' }]
      });
      return;
    }
    
    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      // Use generic error message to prevent username enumeration
      res.status(401).json({ 
        error: 'Authentication failed',
        details: [{ field: 'auth', message: 'Invalid username or password' }]
      });
      return;
    }
    
    // Get or generate a device ID
    const deviceId = getDeviceId(req);
    
    // Generate tokens for this device
    const accessToken = generateAccessToken(user.id, deviceId);
    const refreshToken = generateRefreshToken(user.id, deviceId);
    
    // Set device ID in response headers
    res.setHeader('X-Device-Id', deviceId);
    
    res.json({
      accessToken,
      refreshToken,
      deviceId
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // The middleware has already verified the refresh token
    // and put the user ID in req.user
    const userId = req.user?.userId;
    const deviceId = req.user?.deviceId;

    if (!userId || !deviceId) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    // Generate new tokens for this device
    const accessToken = generateAccessToken(userId, deviceId);
    const refreshToken = generateRefreshToken(userId, deviceId);

    res.json({
      accessToken,
      refreshToken,
      deviceId
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Logout from a single device
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const deviceId = req.user?.deviceId;
    const accessToken = getAccessToken(req);

    if (!userId || !deviceId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Invalidate refresh token for this device only and blacklist the access token
    await invalidateRefreshToken(userId, deviceId, accessToken || undefined);

    res.json({ message: 'Logged out successfully from this device' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Logout from all devices
export const logoutAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const accessToken = getAccessToken(req);

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Invalidate all refresh tokens for this user and blacklist the current access token
    await invalidateAllRefreshTokens(userId, accessToken || undefined);

    res.json({ message: 'Logged out successfully from all devices' });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Find user
    const user = findUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};