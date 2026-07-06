'use strict';

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { auditLog } = require('../middleware/auditLogger');
const {
  createUserValidator,
  updateUserValidator,
  mongoIdValidator,
} = require('../validators/user.validator');
const { ROLES } = require('../constants/roles');

// All routes require authentication
router.use(authenticate);

// Restricted to Super Admin and Principal
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL));

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve list of users
 *     tags: [Users]
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 */
router.route('/')
  .get(UserController.findAllUsers)
  .post(createUserValidator, auditLog('create', 'user'), UserController.createUser);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user profile details
 *     tags: [Users]
 *   put:
 *     summary: Update user details
 *     tags: [Users]
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 */
router.route('/:id')
  .get(mongoIdValidator, UserController.getUserById)
  .put(updateUserValidator, auditLog('update', 'user'), UserController.updateUser)
  .delete(mongoIdValidator, auditLog('delete', 'user'), UserController.deleteUser);

module.exports = router;
