import { useState, useEffect, useCallback } from 'react';
import Topbar from '../components/Topbar';
import api from '../utils/api';
import { Search, FileText } from 'lucide-react';

const ACTION_BADGE = {
  CREATE:'badge-success', UPDATE:'badge-info', DELETE:'badge-danger',
  LOGIN:'badge-navy', LOGOUT:'badge-navy', PAYMENT:'badge-teal',
};

const AuditLogs = () => {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [search,  setSearch]  = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/audit-logs', { params:{ page, limit:20, search } });
      setLogs(r.data.data?.logs || r.data.data || []);
      setTotal(r.data.data?.total || 0);
    } catch { setLogs([]); } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total/20)||1;

  return (
    <div className="fade-in">
      <Topbar title="Audit Logs" subtitle="System action trail for compliance and security" />
      <div className="page-body">
        <div className="filters-bar">
          <div className="search-input-wrap">
            <Search size={15} />
            <input className="search-input" placeholder="Search by user, action, resource…"
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>
        <div className="card">
          <div className="table-wrapper" style={{ border:'none', borderRadius:0 }}>
            <table className="table">
              <thead><tr><th>User</th><th>Action</th><th>Resource</th><th>IP Address</th><th>Timestamp</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ textAlign:'center', padding:40 }}><div className="spinner dark" style={{ margin:'0 auto' }} /></td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={5}><div className="empty-state"><FileText size={48} /><h3>No audit logs found</h3></div></td></tr>
                ) : logs.map((l) => (
                  <tr key={l._id}>
                    <td><strong>{l.user?.name || 'System'}</strong><div style={{ fontSize:'.72rem', color:'var(--text-muted)' }}>{l.user?.email}</div></td>
                    <td><span className={`badge ${ACTION_BADGE[l.action] || 'badge-navy'}`}>{l.action}</span></td>
                    <td style={{ color:'var(--text-secondary)' }}>{l.resource} {l.resourceId ? <span style={{ fontSize:'.7rem', color:'var(--text-muted)' }}>#{l.resourceId?.slice(-6)}</span> : null}</td>
                    <td style={{ fontFamily:'monospace', fontSize:'.8rem', color:'var(--text-muted)' }}>{l.ipAddress || '—'}</td>
                    <td style={{ fontSize:'.8rem' }}>{new Date(l.createdAt).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <span>Showing {logs.length} of {total||logs.length} logs</span>
            <div className="pagination-btns">
              {Array.from({ length: totalPages }, (_,i)=>i+1).map(p => (
                <button key={p} className={`pagination-btn ${p===page?'active':''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
