import jwt from 'jsonwebtoken';
import User from './auth.model';
import {
  RegisterInput,
  LoginInput,
  AuthResponse,
  JwtPayload,
  SafeUser,
  IUser,
} from '../../types';

// ============================================================
// Custom Error Class
// ============================================================

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ============================================================
// Auth Service
// ============================================================

class AuthService {
  // ----------------------------------------------------------
  // Token Generators
  // ----------------------------------------------------------

  /**
   * Generate a short-lived ACCESS token (15m by default).
   */
  private generateAccessToken(user: IUser): string {
    const payload: JwtPayload = {
      userId: user.id,
      role: user.role,
      email: user.email,
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new AppError('JWT_SECRET is not configured', 500);

    const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  }

  /**
   * Generate a long-lived REFRESH token (7d by default).
   * Uses a separate secret so the two token types can't be swapped.
   */
  private generateRefreshToken(user: IUser): string {
    const payload: JwtPayload = {
      userId: user.id,
      role: user.role,
      email: user.email,
    };

    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh';
    if (!secret) throw new AppError('JWT_REFRESH_SECRET is not configured', 500);

    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  }

  /**
   * Verify a refresh token and return its payload.
   */
  private verifyRefreshToken(token: string): JwtPayload {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh';
    if (!secret) throw new AppError('JWT_REFRESH_SECRET is not configured', 500);

    try {
      return jwt.verify(token, secret) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Refresh token has expired. Please log in again.', 401);
      }
      throw new AppError('Invalid refresh token. Please log in again.', 401);
    }
  }

  // ----------------------------------------------------------
  // Register
  // ----------------------------------------------------------

  async register(input: RegisterInput): Promise<AuthResponse> {
    const { name, email, password, role } = input;

    if (!name || !email || !password) {
      throw new AppError('Name, email, and password are required', 400);
    }
    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new AppError('An account with this email already exists', 409);
    }

    const user = await User.create({ name, email, password, role: role || 'client' });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      success: true,
      accessToken,
      refreshToken,
      user: User.sanitize(user),
    };
  }

  // ----------------------------------------------------------
  // Login
  // ----------------------------------------------------------

  async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await User.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.status === 'suspended') {
      throw new AppError('Your account has been suspended. Please contact support.', 403);
    }

    const isPasswordValid = await User.comparePassword(password, user.password || '');
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      success: true,
      accessToken,
      refreshToken,
      user: User.sanitize(user),
    };
  }

  // ----------------------------------------------------------
  // Refresh Token — Issue new access token
  // ----------------------------------------------------------

  async refreshAccessToken(token: string): Promise<AuthResponse> {
    if (!token) {
      throw new AppError('Refresh token is required', 400);
    }

    // 1. Verify the refresh token
    const payload = this.verifyRefreshToken(token);

    // 2. Fetch current user to ensure they still exist and are active
    const user = await User.findById(payload.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    if (user.status === 'suspended') {
      throw new AppError('Your account has been suspended. Please contact support.', 403);
    }

    // 3. Issue fresh tokens (token rotation — both rotated on refresh)
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      success: true,
      accessToken,
      refreshToken,
      user: User.sanitize(user),
    };
  }

  // ----------------------------------------------------------
  // Get Current User (Me)
  // ----------------------------------------------------------

  async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }
    if (user.status === 'suspended') {
      throw new AppError('Your account has been suspended. Please contact support.', 403);
    }

    return User.sanitize(user);
  }
}

export default new AuthService();