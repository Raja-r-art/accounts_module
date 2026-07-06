import { useState, useEffect, useCallback } from 'react';
import Topbar from '../components/Topbar';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, DollarSign } from 'lucide-react';

const FEE_TYPES = ['tuition_fee','lab_fee','hostel_fee','transport_fee','exam_fee','library_fee','sports_fee','misc_fee'];
const INIT = { course:'', semester:'1', feeType:'tuition_fee', amount:'', dueDate:'', academicYear:'2026-2027', description:'' };

const FeeStructures = () => {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [selected,setSelected]= useState(null);
  const [form,    setForm]    = useState(INIT);
  const [saving,  setSaving]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get('/fee-structures'); setList(r.data.data || []); }
    catch { setList([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(INIT); setModal('create'); };
  const openEdit   = (r) => { setSelected(r); setForm({ ...INIT, ...r, dueDate: r.dueDate?.slice(0,10) }); setModal('edit'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (modal === 'create') { await api.post('/fee-structures', form); toast.success('Fee structure created!'); }
      else { await api.put(`/fee-structures/${selected._id}`, form); toast.success('Updated successfully!'); }
      closeModal(); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fee structure?')) return;
    try { await api.delete(`/fee-structures/${id}`); toast.success('Deleted.'); load(); }
    catch { toast.error('Delete failed.'); }
  };

  return (
    <div className="fade-in">
      <Topbar title="Fee Structures" subtitle="Define course and semester-wise fee components" />
      <div className="page-body">
        <div className="filters-bar">
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn btn-primary" onClick={openCreate}><Plus size={16} />New Fee Structure</button>
          </div>
        </div>

        <div className="card">
          <div className="table-wrapper" style={{ border:'none', borderRadius:0 }}>
            <table className="table">
              <thead>
                <tr><th>Course</th><th>Semester</th><th>Fee Type</th><th>Amount</th><th>Due Date</th><th>Acad. Year</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign:'center', padding:40 }}><div className="spinner dark" style={{ margin:'0 auto' }} /></td></tr>
                ) : list.length === 0 ? (
                  <tr><td colSpan={8}><div className="empty-state"><DollarSign size={48} /><h3>No fee structures defined</h3></div></td></tr>
                ) : list.map((r) => (
                  <tr key={r._id}>
                    <td><strong>{r.course}</strong></td>
                    <td>Sem {r.semester}</td>
                    <td><span className="badge badge-info">{r.feeType?.replace(/_/g,' ')}</span></td>
                    <td style={{ fontWeight:700, color:'var(--navy)' }}>₹{Number(r.amount).toLocaleString('en-IN')}</td>
                    <td>{r.dueDate ? new Date(r.dueDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td>{r.academicYear}</td>
                    <td><span className={`badge badge-${r.isActive ? 'success' : 'warning'}`}>{r.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(r)}><Pencil size={14} /></button>
                        <button className="btn btn-ghost btn-sm btn-icon" style={{ color:'var(--danger)' }} onClick={() => handleDelete(r._id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {(modal === 'create' || modal === 'edit') && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{modal === 'create' ? 'New Fee Structure' : 'Edit Fee Structure'}</span>
              <button className="btn btn-ghost btn-icon" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Course *</label><input name="course" className="form-control" value={form.course} onChange={handleChange} placeholder="B.Tech CS" required /></div>
                  <div className="form-group"><label className="form-label">Semester *</label>
                    <select name="semester" className="form-control" value={form.semester} onChange={handleChange}>
                      {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Fee Type *</label>
                    <select name="feeType" className="form-control" value={form.feeType} onChange={handleChange}>
                      {FEE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Amount (₹) *</label><input type="number" name="amount" className="form-control" value={form.amount} onChange={handleChange} min={0} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Due Date</label><input type="date" name="dueDate" className="form-control" value={form.dueDate} onChange={handleChange} /></div>
                  <div className="form-group"><label className="form-label">Academic Year</label><input name="academicYear" className="form-control" value={form.academicYear} onChange={handleChange} placeholder="2026-2027" /></div>
                </div>
                <div className="form-group"><label className="form-label">Description</label><textarea name="description" className="form-control" rows={2} value={form.description} onChange={handleChange} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <><span className="spinner" /> Saving…</> : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeStructures;
