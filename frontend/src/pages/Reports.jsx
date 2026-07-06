import { useState } from 'react';
import Topbar from '../components/Topbar';
import toast from 'react-hot-toast';
import { Download, BarChart2, FileText } from 'lucide-react';

const REPORT_TYPES = [
  { id:'collection',   label:'Fee Collection Report',     desc:'Day/month-wise fee collection summary' },
  { id:'outstanding',  label:'Outstanding Balances',       desc:'Students with pending fee dues' },
  { id:'profit-loss',  label:'Profit & Loss Statement',   desc:'Income vs. Expense financial analysis' },
];

const Reports = () => {
  const [reportType, setReportType] = useState('collection');
  const [format,     setFormat]     = useState('pdf');
  const [fromDate,   setFromDate]   = useState('');
  const [toDate,     setToDate]     = useState('');
  const [course,     setCourse]     = useState('');
  const [loading,    setLoading]    = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ format });
      if (fromDate) params.set('fromDate', fromDate);
      if (toDate)   params.set('toDate', toDate);
      if (course)   params.set('course', course);

      const url = `http://localhost:5000/api/reports/${reportType}?${params.toString()}`;
      const token = localStorage.getItem('accessToken');

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { toast.error('Report generation failed. Make sure backend is running.'); return; }

      const blob  = await res.blob();
      const link  = document.createElement('a');
      const ext   = format === 'excel' ? 'xlsx' : format;
      link.href   = URL.createObjectURL(blob);
      link.download = `${reportType}_report_${new Date().toLocaleDateString('en-IN').replace(/\//g,'-')}.${ext}`;
      link.click();
      toast.success(`${format.toUpperCase()} report downloaded!`);
    } catch { toast.error('Download failed. Make sure backend server is running.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fade-in">
      <Topbar title="Reports" subtitle="Generate and export financial reports" />
      <div className="page-body">

        <div className="grid-2" style={{ alignItems:'start' }}>
          {/* Report Builder */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Report Builder</span>
            </div>
            <div className="card-body">
              {/* Report Type */}
              <div className="form-group">
                <label className="form-label">Report Type</label>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {REPORT_TYPES.map((r) => (
                    <label key={r.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:'var(--radius)', border:`1.5px solid ${reportType===r.id?'var(--navy)':'var(--border)'}`, background:reportType===r.id?'#EEF2FF':'var(--surface-2)', cursor:'pointer', transition:'all .15s' }}>
                      <input type="radio" name="reportType" value={r.id} checked={reportType===r.id} onChange={() => setReportType(r.id)} style={{ accentColor:'var(--navy)' }} />
                      <div>
                        <div style={{ fontWeight:600, fontSize:'.875rem', color:'var(--navy)' }}>{r.label}</div>
                        <div style={{ fontSize:'.75rem', color:'var(--text-muted)' }}>{r.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div className="form-group">
                <label className="form-label">Export Format</label>
                <div style={{ display:'flex', gap:10 }}>
                  {[['pdf','PDF'],['excel','Excel'],['csv','CSV']].map(([v,l]) => (
                    <button key={v} type="button"
                      onClick={() => setFormat(v)}
                      className={`btn ${format===v?'btn-primary':'btn-outline'}`} style={{ flex:1 }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="form-row">
                <div className="form-group"><label className="form-label">From Date</label><input type="date" className="form-control" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></div>
                <div className="form-group"><label className="form-label">To Date</label><input type="date" className="form-control" value={toDate} onChange={(e) => setToDate(e.target.value)} /></div>
              </div>

              {/* Filters */}
              <div className="form-group"><label className="form-label">Filter by Course (optional)</label><input className="form-control" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="B.Tech CS, B.Tech EC…" /></div>

              <button className="btn btn-primary btn-lg w-100" onClick={handleGenerate} disabled={loading}>
                {loading ? <><span className="spinner" />Generating…</> : <><Download size={16} />Generate & Download Report</>}
              </button>
            </div>
          </div>

          {/* Quick Export Cards */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {[
              { title:"Today's Collection", sub:'Quick PDF of today\'s fee collections', type:'collection', fmt:'pdf', icon:BarChart2, color:'var(--navy)' },
              { title:'Outstanding Report', sub:'All students with pending dues (CSV)', type:'outstanding', fmt:'csv', icon:FileText, color:'var(--danger)' },
              { title:'P&L This Month',     sub:'Profit & Loss statement (Excel)', type:'profit-loss', fmt:'excel', icon:BarChart2, color:'var(--success)' },
            ].map(({ title, sub, type, fmt: f, icon: Icon, color }) => (
              <div key={title} className="card" style={{ borderLeft:`4px solid ${color}` }}>
                <div className="card-body" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 20px', gap:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ width:40, height:40, borderRadius:'var(--radius-sm)', background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', color }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight:600, color:'var(--navy)', fontSize:'.9rem' }}>{title}</div>
                      <div style={{ fontSize:'.75rem', color:'var(--text-muted)' }}>{sub}</div>
                    </div>
                  </div>
                  <button className="btn btn-outline btn-sm"
                    onClick={async () => {
                      const url = `http://localhost:5000/api/reports/${type}?format=${f}`;
                      const token = localStorage.getItem('accessToken');
                      try {
                        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
                        const blob = await res.blob();
                        const link = document.createElement('a');
                        const ext  = f === 'excel' ? 'xlsx' : f;
                        link.href   = URL.createObjectURL(blob);
                        link.download = `${type}.${ext}`;
                        link.click();
                        toast.success('Downloaded!');
                      } catch { toast.error('Backend not connected.'); }
                    }}>
                    <Download size={14} />
                  </button>
                </div>
              </div>
            ))}

            <div style={{ padding:'20px', background:'linear-gradient(135deg, var(--navy-dark), var(--navy))', borderRadius:'var(--radius-lg)', color:'#fff' }}>
              <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, marginBottom:8, fontSize:'1rem' }}>Sri Eshwar College of Engineering</div>
              <div style={{ fontSize:'.78rem', opacity:.7, lineHeight:1.6 }}>
                Kondampatti Post, Kinathukadavu<br/>Coimbatore – 641 202, Tamil Nadu<br/>Tel: 0422-2667588
              </div>
              <div style={{ marginTop:14, fontSize:'.72rem', background:'rgba(255,255,255,.08)', borderRadius:'var(--radius-sm)', padding:'8px 12px', color:'rgba(255,255,255,.6)' }}>
                All reports include official SECE header and are audit-ready.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
