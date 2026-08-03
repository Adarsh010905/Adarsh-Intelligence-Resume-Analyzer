import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', first_name: '', last_name: '', password: '', password2: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!formData.password2) newErrors.password2 = 'Please confirm your password';
    else if (formData.password !== formData.password2) newErrors.password2 = "Passwords don't match";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setIsLoading(true);
    try {
      await register(formData.email, formData.first_name, formData.last_name, formData.password, formData.password2);
      navigate('/dashboard');
    } catch (err) {
      if (err.data) setErrors(err.data);
      else setErrors({ general: err.message });
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
              <span className="gradient-text">Adarsh</span>Intelligence
            </h2>
            <p className="brand-tagline">Join thousands of job seekers</p>
            <div className="brand-features">
              {['✅ 100% Free to use', '🔒 Your data is private', '⚡ Analysis in seconds', '🎯 Tailored feedback'].map(f => (
                <div key={f} className="brand-feature">{f}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-container">
            <div className="auth-header">
              <h1 className="auth-title">Create your account</h1>
              <p className="auth-subtitle">Start improving your resume today</p>
            </div>

            {errors.general && <div className="auth-error"><span>⚠</span> {errors.general}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="first_name">First Name</label>
                  <input id="first_name" name="first_name" type="text" className={`form-input ${errors.first_name ? 'input-error' : ''}`} placeholder="John" value={formData.first_name} onChange={handleChange} />
                  {errors.first_name && <span className="form-error">{errors.first_name}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="last_name">Last Name</label>
                  <input id="last_name" name="last_name" type="text" className={`form-input ${errors.last_name ? 'input-error' : ''}`} placeholder="Doe" value={formData.last_name} onChange={handleChange} />
                  {errors.last_name && <span className="form-error">{errors.last_name}</span>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Email Address</label>
                <input id="reg-email" name="email" type="email" className={`form-input ${errors.email ? 'input-error' : ''}`} placeholder="you@example.com" value={formData.email} onChange={handleChange} />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password</label>
                <input id="reg-password" name="password" type="password" className={`form-input ${errors.password ? 'input-error' : ''}`} placeholder="Min. 8 characters" value={formData.password} onChange={handleChange} />
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="password2">Confirm Password</label>
                <input id="password2" name="password2" type="password" className={`form-input ${errors.password2 ? 'input-error' : ''}`} placeholder="Repeat your password" value={formData.password2} onChange={handleChange} />
                {errors.password2 && <span className="form-error">{errors.password2}</span>}
              </div>
              <button type="submit" className="btn-primary auth-submit-btn" disabled={isLoading}>
                {isLoading ? (<><div className="spinner"></div>Creating account...</>) : 'Create Account →'}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
