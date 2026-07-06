import { useState, useEffect, useCallback } from 'react';
import Topbar from '../components/Topbar';
import api from '../utils/api';
import { Search, Download, Eye, X, FileText } from 'lucide-react';

const fmt = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN');

const Receipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(false);
  const [selected, setSelected] = useState(null);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/receipts', { params: { page, limit:10, search } });
      setReceipts(r.data.data?.receipts || r.data.data || []);
      setTotal(r.data.data?.total || 0);
    } catch { setReceipts([]); } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const openView = (r) => { setSelected(r); setModal(true); };

  const totalPages = Math.ceil(total / 10) || 1;

  return (
    <div className="fade-in">
      <Topbar title="Receipts" subtitle="View and download all payment receipts" />
      <div className="page-body">
        <div className="filters-bar">
          <div className="search-input-wrap">
            <Search size={15} />
            <input className="search-input" placeholder="Search by receipt number or student…"
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>

        <div className="card">
          <div className="table-wrapper" style={{ border:'none', borderRadius:0 }}>
            <table className="table">
              <thead>
                <tr><th>Receipt No.</th><th>Student</th><th>Fee Type</th><th>Amount Paid</th><th>Method</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ textAlign:'center', padding:40 }}><div className="spinner dark" style={{ margin:'0 auto' }} /></td></tr>
                ) : receipts.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty-state"><FileText size={48} /><h3>No receipts found</h3></div></td></tr>
                ) : receipts.map((r) => (
                  <tr key={r._id}>
                    <td><strong style={{ color:'var(--navy)' }}>{r.receiptNumber}</strong></td>
                    <td>{r.student?.name || '—'}<div style={{ fontSize:'.72rem', color:'var(--text-muted)' }}>{r.student?.admissionNumber}</div></td>
                    <td><span className="badge badge-info">{r.feeType?.replace(/_/g,' ') || r.studentFee?.feeStructure?.feeType?.replace(/_/g,' ') || '—'}</span></td>
                    <td style={{ fontWeight:700, color:'var(--success)' }}>{fmt(r.paidAmount)}</td>
                    <td><span className="badge badge-navy">{r.paymentMethod}</span></td>
                    <td>{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-ghost btn-sm btn-icon" title="View" onClick={() => openView(r)}><Eye size={14} /></button>
                        <a className="btn btn-ghost btn-sm btn-icon" title="Download" href={`http://localhost:5000/api/receipts/${r._id}/download`} target="_blank" rel="noreferrer"><Download size={14} /></a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <span>Showing {receipts.length} of {total || receipts.length} receipts</span>
            <div className="pagination-btns">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} className={`pagination-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {modal && selected && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Receipt Details</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {/* Header */}
              <div style={{ textAlign:'center', padding:'16px 0 20px', borderBottom:'2px solid var(--gold)', marginBottom:20 }}>
                <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'1.1rem', color:'var(--navy)' }}>Sri Eshwar College of Engineering</div>
                <div style={{ fontSize:'.75rem', color:'var(--text-muted)', marginBottom:12 }}>Kondampatti Post, Kinathukadavu, Coimbatore - 641202</div>
                <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'1.3rem', color:'var(--gold)' }}>{selected.receiptNumber}</div>
                <div style={{ fontSize:'.75rem', color:'var(--text-muted)' }}>Fee Receipt</div>
              </div>
              {[
                ['Student Name',    selected.student?.name || '—'],
                ['Admission No.',   selected.student?.admissionNumber || '—'],
                ['Amount Paid',     fmt(selected.paidAmount)],
                ['Payment Method',  selected.paymentMethod],
                ['Transaction ID',  selected.transactionId || 'N/A'],
                ['Payment Date',    new Date(selected.paymentDate || selected.createdAt).toLocaleString('en-IN')],
                ['Collected By',    selected.collectedBy?.name || '—'],
              ].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ color:'var(--text-muted)', fontSize:'.875rem' }}>{k}</span>
                  <strong style={{ color:'var(--navy)' }}>{v}</strong>
                </div>
              ))}
              <div style={{ marginTop:20, textAlign:'center' }}>
                <a href={`http://localhost:5000/api/receipts/${selected._id}/download`} target="_blank" rel="noreferrer" className="btn btn-primary"><Download size={15} />Download PDF</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Receipts;
