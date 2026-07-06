import { useState, useEffect, useCallback } from 'react';
import Topbar from '../components/Topbar';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, TrendingUp, TrendingDown } from 'lucide-react';

const fmt = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN');

const EXPENSE_CATS = ['electricity','internet','maintenance','rent','equipment','salary','lab_supplies','transport','misc'];
const INCOME_SOURCES = ['donation','government_fund','research_grant','event_fee','interest','misc'];

const INIT_E = { category:'electricity', vendor:'', invoiceNumber:'', amount:'', date:'', description:'' };
const INIT_I = { source:'donation', amount:'', date:'', description:'', reference:'' };

const Section = ({ title, icon: Icon, color, data, columns, onAdd, onEdit, onDelete, loading }) => (
  <div className="card">
    <div className="card-header">
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:36, height:36, borderRadius:'var(--radius-sm)', background: color==='teal'?'#F0FDFA':'#FFF5F5', display:'flex', alignItems:'center', justifyContent:'center', color: color==='teal'?'var(--teal)':'var(--danger)' }}>
          <Icon size={18} />
        </div>
        <span className="card-title">{title}</span>
      </div>
      <button className="btn btn-primary btn-sm" onClick={onAdd}><Plus size={14} />Add</button>
    </div>
    <div className="table-wrapper" style={{ border:'none', borderRadius:0 }}>
      <table className="table">
        <thead><tr>{columns.map(c => <th key={c}>{c}</th>)}<th>Actions</th></tr></thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length+1} style={{ textAlign:'center', padding:30 }}><div className="spinner dark" style={{ margin:'0 auto' }} /></td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={columns.length+1}><div className="empty-state" style={{ padding:30 }}><h3>No records yet</h3></div></td></tr>
          ) : data.map((r) => (
            <tr key={r._id}>
              {columns.map((c, i) => (
                <td key={c}>{i === 0 ? <strong>{r[Object.keys(r)[i+1]] || r.category || r.source}</strong> :
                  c === 'Amount' ? <span style={{ fontWeight:600, color: color==='teal'?'var(--success)':'var(--danger)' }}>{fmt(r.amount)}</span> :
                  c === 'Date' ? new Date(r.date || r.createdAt).toLocaleDateString('en-IN') :
                  r[c.toLowerCase()] || r[Object.keys(r)[i+1]] || '—'
                }</td>
              ))}
              <td>
                <div style={{ display:'flex', gap:6 }}>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => onEdit(r)}><Pencil size={14} /></button>
                  <button className="btn btn-ghost btn-sm btn-icon" style={{ color:'var(--danger)' }} onClick={() => onDelete(r._id)}><Trash2 size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ExpensesIncomes = () => {
  const [expenses,  setExpenses]  = useState([]);
  const [incomes,   setIncomes]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(null);
  const [selected,  setSelected]  = useState(null);
  const [formE,     setFormE]     = useState(INIT_E);
  const [formI,     setFormI]     = useState(INIT_I);
  const [saving,    setSaving]    = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [er, ir] = await Promise.all([api.get('/expenses'), api.get('/incomes')]);
      setExpenses(er.data.data || []);
      setIncomes(ir.data.data || []);
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSaveExpense = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (selected) await api.put(`/expenses/${selected._id}`, formE);
      else await api.post('/expenses', formE);
      toast.success('Expense saved!'); closeModal(); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setSaving(false); }
  };

  const handleSaveIncome = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (selected) await api.put(`/incomes/${selected._id}`, formI);
      else await api.post('/incomes', formI);
      toast.success('Income saved!'); closeModal(); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setSaving(false); }
  };

  const deleteExpense = async (id) => { if (!window.confirm('Delete?')) return; await api.delete(`/expenses/${id}`).then(() => { toast.success('Deleted'); load(); }).catch(() => toast.error('Failed')); };
  const deleteIncome  = async (id) => { if (!window.confirm('Delete?')) return; await api.delete(`/incomes/${id}`).then(() => { toast.success('Deleted'); load(); }).catch(() => toast.error('Failed')); };

  return (
    <div className="fade-in">
      <Topbar title="Expenses & Incomes" subtitle="Track all college financial transactions" />
      <div className="page-body">
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
          <Section
            title="Other Incomes" icon={TrendingUp} color="teal"
            data={incomes} loading={loading}
            columns={['Source', 'Amount', 'Reference', 'Date']}
            onAdd={() => { setFormI(INIT_I); setSelected(null); setModal('income'); }}
            onEdit={(r) => { setSelected(r); setFormI({ ...INIT_I, ...r, date: r.date?.slice(0,10) }); setModal('income'); }}
            onDelete={deleteIncome}
          />
          <Section
            title="Expenses" icon={TrendingDown} color="red"
            data={expenses} loading={loading}
            columns={['Category', 'Vendor', 'Amount', 'Date']}
            onAdd={() => { setFormE(INIT_E); setSelected(null); setModal('expense'); }}
            onEdit={(r) => { setSelected(r); setFormE({ ...INIT_E, ...r, date: r.date?.slice(0,10) }); setModal('expense'); }}
            onDelete={deleteExpense}
          />
        </div>
      </div>

      {/* Expense Modal */}
      {modal === 'expense' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{selected ? 'Edit Expense' : 'Add Expense'}</span>
              <button className="btn btn-ghost btn-icon" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveExpense}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Category *</label>
                    <select name="category" className="form-control" value={formE.category} onChange={(e) => setFormE({ ...formE, category: e.target.value })}>
                      {EXPENSE_CATS.map(c => <option key={c} value={c}>{c.replace(/_/g,' ')}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Amount (₹) *</label>
                    <input type="number" className="form-control" value={formE.amount} onChange={(e) => setFormE({ ...formE, amount: e.target.value })} min={0} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Vendor</label><input className="form-control" value={formE.vendor} onChange={(e) => setFormE({ ...formE, vendor: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Invoice No.</label><input className="form-control" value={formE.invoiceNumber} onChange={(e) => setFormE({ ...formE, invoiceNumber: e.target.value })} /></div>
                </div>
                <div className="form-group"><label className="form-label">Date *</label><input type="date" className="form-control" value={formE.date} onChange={(e) => setFormE({ ...formE, date: e.target.value })} required /></div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={2} value={formE.description} onChange={(e) => setFormE({ ...formE, description: e.target.value })} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <><span className="spinner" />Saving…</> : 'Save Expense'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Income Modal */}
      {modal === 'income' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{selected ? 'Edit Income' : 'Add Income'}</span>
              <button className="btn btn-ghost btn-icon" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveIncome}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Source *</label>
                    <select className="form-control" value={formI.source} onChange={(e) => setFormI({ ...formI, source: e.target.value })}>
                      {INCOME_SOURCES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Amount (₹) *</label>
                    <input type="number" className="form-control" value={formI.amount} onChange={(e) => setFormI({ ...formI, amount: e.target.value })} min={0} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Date *</label><input type="date" className="form-control" value={formI.date} onChange={(e) => setFormI({ ...formI, date: e.target.value })} required /></div>
                  <div className="form-group"><label className="form-label">Reference</label><input className="form-control" value={formI.reference} onChange={(e) => setFormI({ ...formI, reference: e.target.value })} /></div>
                </div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={2} value={formI.description} onChange={(e) => setFormI({ ...formI, description: e.target.value })} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-teal" disabled={saving}>{saving ? <><span className="spinner" />Saving…</> : 'Save Income'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesIncomes;
