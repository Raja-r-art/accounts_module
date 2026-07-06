'use strict';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Student = require('../../src/models/Student');
const FeeStructure = require('../../src/models/FeeStructure');
const StudentFee = require('../../src/models/StudentFee');
const { generateAccessToken } = require('../../src/utils/jwt.util');

let mongoServer;
let accountantToken;
let studentToken;
let mockStudent;
let mockFeeStructure;
let mockStudentFee;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create accountant user and student user
  const accountant = await User.create({
    name: 'Jane Accountant',
    email: 'accountant@test.edu',
    password: 'Password123!',
    role: 'accountant',
    status: 'active',
  });

  const studentUser = await User.create({
    name: 'Tom Student',
    email: 'tom@test.edu',
    password: 'Password123!',
    role: 'student',
    status: 'active',
  });

  // Generate mock JWT tokens
  accountantToken = generateAccessToken({ userId: accountant._id.toString(), role: 'accountant' });
  studentToken = generateAccessToken({ userId: studentUser._id.toString(), role: 'student' });

  // Create mock Student profile
  mockStudent = await Student.create({
    admissionNumber: 'CS26110',
    name: 'Tom Student',
    department: 'Computer Science',
    course: 'B.Tech CS',
    semester: 1,
    academicYear: '2026-2027',
    gender: 'male',
    email: 'tom@test.edu',
    phone: '9988776655',
    user: studentUser._id,
  });

  // Create mock Fee Structure
  mockFeeStructure = await FeeStructure.create({
    course: 'B.Tech CS',
    semester: 1,
    feeType: 'tuition_fee',
    amount: 50000,
    dueDate: new Date('2026-12-15'),
    academicYear: '2026-2027',
    description: 'B.Tech CS tuition fee',
    isActive: true,
  });

  // Create mock Student Fee assignment
  mockStudentFee = await StudentFee.create({
    student: mockStudent._id,
    feeStructure: mockFeeStructure._id,
    totalAmount: 50000,
    discount: 5000,
    scholarship: 0,
    fine: 0,
    dueDate: mockFeeStructure.dueDate,
    academicYear: '2026-2027',
  });
  await mockStudentFee.save();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Student Fee Manager Integration Tests', () => {
  describe('GET /api/student-fees', () => {
    it('should prevent unauthorized requests from users without tokens', async () => {
      const res = await request(app).get('/api/student-fees');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should allow accountants to search and retrieve assigned fees list', async () => {
      const res = await request(app)
        .get('/api/student-fees')
        .set('Authorization', `Bearer ${accountantToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should restrict listing endpoints for student roles', async () => {
      const res = await request(app)
        .get('/api/student-fees')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('POST /api/student-fees/:id/pay', () => {
    it('should disallow paying more than pending amount', async () => {
      const res = await request(app)
        .post(`/api/student-fees/${mockStudentFee._id}/pay`)
        .set('Authorization', `Bearer ${accountantToken}`)
        .send({
          paidAmount: 60000, // exceeds remaining pending (50k - 5k discount = 45k)
          paymentMethod: 'cash',
        });

      expect(res.statusCode).toBe(400);
    });

    it('should record payment, reduce pending balance, and auto-link receipt', async () => {
      const res = await request(app)
        .post(`/api/student-fees/${mockStudentFee._id}/pay`)
        .set('Authorization', `Bearer ${accountantToken}`)
        .send({
          paidAmount: 10000,
          paymentMethod: 'cash',
          remarks: 'Part payment',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.studentFee.paidAmount).toBe(10000);
      expect(res.body.data.studentFee.pendingAmount).toBe(35000); // 45000 - 10000 = 35000
      expect(res.body.data.studentFee.status).toBe('partial');
      expect(res.body.data.receipt).toBeDefined();
      expect(res.body.data.receipt.receiptNumber).toBeDefined();
    });
  });
});
