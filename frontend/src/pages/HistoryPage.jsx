import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './HistoryPage.css';

function ScoreBadge({ score }) {
  const s = parseFloat(score);
  let color, label;
  if (s >= 80) { color = 'var(--color-success)'; label = 'Excellent'; }
  else if (s >= 60) { color = 'var(--color-info)'; label = 'Good'; }
  else if (s >= 40) { color = 'var(--color-warning)'; label = 'Fair'; }
  else { color = 'var(--color-error)'; label = 'Poor'; }

  return (
    <div className="score-badge-group">
      <div className="score-pill" style={{ background: `${color}20`, border: `1px solid ${color}40`, color }}>
        {Math.round(s)}%
      </div>
      <span className="score-label-text" style={{ color }}>{label}</span>
    </div>
  );
}

function HistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const data = await api.analyzer.getHistory();
      setAnalyses(data.results || data);
    } catch (err) {
      setError('Could not load history.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!confirm('Delete this analysis?')) return;
    setDeletingId(id);
    try {
      await api.analyzer.deleteAnalysis(id);
      setAnalyses(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert('Failed to delete. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  if (isLoading) {
    return (
      <div className="history-loading">
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div>
        <p>Loading history...</p>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="container">
        <div className="history-header">
          <div>
            <h1 className="history-title">Analysis History</h1>
            <p className="history-subtitle">{analyses.length} total {analyses.length === 1 ? 'analysis' : 'analyses'}</p>
          </div>
          <Link to="/analyze" className="btn-primary">+ New Analysis</Link>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {analyses.length === 0 ? (
          <div className="history-empty glass-card">
            <div className="empty-icon">📋</div>
            <h3>No analyses yet</h3>
            <p>Start by analyzing your resume against a job description.</p>
            <Link to="/analyze" className="btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>Analyze Now →</Link>
          </div>
        ) : (
          <div className="history-list">
            {analyses.map((analysis) => (
              <Link key={analysis.id} to={`/history/${analysis.id}`} className="history-item glass-card">
                <div className="history-item-left">
                  <div className="history-item-icon">📄</div>
                  <div className="history-item-info">
                    <h3 className="history-item-title">{analysis.job_title || 'Resume Analysis'}</h3>
                    <div className="history-item-meta">
                      {analysis.company_name && <span className="meta-company">🏢 {analysis.company_name}</span>}
                      <span className="meta-date">📅 {formatDate(analysis.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="history-item-right">
                  <ScoreBadge score={analysis.match_score} />
                  <button className="delete-btn" onClick={(e) => handleDelete(analysis.id, e)} disabled={deletingId === analysis.id} title="Delete analysis">
                    {deletingId === analysis.id ? '...' : '🗑'}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function AnalysisDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchAnalysis(); }, [id]);

  const fetchAnalysis = async () => {
    try {
      const data = await api.analyzer.getAnalysis(id);
      setAnalysis(data);
    } catch (err) {
      setError('Analysis not found.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this analysis?')) return;
    try {
      await api.analyzer.deleteAnalysis(id);
      navigate('/history');
    } catch (err) {
      alert('Failed to delete.');
    }
  };

  if (isLoading) return (
    <div className="history-loading">
      <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div>
    </div>
  );

  if (error || !analysis) return (
    <div className="history-page">
      <div className="container">
        <div className="error-banner">{error || 'Analysis not found'}</div>
        <Link to="/history" className="btn-secondary" style={{ marginTop: '16px', display: 'inline-flex' }}>← Back to History</Link>
      </div>
    </div>
  );

  return (
    <div className="history-page">
      <div className="container">
        <div className="detail-nav">
          <Link to="/history" className="back-link">← Back to History</Link>
          <button className="btn-secondary delete-detail-btn" onClick={handleDelete}>🗑 Delete</button>
        </div>

        <div className="detail-header">
          <div>
            <h1 className="detail-title">{analysis.job_title || 'Resume Analysis'}</h1>
            {analysis.company_name && <p className="detail-company">🏢 {analysis.company_name}</p>}
            <p className="detail-date">📅 {new Date(analysis.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <ScoreBadge score={analysis.match_score} />
        </div>

        {analysis.ai_feedback && (
          <div className="detail-card glass-card">
            <h2 className="detail-card-title">🤖 AI Analysis</h2>
            <p className="detail-text">{analysis.ai_feedback}</p>
          </div>
        )}

        <div className="detail-skills-grid">
          <div className="detail-card glass-card">
            <h2 className="detail-card-title">✅ Skills Found ({analysis.skills_found?.length || 0})</h2>
            <div className="skills-tags">
              {analysis.skills_found?.map(s => <span key={s} className="skill-tag found">{s}</span>)}
              {!analysis.skills_found?.length && <p className="no-data">None detected</p>}
            </div>
          </div>
          <div className="detail-card glass-card">
            <h2 className="detail-card-title">❌ Missing Skills ({analysis.missing_skills?.length || 0})</h2>
            <div className="skills-tags">
              {analysis.missing_skills?.map(s => <span key={s} className="skill-tag missing">{s}</span>)}
              {!analysis.missing_skills?.length && <p style={{ color: 'var(--color-success)' }}>🎉 No missing skills!</p>}
            </div>
          </div>
        </div>

        {analysis.strengths?.length > 0 && (
          <div className="detail-card glass-card">
            <h2 className="detail-card-title">💪 Strengths</h2>
            <ul className="detail-list">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="detail-list-item">
                  <span className="detail-icon success">✓</span>{s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.improvement_suggestions?.length > 0 && (
          <div className="detail-card glass-card">
            <h2 className="detail-card-title">🔧 Improvement Suggestions</h2>
            <ul className="detail-list">
              {analysis.improvement_suggestions.map((s, i) => (
                <li key={i} className="detail-list-item">
                  <span className="detail-icon warning">{i + 1}</span>{s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;
