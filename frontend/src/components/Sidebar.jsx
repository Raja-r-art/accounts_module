import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, GraduationCap, DollarSign, Receipt,
  TrendingUp, TrendingDown, Award, Briefcase, BarChart2,
  Bell, FileText, LogOut, ChevronRight,
} from 'lucide-react';

const NAV = [
  {
    section: 'Overview',
    links: [
      { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard',       roles: ['super_admin','principal','accountant','student','parent'] },
    ],
  },
  {
    section: 'Accounts',
    links: [
      { to: '/students',       icon: GraduationCap,  label: 'Students',         roles: ['super_admin','principal','accountant'] },
      { to: '/fee-structures', icon: DollarSign,      label: 'Fee Structures',   roles: ['super_admin','principal','accountant'] },
      { to: '/student-fees',   icon: Receipt,         label: 'Fee Collection',   roles: ['super_admin','principal','accountant'] },
      { to: '/receipts',       icon: FileText,        label: 'Receipts',         roles: ['super_admin','principal','accountant','student','parent'] },
    ],
  },
  {
    section: 'Finance',
    links: [
      { to: '/incomes',        icon: TrendingUp,      label: 'Incomes',          roles: ['super_admin','principal','accountant'] },
      { to: '/expenses',       icon: TrendingDown,    label: 'Expenses',         roles: ['super_admin','principal','accountant'] },
      { to: '/scholarships',   icon: Award,           label: 'Scholarships',     roles: ['super_admin','principal','accountant'] },
      { to: '/salaries',       icon: Briefcase,       label: 'Payroll',          roles: ['super_admin','principal','accountant'] },
    ],
  },
  {
    section: 'Management',
    links: [
      { to: '/reports',        icon: BarChart2,       label: 'Reports',          roles: ['super_admin','principal','accountant'] },
      { to: '/users',          icon: Users,           label: 'Users',            roles: ['super_admin','principal'] },
      { to: '/notifications',  icon: Bell,            label: 'Notifications',    roles: ['super_admin','principal','accountant','student','parent'] },
      { to: '/audit-logs',     icon: FileText,        label: 'Audit Logs',       roles: ['super_admin'] },
    ],
  },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">SE</div>
        <div className="sidebar-logo-text">
          <div className="sidebar-logo-name">Sri Eshwar College</div>
          <div className="sidebar-logo-sub">ERP · Accountant Module</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV.map((section) => {
          const visible = section.links.filter((l) => l.roles.includes(user?.role));
          if (!visible.length) return null;
          return (
            <div key={section.section} className="sidebar-section">
              <div className="sidebar-section-label">{section.section}</div>
              {visible.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-link" style={{ marginBottom: 8, cursor: 'default', opacity: .7 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(201,152,27,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem', fontWeight: 700, color: '#F0BA2D', flexShrink: 0 }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div style={{ lineHeight: 1.3, minWidth: 0 }}>
            <div style={{ fontSize: '.78rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.4)', textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ')}</div>
          </div>
        </div>
        <button className="sidebar-link w-100" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#FC8181' }} onClick={handleLogout}>
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
