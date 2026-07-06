'use strict';

const StudentRepository = require('../repositories/student.repository');
const UserRepository = require('../repositories/user.repository');
const AppError = require('../utils/AppError');
const { MESSAGES } = require('../constants/messages');
const { getPaginationOptions, getPaginationMeta } = require('../utils/pagination.util');

class StudentService {
  async createStudent(studentData) {
    // Check if student with admission number or email already exists
    const existingByAdm = await StudentRepository.findByAdmissionNumber(studentData.admissionNumber);
    if (existingByAdm) {
      throw new AppError(MESSAGES.ALREADY_EXISTS(`Student with admission number ${studentData.admissionNumber}`), 409);
    }

    const existingByEmail = await StudentRepository.findByEmail(studentData.email);
    if (existingByEmail) {
      throw new AppError(MESSAGES.ALREADY_EXISTS(`Student with email ${studentData.email}`), 409);
    }

    // Auto-create a User account for the student
    const defaultPassword = studentData.password || `Stu@${studentData.admissionNumber}`;
    const user = await UserRepository.create({
      name: studentData.name,
      email: studentData.email,
      mobile: studentData.phone,
      password: defaultPassword,
      role: 'student',
      status: 'active',
      isEmailVerified: true,
    });

    studentData.user = user._id;

    return StudentRepository.create(studentData);
  }

  async getStudentById(id) {
    const student = await StudentRepository.findById(id, ['user']);
    if (!student) {
      throw new AppError(MESSAGES.NOT_FOUND('Student'), 404);
    }
    return student;
  }

  async updateStudent(id, studentData) {
    const student = await StudentRepository.findById(id);
    if (!student) {
      throw new AppError(MESSAGES.NOT_FOUND('Student'), 404);
    }

    // Check unique constraints if updating fields
    if (studentData.admissionNumber && studentData.admissionNumber.toUpperCase() !== student.admissionNumber) {
      const existingByAdm = await StudentRepository.findByAdmissionNumber(studentData.admissionNumber);
      if (existingByAdm) {
        throw new AppError(MESSAGES.ALREADY_EXISTS(`Student with admission number ${studentData.admissionNumber}`), 409);
      }
    }

    if (studentData.email && studentData.email.toLowerCase() !== student.email) {
      const existingByEmail = await StudentRepository.findByEmail(studentData.email);
      if (existingByEmail) {
        throw new AppError(MESSAGES.ALREADY_EXISTS(`Student with email ${studentData.email}`), 409);
      }
    }

    // Update Student
    const updatedStudent = await StudentRepository.updateById(id, studentData);

    // Synchronize User email/name/mobile if updated
    if (student.user && (studentData.name || studentData.email || studentData.phone)) {
      const userUpdate = {};
      if (studentData.name) userUpdate.name = studentData.name;
      if (studentData.email) userUpdate.email = studentData.email;
      if (studentData.phone) userUpdate.mobile = studentData.phone;
      await UserRepository.updateById(student.user, userUpdate);
    }

    return updatedStudent;
  }

  async deleteStudent(id) {
    const student = await StudentRepository.findById(id);
    if (!student) {
      throw new AppError(MESSAGES.NOT_FOUND('Student'), 404);
    }

    // Delete corresponding user
    if (student.user) {
      await UserRepository.deleteById(student.user);
    }

    return StudentRepository.deleteById(id);
  }

  async findAllStudents(query) {
    const { page, limit, skip, sort } = getPaginationOptions(query);
    const filter = StudentRepository.buildFilter(query);

    const students = await StudentRepository.findAll({
      filter,
      sort,
      skip,
      limit,
      populate: ['user'],
    });

    const total = await StudentRepository.count(filter);
    const meta = getPaginationMeta(total, page, limit);

    return { students, meta };
  }

  async uploadStudentDocument(id, file, docName) {
    const student = await StudentRepository.findById(id);
    if (!student) {
      throw new AppError(MESSAGES.NOT_FOUND('Student'), 404);
    }

    const document = {
      name: docName || file.originalname,
      path: `src/uploads/${file.filename}`,
      uploadedAt: new Date(),
    };

    student.documents.push(document);
    await student.save();
    return student;
  }
}

module.exports = new StudentService();
