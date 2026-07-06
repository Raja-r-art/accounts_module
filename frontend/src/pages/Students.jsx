import { useState, useEffect, useCallback } from 'react';
import Topbar from '../components/Topbar';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Search, Eye, Pencil, Trash2, X, Upload, User } from 'lucide-react';

const INIT = {
  admissionNumber:'', name:'', department:'', course:'', semester:'1',
  section:'', academicYear:'2026-2027', gender:'male', dob:'',
  email:'', phone:'', parentName:'', parentPhone:'', parentEmail:'',
  'address.street':'', 'address.city':'', 'address.state':'', 'address.pincode':'',
};

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search,  setSearch]    = useState('');
  const [page,    setPage]      = useState(1);
  const [total,   setTotal]     = useState(0);
  const [modal,   setModal]     = useState(null); // null | 'create' | 'edit' | 'view'
  const [selected,setSelected]  = useState(null);
  const [form,    setForm]      = useState(INIT);
  const [saving,  setSaving]    = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/students', { params: { page, limit: 10, search } });
      setStudents(res.data.data?.students || res.data.data || []);
      setTotal(res.data.data?.total || 0);
    } catch { setStudents([]); } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(INIT); setModal('create'); };
  const openEdit   = (s) => { setSelected(s); setForm({ ...INIT, ...s }); setModal('edit'); };
  const openView   = (s) => { setSelected(s); setModal('view'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        address: { street: form['address.street'], city: form['address.city'], state: form['address.state'], pincode: form['address.pincode'] },
      };
      if (modal === 'create') {
        await api.post('/students', payload);
        toast.success('Student created successfully!');
      } else {
        await api.put(`/students/${selected._id}`, payload);
        toast.success('Student updated successfully!');
      }
      closeModal(); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student? This action cannot be undone.')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted.'); load();
    } catch { toast.error('Failed to delete student.'); }
  };

  const totalPages = Math.ceil(total / 10) || 1;

  return (
    <div className="fade-in">
      <Topbar title="Students" subtitle="Manage all enrolled students" />
      <div className="page-body">

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-input-wrap">
            <Search size={15} />
            <input className="search-input" placeholder="Search by name, email, ID…"
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn btn-primary" onClick={openCreate}><Plus size={16} />Add Student</button>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Admission No.</th><th>Name</th><th>Course</th><th>Semester</th>
                  <th>Email</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}><div className="spinner dark" style={{ margin: '0 auto' }} /></td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan={7}>
                    <div className="empty-state"><User size={48} /><h3>No students found</h3><p>Add your first student to get started.</p></div>
                  </td></tr>
                ) : students.map((s) => (
                  <tr key={s._id}>
                    <td><strong>{s.admissionNumber}</strong></td>
                    <td>{s.name}</td>
                    <td><span className="badge badge-navy">{s.course}</span></td>
                    <td>Sem {s.semester}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{s.email}</td>
                    <td><span className={`badge badge-${s.status === 'active' ? 'success' : 'warning'}`}>{s.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm btn-icon" title="View" onClick={() => openView(s)}><Eye size={14} /></button>
                        <button className="btn btn-ghost btn-sm btn-icon" title="Edit" onClick={() => openEdit(s)}><Pencil size={14} /></button>
                        <button className="btn btn-ghost btn-sm btn-icon" title="Delete" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(s._id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <span>Showing {students.length} of {total || students.length} students</span>
            <div className="pagination-btns">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} className={`pagination-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{modal === 'create' ? 'Add New Student' : 'Edit Student'}</span>
              <button className="btn btn-ghost btn-icon" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Admission Number *</label><input name="admissionNumber" className="form-control" value={form.admissionNumber} onChange={handleChange} required /></div>
                  <div className="form-group"><label className="form-label">Full Name *</label><input name="name" className="form-control" value={form.name} onChange={handleChange} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Email *</label><input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required /></div>
                  <div className="form-group"><label className="form-label">Phone</label><input name="phone" className="form-control" value={form.phone} onChange={handleChange} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Department *</label><input name="department" className="form-control" value={form.department} onChange={handleChange} required /></div>
                  <div className="form-group"><label className="form-label">Course *</label><input name="course" className="form-control" value={form.course} onChange={handleChange} placeholder="B.Tech CS" required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Semester</label>
                    <select name="semester" className="form-control" value={form.semester} onChange={handleChange}>
                      {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Gender</label>
                    <select name="gender" className="form-control" value={form.gender} onChange={handleChange}>
                      <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Academic Year</label><input name="academicYear" className="form-control" value={form.academicYear} onChange={handleChange} placeholder="2026-2027" /></div>
                  <div className="form-group"><label className="form-label">Date of Birth</label><input type="date" name="dob" className="form-control" value={form.dob ? form.dob.slice(0,10) : ''} onChange={handleChange} /></div>
                </div>
                <div className="divider" />
                <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>Parent / Guardian</div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Parent Name</label><input name="parentName" className="form-control" value={form.parentName} onChange={handleChange} /></div>
                  <div className="form-group"><label className="form-label">Parent Phone</label><input name="parentPhone" className="form-control" value={form.parentPhone} onChange={handleChange} /></div>
                </div>
                <div className="form-group"><label className="form-label">Parent Email</label><input type="email" name="parentEmail" className="form-control" value={form.parentEmail} onChange={handleChange} /></div>
                <div className="divider" />
                <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>Address</div>
                <div className="form-group"><label className="form-label">Street</label><input name="address.street" className="form-control" value={form['address.street']} onChange={handleChange} /></div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">City</label><input name="address.city" className="form-control" value={form['address.city']} onChange={handleChange} /></div>
                  <div className="form-group"><label className="form-label">State</label><input name="address.state" className="form-control" value={form['address.state']} onChange={handleChange} /></div>
                </div>
                <div className="form-group"><label className="form-label">Pincode</label><input name="address.pincode" className="form-control" value={form['address.pincode']} onChange={handleChange} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <><span className="spinner" /> Saving…</> : (modal === 'create' ? 'Create Student' : 'Save Changes')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modal === 'view' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Student Profile</span>
              <button className="btn btn-ghost btn-icon" onClick={closeModal}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {[
                ['Admission No.', selected.admissionNumber], ['Name', selected.name],
                ['Email', selected.email], ['Phone', selected.phone],
                ['Course', selected.course], ['Semester', `Sem ${selected.semester}`],
                ['Department', selected.department], ['Gender', selected.gender],
                ['Academic Year', selected.academicYear], ['Status', selected.status],
                ['Parent Name', selected.parentName], ['Parent Phone', selected.parentPhone],
              ].map(([k, v]) => v ? (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:'.8rem', color:'var(--text-muted)', fontWeight:500 }}>{k}</span>
                  <span style={{ fontSize:'.875rem', fontWeight:600, color:'var(--navy)' }}>{v}</span>
                </div>
              ) : null)}
              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <div style={{ flex:1, background:'var(--surface-2)', borderRadius:'var(--radius)', padding:14, textAlign:'center' }}>
                  <div style={{ fontSize:'.7rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.05em' }}>Total Paid</div>
                  <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, color:'var(--success)', fontSize:'1.1rem' }}>₹{(selected.totalFeesPaid||0).toLocaleString('en-IN')}</div>
                </div>
                <div style={{ flex:1, background:'var(--surface-2)', borderRadius:'var(--radius)', padding:14, textAlign:'center' }}>
                  <div style={{ fontSize:'.7rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.05em' }}>Total Pending</div>
                  <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, color:'var(--danger)', fontSize:'1.1rem' }}>₹{(selected.totalFeesPending||0).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
