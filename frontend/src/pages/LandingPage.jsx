import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

const features = [
  { icon: '🤖', title: 'AI-Powered Analysis', desc: 'Groq LLaMA AI reads your resume and job description to give you intelligent, human-quality feedback in seconds.', color: 'rgba(139, 92, 246, 0.15)' },
  { icon: '📊', title: 'Match Score', desc: 'Get a precise percentage score showing how well your resume aligns with the job description using semantic NLP.', color: 'rgba(59, 130, 246, 0.15)' },
  { icon: '🎯', title: 'Skill Gap Analysis', desc: 'Instantly see which skills the employer wants that are missing from your resume, with advice on how to address them.', color: 'rgba(16, 185, 129, 0.15)' },
  { icon: '📝', title: 'PDF Resume Upload', desc: 'Simply upload your resume PDF — our smart parser extracts the text automatically, no manual copy-pasting needed.', color: 'rgba(245, 158, 11, 0.15)' },
  { icon: '📈', title: 'Analysis History', desc: 'Track all your past analyses. See how your resume improves over time as you apply for different positions.', color: 'rgba(236, 72, 153, 0.15)' },
  { icon: '🔒', title: 'Secure & Private', desc: 'JWT authentication keeps your data private. Your resume content is never shared with other users.', color: 'rgba(6, 182, 212, 0.15)' },
];

const steps = [
  { number: '1', title: 'Upload Your Resume', desc: 'Upload your PDF resume or paste the text directly' },
  { number: '2', title: 'Paste Job Description', desc: 'Copy and paste the job posting you\'re applying for' },
  { number: '3', title: 'Get AI Analysis', desc: 'Receive your score, feedback, and improvement tips' },
];

function LandingPage() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="landing-page">
      <section className="hero">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 className="hero-title">
            Land Your Dream Job with{' '}
            <span className="gradient-text">Adarsh Intelligence Resume Analyzer</span>
          </h1>

          <p className="hero-subtitle">
            Upload your resume and paste any job description. Our AI Resume Analyzer
            instantly scores your match, identifies skill gaps, and gives you actionable
            feedback to get the interview.
          </p>

          <div className="hero-actions">
            {isLoggedIn ? (
              <Link to="/analyze" className="btn-primary">Analyze My Resume →</Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary">Start for Free →</Link>
                <Link to="/login" className="btn-secondary">Sign In</Link>
              </>
            )}
          </div>

          <div className="hero-stats">
            {[
              { value: '95%', label: 'Accuracy Rate' },
              { value: '<5s', label: 'Analysis Time' },
              { value: '100%', label: 'Free to Use' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div className="hero-stat-value">{stat.value}</div>
                <div className="hero-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <div className="section-title">
            <div className="section-tag">Features</div>
            <h2 className="section-heading">
              Everything You Need to <span className="gradient-text">Stand Out</span>
            </h2>
          </div>
          <div className="features-grid">
            {features.map((feature) => (
              <div key={feature.title} className="glass-card feature-card">
                <div className="feature-icon" style={{ background: feature.color }}>{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="how-section">
        <div className="container">
          <div className="section-title">
            <div className="section-tag">Process</div>
            <h2 className="section-heading">
              How It <span className="gradient-text">Works</span>
            </h2>
          </div>
          <div className="steps-container">
            {steps.map((step) => (
              <div key={step.number} className="step-item">
                <div className="step-number">{step.number}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="glass-card cta-card">
            <h2 className="cta-title">
              Ready to <span className="gradient-text">Optimize</span> Your Resume?
            </h2>
            <p className="cta-desc">
              Join thousands of job seekers who improved their chances with AI-powered analysis.
              It's completely free.
            </p>
            <Link to={isLoggedIn ? '/analyze' : '/register'} className="btn-primary" style={{ padding: '14px 40px', fontSize: '1rem', position: 'relative', zIndex: 1 }}>
              {isLoggedIn ? 'Analyze Now →' : 'Create Free Account →'}
            </Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>Built with ❤️ by a Python Full Stack Developer • Django + React + Groq AI</p>
      </footer>
    </div>
  );
}

export default LandingPage;
