import { useState, useEffect, useCallback } from 'react';
import Topbar from '../components/Topbar';
import api from '../utils/api';
import { Bell, CheckCheck } from 'lucide-react';

const Notifications = () => {
  const [list, setList]     = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get('/notifications'); setList(r.data.data || []); }
    catch { setList([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const TYPE_ICON = { fee_reminder:'🔔', payment_received:'✅', scholarship:'🎓', salary:'💼', system:'⚙️' };

  return (
    <div className="fade-in">
      <Topbar title="Notifications" subtitle="System alerts and payment notifications" />
      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <span className="card-title">All Notifications</span>
            <button className="btn btn-ghost btn-sm" onClick={load}><CheckCheck size={14} />Refresh</button>
          </div>
          <div>
            {loading ? (
              <div style={{ textAlign:'center', padding:40 }}><div className="spinner dark" style={{ margin:'0 auto' }} /></div>
            ) : list.length === 0 ? (
              <div className="empty-state"><Bell size={48} /><h3>No notifications yet</h3><p>Reminders and alerts will appear here.</p></div>
            ) : list.map((n) => (
              <div key={n._id} style={{ display:'flex', gap:14, padding:'16px 20px', borderBottom:'1px solid var(--border)', background: n.isRead ? 'var(--surface)' : '#EEF2FF', transition:'background .2s' }}>
                <div style={{ fontSize:'1.4rem', lineHeight:1 }}>{TYPE_ICON[n.type] || '📌'}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, color:'var(--navy)', fontSize:'.9rem', marginBottom:4 }}>{n.title}</div>
                  <div style={{ fontSize:'.8rem', color:'var(--text-secondary)', lineHeight:1.5 }}>{n.message}</div>
                  <div style={{ fontSize:'.7rem', color:'var(--text-muted)', marginTop:6 }}>{new Date(n.createdAt).toLocaleString('en-IN')}</div>
                </div>
                {!n.isRead && <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--navy)', marginTop:6, flexShrink:0 }} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
