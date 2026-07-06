'use strict';

// Mock dependencies
const AuthService = require('../../src/services/auth.service');
const UserRepository = require('../../src/repositories/user.repository');
const RefreshToken = require('../../src/models/RefreshToken');
const { generateAccessToken, generateRefreshToken } = require('../../src/utils/jwt.util');
const AppError = require('../../src/utils/AppError');

jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/models/RefreshToken');
jest.mock('../../src/utils/jwt.util');
jest.mock('../../src/utils/email.util');

describe('AuthService - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login()', () => {
    it('should throw an error if user email does not exist', async () => {
      UserRepository.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        AuthService.login('nonexistent@college.edu', 'password123', '127.0.0.1', 'Mozilla')
      ).rejects.toThrow(new AppError('Invalid email or password.', 401));
    });

    it('should throw an error if password does not match', async () => {
      const mockUser = {
        email: 'user@college.edu',
        status: 'active',
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      UserRepository.findByEmailWithPassword.mockResolvedValue(mockUser);

      await expect(
        AuthService.login('user@college.edu', 'wrong_pass', '127.0.0.1', 'Mozilla')
      ).rejects.toThrow(new AppError('Invalid email or password.', 401));
    });

    it('should throw an error if user is inactive', async () => {
      const mockUser = {
        email: 'user@college.edu',
        status: 'inactive',
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      UserRepository.findByEmailWithPassword.mockResolvedValue(mockUser);

      await expect(
        AuthService.login('user@college.edu', 'correct_pass', '127.0.0.1', 'Mozilla')
      ).rejects.toThrow(new AppError('Account is inactive. Contact administrator.', 403));
    });

    it('should log in successfully and return user profile details with tokens', async () => {
      const mockUser = {
        _id: 'mock_user_id',
        name: 'Jane Doe',
        email: 'jane@college.edu',
        role: 'accountant',
        mobile: '9876543210',
        status: 'active',
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      UserRepository.findByEmailWithPassword.mockResolvedValue(mockUser);
      UserRepository.updateLastLogin.mockResolvedValue(true);
      generateAccessToken.mockReturnValue('mock_access_token');
      generateRefreshToken.mockReturnValue('mock_refresh_token');
      RefreshToken.create.mockResolvedValue(true);

      const result = await AuthService.login('jane@college.edu', 'correct_pass', '127.0.0.1', 'Mozilla');

      expect(result.accessToken).toBe('mock_access_token');
      expect(result.refreshToken).toBe('mock_refresh_token');
      expect(result.user.name).toBe('Jane Doe');
      expect(result.user.role).toBe('accountant');
      expect(UserRepository.updateLastLogin).toHaveBeenCalledWith('mock_user_id');
    });
  });
});
