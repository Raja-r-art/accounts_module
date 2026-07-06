'use strict';

const UserRepository = require('../repositories/user.repository');
const AppError = require('../utils/AppError');
const { MESSAGES } = require('../constants/messages');
const { getPaginationOptions, getPaginationMeta } = require('../utils/pagination.util');

class UserService {
  async createUser(userData) {
    const existing = await UserRepository.findByEmail(userData.email);
    if (existing) {
      throw new AppError(MESSAGES.ALREADY_EXISTS('User with this email'), 409);
    }
    return UserRepository.create(userData);
  }

  async getUserById(id) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new AppError(MESSAGES.NOT_FOUND('User'), 404);
    }
    return user;
  }

  async updateUser(id, updateData) {
    // Prevent direct password updates via CRUD
    delete updateData.password;

    const user = await UserRepository.findById(id);
    if (!user) {
      throw new AppError(MESSAGES.NOT_FOUND('User'), 404);
    }

    if (updateData.email && updateData.email !== user.email) {
      const existing = await UserRepository.findByEmail(updateData.email);
      if (existing) {
        throw new AppError(MESSAGES.ALREADY_EXISTS('User with this email'), 409);
      }
    }

    return UserRepository.updateById(id, updateData);
  }

  async deleteUser(id) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new AppError(MESSAGES.NOT_FOUND('User'), 404);
    }
    return UserRepository.deleteById(id);
  }

  async findAllUsers(query) {
    const { page, limit, skip, sort } = getPaginationOptions(query);
    
    // Build filter
    const filter = {};
    if (query.role) filter.role = query.role;
    if (query.status) filter.status = query.status;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { mobile: { $regex: query.search, $options: 'i' } },
      ];
    }

    const users = await UserRepository.findAll({
      filter,
      sort,
      skip,
      limit,
    });

    const total = await UserRepository.count(filter);
    const meta = getPaginationMeta(total, page, limit);

    return { users, meta };
  }
}

module.exports = new UserService();
