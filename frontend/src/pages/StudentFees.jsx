import { useState, useEffect, useCallback } from 'react';
import Topbar from '../components/Topbar';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Eye, X, CreditCard, CheckCircle } from 'lucide-react';

const fmt = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN');

const STATUS_BADGE = { paid:'badge-success', partial:'badge-warning', pending:'badge-danger', overdue:'badge-danger' };

const StudentFees = () => {
  const [fees,    setFees]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [selected,setSelected]= useState(null);
  const [payForm, setPayForm] = useState({ paidAmount:'', paymentMethod:'cash', transactionId:'', remarks:'' });
  const [assignForm, setAssignForm] = useState({ student:'', feeStructure:'', discount:'0', scholarship:'0', fine:'0' });
  const [students,   setStudents]   = useState([]);
  const [structures, setStructures] = useState([]);
  const [saving,  setSaving]  = useState(false);
  const [receipt, setReceipt] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get('/student-fees'); setFees(r.data.data || []); }
    catch { setFees([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    api.get('/students?limit=200').then(r => setStudents(r.data.data?.students || r.data.data || [])).catch(() => {});
    api.get('/fee-structures').then(r => setStructures(r.data.data || [])).catch(() => {});
  }, [load]);

  const openPay    = (f) => { setSelected(f); setPayForm({ paidAmount:'', paymentMethod:'cash', transactionId:'', remarks:'' }); setReceipt(null); setModal('pay'); };
  const openAssign = () => { setAssignForm({ student:'', feeStructure:'', discount:'0', scholarship:'0', fine:'0' }); setModal('assign'); };
  const closeModal = () => { setModal(null); setSelected(null); setReceipt(null); };

  const handlePay = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const r = await api.post(`/student-fees/${selected._id}/pay`, payForm);
      setReceipt(r.data.data?.receipt || null);
      toast.success('Payment recorded successfully!');
      load();
      setModal('receipt');
    } catch (err) { toast.error(err.response?.data?.message || 'Payment failed.'); }
    finally { setSaving(false); }
  };

  const handleAssign = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/student-fees', assignForm);
      toast.success('Fee assigned to student!'); closeModal(); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Assignment failed.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fade-in">
      <Topbar title="Fee Collection" subtitle="Record payments and manage student fee ledgers" />
      <div className="page-body">

        <div className="filters-bar">
          <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
            <button className="btn btn-outline" onClick={openAssign}><Plus size={16} />Assign Fee</button>
          </div>
        </div>

        <div className="card">
          <div className="table-wrapper" style={{ border:'none', borderRadius:0 }}>
            <table className="table">
              <thead>
                <tr><th>Student</th><th>Fee Type</th><th>Total</th><th>Paid</th><th>Pending</th><th>Status</th><th>Due Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign:'center', padding:40 }}><div className="spinner dark" style={{ margin:'0 auto' }} /></td></tr>
                ) : fees.length === 0 ? (
                  <tr><td colSpan={8}><div className="empty-state"><CreditCard size={48} /><h3>No fee records found</h3></div></td></tr>
                ) : fees.map((f) => (
                  <tr key={f._id}>
                    <td><strong>{f.student?.name || '—'}</strong><div style={{ fontSize:'.72rem', color:'var(--text-muted)' }}>{f.student?.admissionNumber}</div></td>
                    <td><span className="badge badge-info">{f.feeStructure?.feeType?.replace(/_/g,' ') || '—'}</span></td>
                    <td>{fmt(f.totalAmount)}</td>
                    <td style={{ color:'var(--success)', fontWeight:600 }}>{fmt(f.paidAmount)}</td>
                    <td style={{ color:'var(--danger)', fontWeight:600 }}>{fmt(f.pendingAmount)}</td>
                    <td><span className={`badge ${STATUS_BADGE[f.status] || 'badge-navy'}`}>{f.status}</span></td>
                    <td style={{ color: new Date(f.dueDate) < new Date() && f.status !== 'paid' ? 'var(--danger)' : 'var(--text-secondary)' }}>
                      {f.dueDate ? new Date(f.dueDate).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        {f.status !== 'paid' && (
                          <button className="btn btn-teal btn-sm" onClick={() => openPay(f)} style={{ gap:4 }}><CreditCard size={13} />Collect</button>
                        )}
                        {f.status === 'paid' && <span className="badge badge-success"><CheckCircle size={12} />Paid</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {modal === 'pay' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Collect Fee Payment</span>
              <button className="btn btn-ghost btn-icon" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handlePay}>
              <div className="modal-body">
                <div style={{ background:'var(--surface-2)', borderRadius:'var(--radius)', padding:14, marginBottom:20 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontSize:'.8rem', color:'var(--text-muted)' }}>Student</span>
                    <strong>{selected.student?.name}</strong>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontSize:'.8rem', color:'var(--text-muted)' }}>Fee Type</span>
                    <span>{selected.feeStructure?.feeType?.replace(/_/g,' ')}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:'.8rem', color:'var(--text-muted)' }}>Pending Amount</span>
                    <span style={{ fontWeight:700, color:'var(--danger)' }}>{fmt(selected.pendingAmount)}</span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Amount to Collect (₹) *</label>
                  <input type="number" className="form-control" value={payForm.paidAmount}
                    onChange={(e) => setPayForm({ ...payForm, paidAmount: e.target.value })}
                    max={selected.pendingAmount} min={1} required />
                  <div className="form-hint">Maximum: {fmt(selected.pendingAmount)}</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method *</label>
                  <select className="form-control" value={payForm.paymentMethod}
                    onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}>
                    <option value="cash">Cash</option>
                    <option value="online">Online Transfer</option>
                    <option value="upi">UPI</option>
                    <option value="cheque">Cheque</option>
                    <option value="dd">Demand Draft</option>
                  </select>
                </div>
                {payForm.paymentMethod !== 'cash' && (
                  <div className="form-group">
                    <label className="form-label">Transaction / Reference ID</label>
                    <input className="form-control" value={payForm.transactionId}
                      onChange={(e) => setPayForm({ ...payForm, transactionId: e.target.value })} placeholder="UTR / Cheque No." />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Remarks</label>
                  <textarea className="form-control" rows={2} value={payForm.remarks}
                    onChange={(e) => setPayForm({ ...payForm, remarks: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-teal" disabled={saving}>{saving ? <><span className="spinner" />Processing…</> : 'Record Payment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {modal === 'receipt' && receipt && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom:'3px solid var(--gold)' }}>
              <span className="modal-title">✅ Payment Receipt Generated</span>
              <button className="btn btn-ghost btn-icon" onClick={closeModal}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ textAlign:'center' }}>
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:'.7rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>Receipt Number</div>
                <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'1.4rem', color:'var(--navy)' }}>{receipt.receiptNumber}</div>
              </div>
              {receipt.qrCode && <img src={receipt.qrCode} alt="QR Code" style={{ width:120, margin:'0 auto 16px' }} />}
              {[
                ['Amount Paid', fmt(receipt.paidAmount)],
                ['Payment Method', receipt.paymentMethod],
                ['Date', new Date(receipt.paymentDate || receipt.createdAt).toLocaleString('en-IN')],
              ].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ color:'var(--text-muted)', fontSize:'.875rem' }}>{k}</span>
                  <strong>{v}</strong>
                </div>
              ))}
              <div style={{ marginTop:20, display:'flex', gap:10, justifyContent:'center' }}>
                <a href={`http://localhost:5000/api/receipts/${receipt._id}/download`} target="_blank" rel="noreferrer" className="btn btn-primary">Download PDF Receipt</a>
                <button className="btn btn-outline" onClick={closeModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Fee Modal */}
      {modal === 'assign' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Assign Fee to Student</span>
              <button className="btn btn-ghost btn-icon" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleAssign}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Student *</label>
                  <select className="form-control" value={assignForm.student} onChange={(e) => setAssignForm({ ...assignForm, student: e.target.value })} required>
                    <option value="">— Choose Student —</option>
                    {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.admissionNumber})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Select Fee Structure *</label>
                  <select className="form-control" value={assignForm.feeStructure} onChange={(e) => setAssignForm({ ...assignForm, feeStructure: e.target.value })} required>
                    <option value="">— Choose Fee Structure —</option>
                    {structures.map(s => <option key={s._id} value={s._id}>{s.course} | Sem {s.semester} | {s.feeType?.replace(/_/g,' ')} | ₹{Number(s.amount).toLocaleString('en-IN')}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Discount (₹)</label><input type="number" className="form-control" value={assignForm.discount} onChange={(e) => setAssignForm({ ...assignForm, discount: e.target.value })} min={0} /></div>
                  <div className="form-group"><label className="form-label">Scholarship (₹)</label><input type="number" className="form-control" value={assignForm.scholarship} onChange={(e) => setAssignForm({ ...assignForm, scholarship: e.target.value })} min={0} /></div>
                </div>
                <div className="form-group"><label className="form-label">Fine (₹)</label><input type="number" className="form-control" value={assignForm.fine} onChange={(e) => setAssignForm({ ...assignForm, fine: e.target.value })} min={0} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <><span className="spinner" />Assigning…</> : 'Assign Fee'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFees;
