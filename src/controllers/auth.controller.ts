import { NextFunction, Request, Response } from 'express';
import { findUserByUsername, createUser, findUserById } from '../models/user.model';
import { generateAccessToken, generateRefreshToken, invalidateRefreshToken } from '../utils/jwt';

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password, email, name } = req.body;

    // Validate input
    if (!username || !password || !email || !name) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    // Check if user already exists
    const existingUser = findUserByUsername(username);
    if (existingUser) {
      res.status(400).json({ error: 'Username already exists' });
      return;
    }

    // Create new user
    const newUser = createUser({
      username,
      password, // In a real app, this would be hashed
      email,
      name
    });

    // Generate tokens
    const accessToken = generateAccessToken(newUser.id);
    const refreshToken = generateRefreshToken(newUser.id);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    // Find user
    const user = findUserByUsername(username);
    if (!user || user.password !== password) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // The middleware has already verified the refresh token
    // and put the user ID in req.user
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    // Generate new tokens
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    res.json({
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Invalidate refresh token
    await invalidateRefreshToken(userId);

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
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
    res.status(500).json({ error: 'Server error' });
  }
};