import { Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Topbar = ({ title, subtitle }) => {
  const { user } = useAuth();
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div>
          <div className="topbar-title">{title}</div>
          {subtitle && <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{subtitle}</div>}
        </div>
      </div>
      <div className="topbar-right">
        <button className="btn btn-ghost btn-icon" title="Notifications">
          <Bell size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', borderRadius: 'var(--radius)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem', fontWeight: 700, color: '#fff' }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--navy)' }}>{user?.name}</div>
            <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
