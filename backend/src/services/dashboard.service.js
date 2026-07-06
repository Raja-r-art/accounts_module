'use strict';

const StudentFee = require('../models/StudentFee');
const Student = require('../models/Student');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Salary = require('../models/Salary');

class DashboardService {
  async getStats() {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

    const [
      todayCollection,
      monthlyCollection,
      totalStudents,
      feeStats,
      studentStatuses,
      totalExpenses,
      totalIncomes,
      totalSalaries,
      topPending,
      recentTransactions,
    ] = await Promise.all([
      // 1. Today's Collection — match on paymentDate within today
      StudentFee.aggregate([
        { $match: { paymentDate: { $gte: todayStart, $lte: todayEnd }, status: { $in: ['paid', 'partial'] } } },
        { $group: { _id: null, total: { $sum: '$paidAmount' } } },
      ]),
      // 2. Monthly Collection
      StudentFee.aggregate([
        { $match: { paymentDate: { $gte: monthStart }, status: { $in: ['paid', 'partial'] } } },
        { $group: { _id: null, total: { $sum: '$paidAmount' } } },
      ]),
      // 3. Total Students
      Student.countDocuments({ status: 'active' }),
      // 4. Total paid vs pending amounts
      StudentFee.aggregate([
        { $group: { _id: null, totalPaid: { $sum: '$paidAmount' }, totalPending: { $sum: '$pendingAmount' } } },
      ]),
      // 5. Count distinct students with at least one paid fee vs at least one pending
      StudentFee.aggregate([
        {
          $group: {
            _id: '$student',
            hasPaid:   { $max: { $cond: [{ $in: ['$status', ['paid', 'partial']] }, 1, 0] } },
            hasPending: { $max: { $cond: [{ $in: ['$status', ['pending', 'partial', 'overdue']] }, 1, 0] } },
          },
        },
        {
          $group: {
            _id: null,
            paidStudents:    { $sum: '$hasPaid' },
            pendingStudents: { $sum: '$hasPending' },
          },
        },
      ]),
      // 6. Total College Expenses
      Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      // 7. Total Other Incomes
      Income.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      // 8. Total Salaries Paid
      Salary.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$netSalary' } } }]),
      // 9. Top Pending Students
      Student.find({ totalFeesPending: { $gt: 0 } })
        .sort({ totalFeesPending: -1 })
        .limit(5)
        .select('name admissionNumber course semester totalFeesPending email phone')
        .lean(),
      // 10. Recent Transactions
      this.getRecentTransactions(),
    ]);

    const feePaid    = feeStats[0]?.totalPaid    || 0;
    const feePending = feeStats[0]?.totalPending || 0;
    const opExpenses = totalExpenses[0]?.total   || 0;
    const salExpenses = totalSalaries[0]?.total  || 0;
    const totalExp   = opExpenses + salExpenses;
    const otherInc   = totalIncomes[0]?.total    || 0;

    return {
      // Names that match Dashboard.jsx
      totalCollectedToday:  todayCollection[0]?.total  || 0,
      totalCollectedMonth:  monthlyCollection[0]?.total || 0,
      totalPending:         feePending,
      totalStudents,
      paidStudents:         studentStatuses[0]?.paidStudents    || 0,
      pendingStudents:      studentStatuses[0]?.pendingStudents || 0,
      totalIncome:          otherInc,
      totalExpense:         totalExp,
      // Extra fields for reports
      feePaid,
      netProfit:            (feePaid + otherInc) - totalExp,
      topPendingStudents:   topPending,
      recentTransactions,
    };
  }

  async getChartsData() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    // 1. Fee collection monthly trend
    const feeTrend = await StudentFee.aggregate([
      { $match: { paymentDate: { $gte: sixMonthsAgo }, status: { $in: ['paid', 'partial'] } } },
      {
        $group: {
          _id: { year: { $year: '$paymentDate' }, month: { $month: '$paymentDate' } },
          total: { $sum: '$paidAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // 2. Expense monthly trend
    const expTrend = await Expense.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // 3. Fee breakdown by type for pie chart
    const feeByType = await StudentFee.aggregate([
      { $match: { status: { $in: ['paid', 'partial'] } } },
      { $lookup: { from: 'feestructures', localField: 'feeStructure', foreignField: '_id', as: 'fs' } },
      { $unwind: { path: '$fs', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ['$fs.feeType', 'other'] },
          value: { $sum: '$paidAmount' },
        },
      },
    ]);

    // 4. Top outstanding students
    const topOutstanding = await Student.find({ totalFeesPending: { $gt: 0 } })
      .sort({ totalFeesPending: -1 })
      .limit(5)
      .select('name course totalFeesPending semester')
      .lean();

    // Build a merged monthly map (last 6 months)
    const monthlyMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = { month: monthNames[d.getMonth()], collection: 0, expense: 0 };
    }
    feeTrend.forEach((t) => {
      const key = `${t._id.year}-${String(t._id.month).padStart(2, '0')}`;
      if (monthlyMap[key]) monthlyMap[key].collection = t.total;
    });
    expTrend.forEach((t) => {
      const key = `${t._id.year}-${String(t._id.month).padStart(2, '0')}`;
      if (monthlyMap[key]) monthlyMap[key].expense = t.total;
    });

    return {
      monthly: Object.values(monthlyMap),
      byType: feeByType.map((f) => ({
        name: f._id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        value: f.value,
      })),
      outstanding: topOutstanding.map((s) => ({
        name: s.name,
        course: s.course,
        amount: s.totalFeesPending,
        sem: s.semester,
      })),
    };
  }

  async getRecentTransactions() {
    // Collect fee payments, other incomes, and expenses from database
    const [feePayments, otherIncomes, expenses] = await Promise.all([
      StudentFee.find({ status: { $in: ['paid', 'partial'] } })
        .sort({ paymentDate: -1 })
        .limit(5)
        .populate('student', 'name')
        .lean(),
      Income.find()
        .sort({ date: -1 })
        .limit(5)
        .lean(),
      Expense.find()
        .sort({ date: -1 })
        .limit(5)
        .lean(),
    ]);

    const txs = [];

    feePayments.forEach((p) => {
      txs.push({
        type: 'income',
        source: 'Fee Collection',
        description: `Fee payment received from student: ${p.student?.name || 'Unknown'}`,
        amount: p.paidAmount,
        date: p.paymentDate,
        reference: p.receiptNumber || p.transactionId,
      });
    });

    otherIncomes.forEach((i) => {
      txs.push({
        type: 'income',
        source: i.source.replace('_', ' ').toUpperCase(),
        description: i.description || 'Other Income source',
        amount: i.amount,
        date: i.date,
        reference: i.reference,
      });
    });

    expenses.forEach((e) => {
      txs.push({
        type: 'expense',
        source: e.category.toUpperCase(),
        description: e.description || `Expense for ${e.category}`,
        amount: e.amount,
        date: e.date,
        reference: e.invoiceNumber,
      });
    });

    // Sort all merged transactions by date descending and take top 5
    txs.sort((a, b) => new Date(b.date) - new Date(a.date));
    return txs.slice(0, 5);
  }
}

module.exports = new DashboardService();
