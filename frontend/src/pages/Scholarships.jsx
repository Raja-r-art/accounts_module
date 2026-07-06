import { useState, useEffect, useCallback } from 'react';
import Topbar from '../components/Topbar';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, CheckCircle, XCircle, X, Award } from 'lucide-react';

const fmt = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN');

const Scholarships = () => {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [students,setStudents]= useState([]);
  const [form,    setForm]    = useState({ student:'', scholarshipName:'', amount:'', remarks:'' });
  const [saving,  setSaving]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/scholarships');
      setList(r.data.data || []);
    } catch { setList([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    api.get('/students?limit=200').then(r => setStudents(r.data.data?.students || r.data.data || [])).catch(() => {});
  }, [load]);

  const handleApply = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/scholarships', form);
      toast.success('Scholarship application submitted!');
      setModal(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setSaving(false); }
  };

  const handleApprove = async (id, status) => {
    try {
      await api.post(`/scholarships/${id}/approve`, { status, reason: status === 'approved' ? 'Approved by principal' : 'Rejected' });
      toast.success(`Scholarship ${status}!`); load();
    } catch { toast.error('Action failed.'); }
  };

  const STATUS_BADGE = { pending:'badge-warning', approved:'badge-success', rejected:'badge-danger', disbursed:'badge-navy' };

  return (
    <div className="fade-in">
      <Topbar title="Scholarships" subtitle="Manage scholarship applications and approvals" />
      <div className="page-body">
        <div className="filters-bar">
          <div style={{ marginLeft:'auto' }}>
            <button className="btn btn-primary" onClick={() => { setForm({ student:'', scholarshipName:'', amount:'', remarks:'' }); setModal('apply'); }}>
              <Plus size={16} />Apply Scholarship
            </button>
          </div>
        </div>

        <div className="card">
          <div className="table-wrapper" style={{ border:'none', borderRadius:0 }}>
            <table className="table">
              <thead>
                <tr><th>Student</th><th>Scholarship</th><th>Amount</th><th>Status</th><th>Applied On</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign:'center', padding:40 }}><div className="spinner dark" style={{ margin:'0 auto' }} /></td></tr>
                ) : list.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state"><Award size={48} /><h3>No scholarships found</h3></div></td></tr>
                ) : list.map((s) => (
                  <tr key={s._id}>
                    <td><strong>{s.student?.name || '—'}</strong><div style={{ fontSize:'.72rem', color:'var(--text-muted)' }}>{s.student?.admissionNumber}</div></td>
                    <td>{s.scholarshipName}</td>
                    <td style={{ fontWeight:600, color:'var(--teal)' }}>{fmt(s.amount)}</td>
                    <td><span className={`badge ${STATUS_BADGE[s.status] || 'badge-navy'}`}>{s.status}</span></td>
                    <td>{new Date(s.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      {s.status === 'pending' && (
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn btn-teal btn-sm" onClick={() => handleApprove(s._id, 'approved')} style={{ gap:4 }}><CheckCircle size={13} />Approve</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleApprove(s._id, 'rejected')} style={{ gap:4 }}><XCircle size={13} />Reject</button>
                        </div>
                      )}
                      {s.status !== 'pending' && <span style={{ fontSize:'.78rem', color:'var(--text-muted)' }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal === 'apply' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Apply for Scholarship</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleApply}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Select Student *</label>
                  <select className="form-control" value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} required>
                    <option value="">— Choose Student —</option>
                    {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.admissionNumber})</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Scholarship Name *</label>
                  <input className="form-control" value={form.scholarshipName} onChange={(e) => setForm({ ...form, scholarshipName: e.target.value })} placeholder="Merit Scholarship / Need-based" required />
                </div>
                <div className="form-group"><label className="form-label">Amount (₹) *</label>
                  <input type="number" className="form-control" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} min={0} required />
                </div>
                <div className="form-group"><label className="form-label">Remarks</label>
                  <textarea className="form-control" rows={3} value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} placeholder="Reason for scholarship application…" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <><span className="spinner" />Submitting…</> : 'Submit Application'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scholarships;
