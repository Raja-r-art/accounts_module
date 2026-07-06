import { useState, useEffect, useCallback } from 'react';
import Topbar from '../components/Topbar';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Download, X, Briefcase } from 'lucide-react';

const fmt  = (n) => '₹' + (Number(n)||0).toLocaleString('en-IN');
const INIT = { employee:'', employeeName:'', department:'Accounts', designation:'', basicSalary:'', month: new Date().getMonth()+1, year: new Date().getFullYear(), allowances:{ hra:0, da:0, ta:0, medical:0, other:0 }, deductions:{ pf:0, esi:0, tax:0, other:0 }, paymentDate:'', status:'paid', remarks:'' };

const Salaries = () => {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [users,   setUsers]   = useState([]);
  const [form,    setForm]    = useState(INIT);
  const [saving,  setSaving]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get('/salaries'); setList(r.data.data || []); }
    catch { setList([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    api.get('/users?limit=200').then(r => setUsers(r.data.data?.users || r.data.data || [])).catch(() => {});
  }, [load]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleAllow  = (k,v) => setForm({ ...form, allowances:  { ...form.allowances,  [k]: Number(v) } });
  const handleDeduct = (k,v) => setForm({ ...form, deductions: { ...form.deductions, [k]: Number(v) } });

  const gross = Number(form.basicSalary) + Object.values(form.allowances).reduce((a,b)=>a+b,0);
  const deductions = Object.values(form.deductions).reduce((a,b)=>a+b,0);
  const net   = gross - deductions;

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/salaries', { ...form, grossSalary: gross, netSalary: net });
      toast.success('Salary disbursed!'); setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setSaving(false); }
  };

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="fade-in">
      <Topbar title="Payroll Manager" subtitle="Process and manage staff salary disbursements" />
      <div className="page-body">
        <div className="filters-bar">
          <div style={{ marginLeft:'auto' }}>
            <button className="btn btn-primary" onClick={() => { setForm(INIT); setModal(true); }}><Plus size={16} />Disburse Salary</button>
          </div>
        </div>

        <div className="card">
          <div className="table-wrapper" style={{ border:'none', borderRadius:0 }}>
            <table className="table">
              <thead>
                <tr><th>Employee</th><th>Department</th><th>Month</th><th>Gross</th><th>Deductions</th><th>Net Pay</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign:'center', padding:40 }}><div className="spinner dark" style={{ margin:'0 auto' }} /></td></tr>
                ) : list.length === 0 ? (
                  <tr><td colSpan={8}><div className="empty-state"><Briefcase size={48} /><h3>No salary records found</h3></div></td></tr>
                ) : list.map((s) => (
                  <tr key={s._id}>
                    <td><strong>{s.employeeName}</strong><div style={{ fontSize:'.72rem', color:'var(--text-muted)' }}>{s.designation}</div></td>
                    <td>{s.department}</td>
                    <td>{MONTHS[(s.month||1)-1]} {s.year}</td>
                    <td>{fmt(s.grossSalary)}</td>
                    <td style={{ color:'var(--danger)' }}>{fmt(Object.values(s.deductions||{}).reduce((a,b)=>a+b,0))}</td>
                    <td style={{ fontWeight:700, color:'var(--navy)' }}>{fmt(s.netSalary)}</td>
                    <td><span className={`badge ${s.status==='paid'?'badge-success':'badge-warning'}`}>{s.status}</span></td>
                    <td>
                      <a className="btn btn-ghost btn-sm btn-icon" href={`http://localhost:5000/api/salaries/${s._id}/slip`} target="_blank" rel="noreferrer" title="Download Slip"><Download size={14} /></a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ maxWidth:580 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Disburse Salary</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ maxHeight:'65vh', overflowY:'auto' }}>
                <div className="form-group"><label className="form-label">Employee *</label>
                  <select name="employee" className="form-control" value={form.employee}
                    onChange={(e) => { const u = users.find(x=>x._id===e.target.value); setForm({ ...form, employee: e.target.value, employeeName: u?.name||'' }); }} required>
                    <option value="">— Select Employee —</option>
                    {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Department</label><input name="department" className="form-control" value={form.department} onChange={handleChange} /></div>
                  <div className="form-group"><label className="form-label">Designation</label><input name="designation" className="form-control" value={form.designation} onChange={handleChange} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Month *</label>
                    <select name="month" className="form-control" value={form.month} onChange={handleChange}>
                      {MONTHS.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Year *</label><input type="number" name="year" className="form-control" value={form.year} onChange={handleChange} min={2020} /></div>
                </div>
                <div className="form-group"><label className="form-label">Basic Salary (₹) *</label><input type="number" name="basicSalary" className="form-control" value={form.basicSalary} onChange={handleChange} min={0} required /></div>

                <div className="divider" />
                <div style={{ fontSize:'.8rem', fontWeight:600, color:'var(--text-muted)', marginBottom:10, textTransform:'uppercase', letterSpacing:'.05em' }}>Allowances</div>
                <div className="form-row">
                  {[['HRA','hra'],['DA','da'],['TA','ta'],['Medical','medical']].map(([l,k]) => (
                    <div className="form-group" key={k}><label className="form-label">{l} (₹)</label><input type="number" className="form-control" value={form.allowances[k]} onChange={(e) => handleAllow(k, e.target.value)} min={0} /></div>
                  ))}
                </div>

                <div className="divider" />
                <div style={{ fontSize:'.8rem', fontWeight:600, color:'var(--text-muted)', marginBottom:10, textTransform:'uppercase', letterSpacing:'.05em' }}>Deductions</div>
                <div className="form-row">
                  {[['PF','pf'],['ESI','esi'],['Tax','tax'],['Other','other']].map(([l,k]) => (
                    <div className="form-group" key={k}><label className="form-label">{l} (₹)</label><input type="number" className="form-control" value={form.deductions[k]} onChange={(e) => handleDeduct(k, e.target.value)} min={0} /></div>
                  ))}
                </div>

                {/* Net Summary */}
                <div style={{ background:'var(--surface-2)', borderRadius:'var(--radius)', padding:16, border:'1px solid var(--border)' }}>
                  {[['Gross Salary', fmt(gross), 'var(--success)'], ['Total Deductions', fmt(deductions), 'var(--danger)'], ['Net Pay', fmt(net), 'var(--navy)']].map(([l,v,c]) => (
                    <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0' }}>
                      <span style={{ fontSize:'.875rem', color:'var(--text-muted)' }}>{l}</span>
                      <strong style={{ color:c }}>{v}</strong>
                    </div>
                  ))}
                </div>

                <div className="form-row" style={{ marginTop:16 }}>
                  <div className="form-group"><label className="form-label">Payment Date</label><input type="date" name="paymentDate" className="form-control" value={form.paymentDate} onChange={handleChange} /></div>
                  <div className="form-group"><label className="form-label">Status</label>
                    <select name="status" className="form-control" value={form.status} onChange={handleChange}>
                      <option value="paid">Paid</option><option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Remarks</label><textarea name="remarks" className="form-control" rows={2} value={form.remarks} onChange={handleChange} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <><span className="spinner" />Processing…</> : 'Disburse Salary'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Salaries;
