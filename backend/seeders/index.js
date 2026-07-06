'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Student = require('../src/models/Student');
const FeeStructure = require('../src/models/FeeStructure');
const StudentFee = require('../src/models/StudentFee');
const Expense = require('../src/models/Expense');
const Income = require('../src/models/Income');
const Salary = require('../src/models/Salary');
const Scholarship = require('../src/models/Scholarship');
const AuditLog = require('../src/models/AuditLog');
const Notification = require('../src/models/Notification');
const RefreshToken = require('../src/models/RefreshToken');
const Receipt = require('../src/models/Receipt');

const seedData = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/college_erp';

  console.log('Connecting to MongoDB for seeding...');
  await mongoose.connect(mongoUri);
  console.log('Connected to database.');

  console.log('Cleaning old seed data...');
  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    FeeStructure.deleteMany({}),
    StudentFee.deleteMany({}),
    Expense.deleteMany({}),
    Income.deleteMany({}),
    Salary.deleteMany({}),
    Scholarship.deleteMany({}),
    AuditLog.deleteMany({}),
    Notification.deleteMany({}),
    RefreshToken.deleteMany({}),
    Receipt.deleteMany({}),
  ]);
  console.log('Database cleaned.');

  console.log('Seeding Users (Super Admin, Principal, Accountant)...');
  
  const superAdmin = await User.create({
    name: 'ERP Super Admin',
    email: 'admin@college.edu',
    mobile: '9876543210',
    password: 'AdminPassword123!',
    role: 'super_admin',
    status: 'active',
    isEmailVerified: true,
  });

  const principal = await User.create({
    name: 'Dr. John Doe (Principal)',
    email: 'principal@college.edu',
    mobile: '9876543211',
    password: 'PrincipalPassword123!',
    role: 'principal',
    status: 'active',
    isEmailVerified: true,
  });

  const accountant = await User.create({
    name: 'Mr. Jane Smith (Accountant)',
    email: 'accountant@college.edu',
    mobile: '9876543212',
    password: 'AccountantPassword123!',
    role: 'accountant',
    status: 'active',
    isEmailVerified: true,
  });

  console.log('Users seeded successfully.');

  console.log('Seeding Fee Structures...');
  
  const currentYear = '2026-2027';

  const feeStructures = await FeeStructure.insertMany([
    {
      course: 'B.Tech CS',
      semester: 1,
      feeType: 'tuition_fee',
      amount: 60000,
      dueDate: new Date('2026-10-15'),
      academicYear: currentYear,
      description: 'First semester tuition fee for CS',
      isActive: true,
      createdBy: accountant._id,
    },
    {
      course: 'B.Tech CS',
      semester: 1,
      feeType: 'lab_fee',
      amount: 15000,
      dueDate: new Date('2026-10-15'),
      academicYear: currentYear,
      description: 'Computer science lab equipment fee',
      isActive: true,
      createdBy: accountant._id,
    },
    {
      course: 'B.Tech EC',
      semester: 1,
      feeType: 'tuition_fee',
      amount: 55000,
      dueDate: new Date('2026-10-15'),
      academicYear: currentYear,
      description: 'First semester tuition fee for Electronics',
      isActive: true,
      createdBy: accountant._id,
    },
    {
      course: 'B.Tech CS',
      semester: 2,
      feeType: 'tuition_fee',
      amount: 60000,
      dueDate: new Date('2027-03-15'),
      academicYear: currentYear,
      description: 'Second semester tuition fee for CS',
      isActive: true,
      createdBy: accountant._id,
    },
  ]);

  console.log('Fee structures seeded successfully.');

  console.log('Seeding Students & Creating student user logins...');

  // Create Student 1
  const student1User = await User.create({
    name: 'Alice Johnson',
    email: 'alice@student.edu',
    mobile: '9876543213',
    password: 'StudentPassword123!',
    role: 'student',
    status: 'active',
    isEmailVerified: true,
  });

  const student1 = await Student.create({
    admissionNumber: 'CS26001',
    name: 'Alice Johnson',
    department: 'Computer Science',
    course: 'B.Tech CS',
    semester: 1,
    section: 'A',
    academicYear: currentYear,
    gender: 'female',
    dob: new Date('2005-04-12'),
    email: 'alice@student.edu',
    phone: '9876543213',
    address: { street: '45 Green Avenue', city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
    parentName: 'Robert Johnson',
    parentPhone: '9876543220',
    parentEmail: 'robert@parent.com',
    status: 'active',
    user: student1User._id,
  });

  // Create Student 2
  const student2User = await User.create({
    name: 'Bob Miller',
    email: 'bob@student.edu',
    mobile: '9876543214',
    password: 'StudentPassword123!',
    role: 'student',
    status: 'active',
    isEmailVerified: true,
  });

  const student2 = await Student.create({
    admissionNumber: 'EC26002',
    name: 'Bob Miller',
    department: 'Electronics',
    course: 'B.Tech EC',
    semester: 1,
    section: 'B',
    academicYear: currentYear,
    gender: 'male',
    dob: new Date('2004-08-22'),
    email: 'bob@student.edu',
    phone: '9876543214',
    address: { street: '12 Blue Lane', city: 'Bangalore', state: 'Karnataka', pincode: '560002' },
    parentName: 'Sarah Miller',
    parentPhone: '9876543221',
    parentEmail: 'sarah@parent.com',
    status: 'active',
    user: student2User._id,
  });

  console.log('Students seeded successfully.');

  console.log('Assigning fees to students...');

  // Assign Tuition Fee to Student 1
  const sf1 = await StudentFee.create({
    student: student1._id,
    feeStructure: feeStructures[0]._id,
    totalAmount: feeStructures[0].amount,
    discount: 5000,
    scholarship: 0,
    fine: 0,
    dueDate: feeStructures[0].dueDate,
    academicYear: currentYear,
  });

  // Assign Lab Fee to Student 1
  const sf2 = await StudentFee.create({
    student: student1._id,
    feeStructure: feeStructures[1]._id,
    totalAmount: feeStructures[1].amount,
    discount: 0,
    scholarship: 0,
    fine: 0,
    dueDate: feeStructures[1].dueDate,
    academicYear: currentYear,
  });

  // Assign Tuition Fee to Student 2
  const sf3 = await StudentFee.create({
    student: student2._id,
    feeStructure: feeStructures[2]._id,
    totalAmount: feeStructures[2].amount,
    discount: 0,
    scholarship: 0,
    fine: 0,
    dueDate: feeStructures[2].dueDate,
    academicYear: currentYear,
  });

  // Save to trigger pre-save pendingAmount recalculation
  await sf1.save();
  await sf2.save();
  await sf3.save();

  // Update student totals
  await Student.findByIdAndUpdate(student1._id, {
    totalFeesPending: sf1.pendingAmount + sf2.pendingAmount,
  });

  await Student.findByIdAndUpdate(student2._id, {
    totalFeesPending: sf3.pendingAmount,
  });

  console.log('Student fee structures assigned.');

  console.log('Seeding other financial accounts (Incomes, Expenses, Salaries)...');

  // Incomes
  await Income.insertMany([
    {
      source: 'donation',
      amount: 150000,
      date: new Date('2026-06-10'),
      description: 'Alumni donation for lab upgrades',
      receivedBy: accountant._id,
      academicYear: currentYear,
    },
    {
      source: 'government_fund',
      amount: 300000,
      date: new Date('2026-06-25'),
      description: 'Research grant for technical studies',
      receivedBy: accountant._id,
      academicYear: currentYear,
    },
  ]);

  // Expenses
  await Expense.insertMany([
    {
      category: 'electricity',
      vendor: 'State Power Board',
      invoiceNumber: 'INV998822',
      amount: 35000,
      date: new Date('2026-07-02'),
      description: 'Monthly electricity bill for campus block A',
      paidBy: accountant._id,
      approvedBy: principal._id,
      academicYear: currentYear,
    },
    {
      category: 'internet',
      vendor: 'Broadband Corp',
      invoiceNumber: 'INV998823',
      amount: 12000,
      date: new Date('2026-07-05'),
      description: 'Fiber internet connection for central library',
      paidBy: accountant._id,
      approvedBy: principal._id,
      academicYear: currentYear,
    },
  ]);

  // Salary
  await Salary.create({
    employee: accountant._id,
    employeeName: accountant.name,
    department: 'Accounts',
    designation: 'Lead Accountant',
    basicSalary: 45000,
    allowances: { hra: 8000, da: 4000, ta: 2000, medical: 1500, other: 0 },
    deductions: { pf: 5400, esi: 1200, tax: 2000, other: 0 },
    paymentDate: new Date('2026-06-30'),
    month: 6,
    year: 2026,
    status: 'paid',
    remarks: 'Salary paid via online bank transfer',
    processedBy: principal._id,
  });

  console.log('Financial records seeded.');

  console.log('Database Seeding Completed successfully!');
  await mongoose.disconnect();
};

if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error seeding database:', err);
      process.exit(1);
    });
}
