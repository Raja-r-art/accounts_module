'use strict';

const BaseRepository = require('./base.repository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() { super(User); }

  findByEmail(email) {
    return User.findByEmail(email);
  }

  findByEmailWithPassword(email) {
    return User.findByEmailWithPassword(email);
  }

  findByPasswordResetToken(hashedToken) {
    return User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');
  }

  async updateLastLogin(userId) {
    return User.findByIdAndUpdate(userId, {
      $set: { lastLogin: new Date() },
      $inc: { loginCount: 1 },
    });
  }
}

module.exports = new UserRepository();
