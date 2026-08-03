import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './DashboardPage.css';

function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const data = await api.analyzer.getStats();
      setStats(data);
    } catch (err) {
      setError('Could not load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--color-success)';
    if (score >= 60) return 'var(--color-info)';
    if (score >= 40) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Good {getTimeOfDay()}, {user?.first_name || 'there'}! 👋</h1>
            <p className="dashboard-subtitle">Here's an overview of your resume analysis activity.</p>
          </div>
          <Link to="/analyze" className="btn-primary">+ New Analysis</Link>
        </div>

        {error && <div style={{ color: 'var(--color-error)', padding: '16px', marginBottom: '24px', background: 'rgba(239,68,68,0.1)', borderRadius: '12px' }}>{error}</div>}

        <div className="stats-grid">
          <div className="stat-card glass-card">
            <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>📄</div>
            <div className="stat-content">
              <span className="stat-value">{stats?.total_analyses ?? 0}</span>
              <span className="stat-label">Total Analyses</span>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>📊</div>
            <div className="stat-content">
              <span className="stat-value" style={{ color: getScoreColor(stats?.average_score) }}>{stats?.average_score ?? 0}%</span>
              <span className="stat-label">Average Score</span>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>🏆</div>
            <div className="stat-content">
              <span className="stat-value" style={{ color: 'var(--color-success)' }}>{stats?.highest_score ?? 0}%</span>
              <span className="stat-label">Highest Score</span>
            </div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>⚡</div>
            <div className="stat-content">
              <span className="stat-value">Free</span>
              <span className="stat-label">Your Plan</span>
            </div>
          </div>
        </div>

        <div className="section-header">
          <h2 className="section-title-sm">Recent Analyses</h2>
          {stats?.total_analyses > 0 && <Link to="/history" className="view-all-link">View All →</Link>}
        </div>

        {stats?.recent_analyses?.length > 0 ? (
          <div className="recent-list">
            {stats.recent_analyses.map((analysis) => (
              <Link key={analysis.id} to={`/history/${analysis.id}`} className="recent-item glass-card">
                <div className="recent-item-info">
                  <h3 className="recent-item-title">{analysis.job_title || 'Resume Analysis'}</h3>
                  <p className="recent-item-meta">
                    {analysis.company_name && `${analysis.company_name} • `}
                    {formatDate(analysis.created_at)}
                  </p>
                </div>
                <div className="recent-item-score">
                  <div className="score-circle" style={{ '--score-color': getScoreColor(analysis.match_score) }}>
                    <span className="score-number">{Math.round(analysis.match_score)}%</span>
                  </div>
                  <span className="score-badge" style={{ color: getScoreColor(analysis.match_score) }}>
                    {getScoreLabel(analysis.match_score)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state glass-card">
            <div className="empty-icon">📋</div>
            <h3 className="empty-title">No analyses yet</h3>
            <p className="empty-desc">Upload your resume and a job description to get your first AI-powered analysis.</p>
            <Link to="/analyze" className="btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>Start Your First Analysis →</Link>
          </div>
        )}

        <div className="tips-card glass-card">
          <h3 className="tips-title">💡 Pro Tips for a Higher Score</h3>
          <div className="tips-list">
            {[
              'Use keywords from the job description throughout your resume',
              'Quantify achievements (e.g., "Increased efficiency by 30%")',
              'List specific technologies mentioned in the job posting',
              'Tailor your summary/objective for each application',
              'Ensure your skills section is comprehensive and up-to-date',
            ].map((tip, i) => (
              <div key={i} className="tip-item">
                <span className="tip-num">{i + 1}</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
