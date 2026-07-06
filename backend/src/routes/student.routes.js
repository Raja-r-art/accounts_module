'use strict';

const express = require('express');
const router = express.Router();
const StudentController = require('../controllers/student.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { auditLog } = require('../middleware/auditLogger');
const { uploadDocument } = require('../config/multer');
const { createStudentValidator, updateStudentValidator } = require('../validators/student.validator');
const { mongoIdValidator } = require('../validators/user.validator');
const { ROLES } = require('../constants/roles');

router.use(authenticate);

// Listing and creating students
router.route('/')
  .get(authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT), StudentController.findAllStudents)
  .post(authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT), createStudentValidator, auditLog('create', 'student'), StudentController.createStudent);

// Get student details (Accessible to student/parent for their own profile or high roles)
router.route('/:id')
  .get(mongoIdValidator, authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT, ROLES.STUDENT, ROLES.PARENT), StudentController.getStudentById)
  .put(authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT), updateStudentValidator, auditLog('update', 'student'), StudentController.updateStudent)
  .delete(authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL), mongoIdValidator, auditLog('delete', 'student'), StudentController.deleteStudent);

// Upload Student Documents
router.post(
  '/:id/documents',
  mongoIdValidator,
  authorize(ROLES.SUPER_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT, ROLES.STUDENT),
  uploadDocument.single('document'),
  auditLog('update', 'student'),
  StudentController.uploadDocument
);

module.exports = router;
