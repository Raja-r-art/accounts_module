import { useState, useEffect, useCallback } from 'react';
import Topbar from '../components/Topbar';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Users } from 'lucide-react';

const ROLES = ['super_admin','principal','accountant','student','parent'];
const INIT  = { name:'', email:'', mobile:'', password:'', role:'accountant', status:'active' };

const UsersPage = () => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [selected,setSelected]= useState(null);
  const [form,    setForm]    = useState(INIT);
  const [saving,  setSaving]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get('/users'); setUsers(r.data.data?.users || r.data.data || []); }
    catch { setUsers([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(INIT); setSelected(null); setModal('form'); };
  const openEdit   = (u) => { setSelected(u); setForm({ ...INIT, ...u, password:'' }); setModal('form'); };
  const closeModal = () => { setModal(null); setSelected(null); };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form };
      if (selected && !payload.password) delete payload.password;
      if (selected) await api.put(`/users/${selected._id}`, payload);
      else await api.post('/users', payload);
      toast.success(selected ? 'User updated!' : 'User created!');
      closeModal(); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await api.delete(`/users/${id}`); toast.success('User deleted.'); load(); }
    catch { toast.error('Delete failed.'); }
  };

  const ROLE_COLORS = { super_admin:'badge-danger', principal:'badge-navy', accountant:'badge-info', student:'badge-teal', parent:'badge-warning' };

  return (
    <div className="fade-in">
      <Topbar title="Users" subtitle="Manage all system users and their roles" />
      <div className="page-body">
        <div className="filters-bar">
          <div style={{ marginLeft:'auto' }}>
            <button className="btn btn-primary" onClick={openCreate}><Plus size={16} />Add User</button>
          </div>
        </div>
        <div className="card">
          <div className="table-wrapper" style={{ border:'none', borderRadius:0 }}>
            <table className="table">
              <thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ textAlign:'center', padding:40 }}><div className="spinner dark" style={{ margin:'0 auto' }} /></td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty-state"><Users size={48} /><h3>No users found</h3></div></td></tr>
                ) : users.map((u) => (
                  <tr key={u._id}>
                    <td><strong>{u.name}</strong></td>
                    <td style={{ color:'var(--text-muted)' }}>{u.email}</td>
                    <td>{u.mobile}</td>
                    <td><span className={`badge ${ROLE_COLORS[u.role]||'badge-navy'}`}>{u.role?.replace('_',' ')}</span></td>
                    <td><span className={`badge badge-${u.status==='active'?'success':'warning'}`}>{u.status}</span></td>
                    <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(u)}><Pencil size={14} /></button>
                        <button className="btn btn-ghost btn-sm btn-icon" style={{ color:'var(--danger)' }} onClick={() => handleDelete(u._id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal === 'form' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{selected ? 'Edit User' : 'Create User'}</span>
              <button className="btn btn-ghost btn-icon" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Full Name *</label><input name="name" className="form-control" value={form.name} onChange={handleChange} required /></div>
                  <div className="form-group"><label className="form-label">Email *</label><input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Mobile</label><input name="mobile" className="form-control" value={form.mobile} onChange={handleChange} /></div>
                  <div className="form-group"><label className="form-label">Role *</label>
                    <select name="role" className="form-control" value={form.role} onChange={handleChange}>
                      {ROLES.map(r => <option key={r} value={r}>{r.replace('_',' ')}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">{selected ? 'New Password (leave blank to keep)' : 'Password *'}</label><input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} required={!selected} minLength={8} /></div>
                  <div className="form-group"><label className="form-label">Status</label>
                    <select name="status" className="form-control" value={form.status} onChange={handleChange}>
                      <option value="active">Active</option><option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <><span className="spinner" />Saving…</> : (selected ? 'Update User' : 'Create User')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
