import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Shield, BookOpen, BarChart2, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to the backend server. Please make sure the backend server is running in your VS Code terminal (on port 5000).');
      } else {
        setError(err.response?.data?.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Left Branding Panel */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-logo">SE</div>
          <h1>Sri Eshwar College<br/>of Engineering</h1>
          <p>Integrated ERP Accountant Module — managing fees, payroll, and financial reports seamlessly.</p>
        </div>
        <div className="login-features">
          {[
            { icon: Shield,    text: 'Role-Based Access Control (RBAC)' },
            { icon: BarChart2, text: 'Live Dashboard & Financial Charts' },
            { icon: BookOpen,  text: 'Automated Fee & Receipt Generation' },
            { icon: Users,     text: 'Student & Staff Management' },
          ].map(({ icon: Icon, text }) => (
            <div className="login-feature" key={text}>
              <Icon size={16} />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="login-right">
        <div className="login-form-box fade-in">
          <div style={{ marginBottom: 32 }}>
            <div className="login-form-title">Welcome back 👋</div>
            <div className="login-form-sub">Sign in to your SECE ERP account</div>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>
              <Shield size={16} />{error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Email Address</label>
              <div className="login-input-group">
                <Mail size={17} />
                <input
                  type="email" name="email" value={form.email}
                  onChange={handleChange} placeholder="accountant@college.edu"
                  className="login-input" autoComplete="email"
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="form-label">Password</label>
              <div className="login-input-group">
                <Lock size={17} />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password" value={form.password}
                  onChange={handleChange} placeholder="••••••••••"
                  className="login-input" autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit" className="btn btn-primary btn-lg w-100"
              disabled={loading}
              style={{ background: 'var(--navy)', borderRadius: 'var(--radius)' }}
            >
              {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 28, padding: '16px', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.05em' }}>Demo Credentials</div>
            {[
              { role: 'Accountant', email: 'accountant@college.edu', pass: 'AccountantPassword123!' },
              { role: 'Principal',  email: 'principal@college.edu',  pass: 'PrincipalPassword123!' },
              { role: 'Super Admin',email: 'admin@college.edu',       pass: 'AdminPassword123!' },
            ].map(({ role, email, pass }) => (
              <div
                key={role}
                onClick={() => setForm({ email, password: pass })}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
              >
                <span style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--navy)' }}>{role}</span>
                <span style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{email}</span>
              </div>
            ))}
            <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginTop: 8 }}>Click a row to auto-fill credentials</div>
          </div>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: '.78rem', color: 'var(--text-muted)' }}>
            Sri Eshwar College of Engineering &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
