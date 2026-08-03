import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <div className="brand-content">
            <div className="brand-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="brand-title">
              AI<span className="gradient-text">Resume</span>
            </h2>
            <p className="brand-tagline">Analyze. Improve. Get Hired.</p>
            <div className="brand-features">
              {['🎯 AI-powered resume scoring', '📊 Skill gap analysis', '💡 Actionable feedback', '📈 Track your progress'].map(f => (
                <div key={f} className="brand-feature">{f}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-container">
            <div className="auth-header">
              <h1 className="auth-title">Welcome back</h1>
              <p className="auth-subtitle">Sign in to your account</p>
            </div>

            {error && <div className="auth-error"><span>⚠</span> {error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input id="email" name="email" type="email" className="form-input" placeholder="you@example.com" value={formData.email} onChange={handleChange} required autoComplete="email" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input id="password" name="password" type="password" className="form-input" placeholder="Enter your password" value={formData.password} onChange={handleChange} required autoComplete="current-password" />
              </div>
              <button type="submit" className="btn-primary auth-submit-btn" disabled={isLoading}>
                {isLoading ? (<><div className="spinner"></div>Signing in...</>) : 'Sign In →'}
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">Create one for free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
