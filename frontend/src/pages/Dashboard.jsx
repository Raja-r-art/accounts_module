import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import api from '../utils/api';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  DollarSign, TrendingUp, TrendingDown, Users, GraduationCap,
  AlertCircle, CheckCircle, Clock, BarChart2,
} from 'lucide-react';

const fmt = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN');

const StatCard = ({ label, value, icon: Icon, color, change }) => (
  <div className={`stat-card ${color}`}>
    <div className={`stat-icon ${color}`}><Icon size={22} /></div>
    <div className="stat-info">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {change && <div className={`stat-change ${change >= 0 ? 'up' : 'down'}`}>
        {change >= 0 ? '▲' : '▼'} {Math.abs(change)}% vs last month
      </div>}
    </div>
  </div>
);

const COLORS = ['#1A2E4A', '#C9981B', '#0D9488', '#E53E3E', '#3182CE', '#38A169'];

const Dashboard = () => {
  const [stats,  setStats]  = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/dashboard/stats'), api.get('/dashboard/charts')])
      .then(([s, c]) => { setStats(s.data.data); setCharts(c.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fallback demo data when backend isn't connected yet
  const demoStats = {
    totalCollectedToday: 125000, totalCollectedMonth: 1850000,
    totalPending: 920000, totalStudents: 248, paidStudents: 192,
    pendingStudents: 56, totalIncome: 450000, totalExpense: 320000,
  };
  const demoMonthly = [
    { month: 'Feb', collection: 1200000, expense: 280000 },
    { month: 'Mar', collection: 1500000, expense: 310000 },
    { month: 'Apr', collection: 980000,  expense: 290000 },
    { month: 'May', collection: 1750000, expense: 340000 },
    { month: 'Jun', collection: 1600000, expense: 315000 },
    { month: 'Jul', collection: 1850000, expense: 320000 },
  ];
  const demoPie = [
    { name: 'Tuition Fee', value: 1200000 },
    { name: 'Lab Fee',     value: 350000  },
    { name: 'Hostel Fee',  value: 280000  },
    { name: 'Transport',   value: 120000  },
    { name: 'Exam Fee',    value: 95000   },
  ];
  const demoOutstanding = [
    { name: 'Alice Johnson',  amount: 45000, course: 'B.Tech CS', sem: 1 },
    { name: 'Bob Miller',     amount: 55000, course: 'B.Tech EC', sem: 1 },
    { name: 'Carol Davis',    amount: 30000, course: 'B.Tech ME', sem: 3 },
    { name: 'David Wilson',   amount: 60000, course: 'B.Tech CS', sem: 2 },
    { name: 'Eva Martinez',   amount: 40000, course: 'B.Tech EE', sem: 4 },
  ];

  const s = stats || demoStats;
  const monthly = charts?.monthly || demoMonthly;
  const pieData  = charts?.byType  || demoPie;
  const outstanding = charts?.outstanding || demoOutstanding;

  return (
    <div className="fade-in">
      <Topbar title="Dashboard" subtitle="Sri Eshwar College of Engineering — Accountant Module" />
      <div className="page-body">

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard label="Today's Collection" value={fmt(s.totalCollectedToday)} icon={DollarSign}     color="navy"    change={12} />
          <StatCard label="Monthly Revenue"    value={fmt(s.totalCollectedMonth)} icon={TrendingUp}     color="success" change={8}  />
          <StatCard label="Total Pending"      value={fmt(s.totalPending)}        icon={AlertCircle}    color="danger"  change={-5} />
          <StatCard label="Total Students"     value={s.totalStudents}            icon={GraduationCap}  color="info"               />
          <StatCard label="Paid Students"      value={s.paidStudents}             icon={CheckCircle}    color="teal"               />
          <StatCard label="Pending Students"   value={s.pendingStudents}          icon={Clock}          color="gold"               />
        </div>

        {/* Charts Row */}
        <div className="grid-2" style={{ marginBottom: 24 }}>
          {/* Monthly Collection vs Expense */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Monthly Collection vs Expense</span>
              <span className="badge badge-navy">2026-27</span>
            </div>
            <div className="card-body" style={{ paddingTop: 8 }}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthly} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1A2E4A" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1A2E4A" stopOpacity={0}    />
                    </linearGradient>
                    <linearGradient id="eGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#E53E3E" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#E53E3E" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Area type="monotone" dataKey="collection" name="Collection" stroke="#1A2E4A" fill="url(#cGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expense"    name="Expense"    stroke="#E53E3E" fill="url(#eGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fee Category Pie */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Fee Collection by Category</span>
            </div>
            <div className="card-body" style={{ paddingTop: 8 }}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    dataKey="value" nameKey="name" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid-2">
          {/* Outstanding Students */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Top Outstanding Balances</span>
              <span className="badge badge-danger">Unpaid</span>
            </div>
            <div className="table-wrapper" style={{ borderRadius: 0, border: 'none' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th className="text-right">Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {outstanding.map((s, i) => (
                    <tr key={i}>
                      <td><strong>{s.name}</strong></td>
                      <td><span className="badge badge-navy">{s.course}</span></td>
                      <td className="text-right" style={{ color: 'var(--danger)', fontWeight: 600 }}>{fmt(s.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Summary */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Financial Summary</span>
              <span className="badge badge-gold">This Month</span>
            </div>
            <div className="card-body">
              {[
                { label: 'Total Income (Other)',  value: fmt(s.totalIncome),   color: 'var(--success)' },
                { label: 'Total Expenditure',     value: fmt(s.totalExpense),   color: 'var(--danger)'  },
                { label: 'Net Collections',       value: fmt(s.totalCollectedMonth), color: 'var(--navy)' },
                { label: 'Net Profit/Loss',       value: fmt((s.totalCollectedMonth + (s.totalIncome||0)) - (s.totalExpense||0)), color: 'var(--teal)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '.875rem', color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1rem', color }}>{value}</span>
                </div>
              ))}
              <div style={{ marginTop: 20, padding: 14, background: 'var(--surface-2)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.05em' }}>Academic Year</div>
                <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--navy)' }}>2026 – 2027</div>
                <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Sri Eshwar College of Engineering</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
