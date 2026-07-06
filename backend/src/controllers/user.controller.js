'use strict';

const UserService = require('../services/user.service');
const { sendSuccess, sendPaginated } = require('../utils/response.util');
const { MESSAGES } = require('../constants/messages');

class UserController {
  async createUser(req, res) {
    const user = await UserService.createUser(req.body);
    return sendSuccess(res, 201, MESSAGES.CREATE_SUCCESS('User'), user);
  }

  async getUserById(req, res) {
    const user = await UserService.getUserById(req.params.id);
    return sendSuccess(res, 200, MESSAGES.FETCH_SUCCESS('User'), user);
  }

  async updateUser(req, res) {
    const user = await UserService.updateUser(req.params.id, req.body);
    return sendSuccess(res, 200, MESSAGES.UPDATE_SUCCESS('User'), user);
  }

  async deleteUser(req, res) {
    await UserService.deleteUser(req.params.id);
    return sendSuccess(res, 200, MESSAGES.DELETE_SUCCESS('User'));
  }

  async findAllUsers(req, res) {
    const { users, meta } = await UserService.findAllUsers(req.query);
    return sendPaginated(res, 200, MESSAGES.FETCH_SUCCESS('Users'), users, meta);
  }
}

module.exports = new UserController();
