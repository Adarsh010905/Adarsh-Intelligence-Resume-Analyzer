import { useState, useRef } from 'react';
import api from '../services/api';
import './AnalyzePage.css';

function ScoreArc({ score }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return '#10b981';
    if (s >= 60) return '#3b82f6';
    if (s >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getLabel = (s) => {
    if (s >= 80) return 'Excellent Match';
    if (s >= 60) return 'Good Match';
    if (s >= 40) return 'Fair Match';
    return 'Poor Match';
  };

  const color = getColor(score);

  return (
    <div className="score-arc-container">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12"/>
        <circle cx="100" cy="100" r={radius} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 100 100)" style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease' }}/>
        <text x="100" y="95" textAnchor="middle" fill="white" fontSize="32" fontWeight="800" fontFamily="Outfit, sans-serif">{Math.round(score)}%</text>
        <text x="100" y="120" textAnchor="middle" fill={color} fontSize="12" fontWeight="600">Match Score</text>
      </svg>
      <div className="score-label" style={{ color }}>{getLabel(score)}</div>
    </div>
  );
}

function SkillTag({ skill, type }) {
  const colors = {
    found: { bg: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: 'rgba(16,185,129,0.25)' },
    missing: { bg: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'rgba(239,68,68,0.25)' },
    keyword: { bg: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', border: 'rgba(139,92,246,0.25)' },
  };
  const c = colors[type] || colors.keyword;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: c.bg, color: c.color, border: `1px solid ${c.border}`, margin: '3px' }}>
      {type === 'found' ? '✓ ' : type === 'missing' ? '✗ ' : '# '}{skill}
    </span>
  );
}

function ScoreBar({ label, value, color }) {
  return (
    <div className="score-bar-item">
      <div className="score-bar-header">
        <span className="score-bar-label">{label}</span>
        <span className="score-bar-value" style={{ color }}>{Math.round(value)}%</span>
      </div>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${Math.min(value, 100)}%`, background: color }}></div>
      </div>
    </div>
  );
}

function AnalyzePage() {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [inputMethod, setInputMethod] = useState('file');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.pdf')) { setError('Please upload a PDF file only.'); return; }
      if (file.size > 10 * 1024 * 1024) { setError('File size must be under 10MB.'); return; }
      setResumeFile(file);
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') { setResumeFile(file); setError(''); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (inputMethod === 'file' && !resumeFile) { setError('Please upload a PDF resume file.'); return; }
    if (inputMethod === 'text' && resumeText.trim().length < 100) { setError('Resume text must be at least 100 characters.'); return; }
    if (!jobDescription.trim()) { setError('Please paste a job description.'); return; }

    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      if (inputMethod === 'file' && resumeFile) formData.append('resume_file', resumeFile);
      else formData.append('resume_text', resumeText);
      formData.append('job_description', jobDescription);
      if (jobTitle) formData.append('job_title', jobTitle);
      if (companyName) formData.append('company_name', companyName);

      const data = await api.analyzer.analyze(formData);
      setResult(data);
      setActiveTab('overview');
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="analyze-page">
      <div className="container">
        <div className="analyze-header">
          <h1 className="analyze-title">
            <span className="gradient-text">AI Resume Analyzer</span>
          </h1>
          <p className="analyze-subtitle">
            Upload your resume and paste a job description to get an instant AI-powered match score and improvement suggestions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="analyze-form glass-card">
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Job Title (Optional)</label>
              <input type="text" className="form-input" placeholder="e.g., Senior Python Developer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Company Name (Optional)</label>
              <input type="text" className="form-input" placeholder="e.g., Google, Microsoft" value={companyName} onChange={e => setCompanyName(e.target.value)} />
            </div>
          </div>

          <div className="input-toggle">
            <button type="button" className={`toggle-btn ${inputMethod === 'file' ? 'active' : ''}`} onClick={() => setInputMethod('file')}>📄 Upload PDF</button>
            <button type="button" className={`toggle-btn ${inputMethod === 'text' ? 'active' : ''}`} onClick={() => setInputMethod('text')}>✏️ Paste Text</button>
          </div>

          <div className="input-panels">
            <div className="input-panel">
              <label className="form-label">Your Resume</label>
              {inputMethod === 'file' ? (
                <div className={`file-drop-zone ${resumeFile ? 'has-file' : ''}`} onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => fileInputRef.current?.click()}>
                  <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} style={{ display: 'none' }} id="resume-file" />
                  {resumeFile ? (
                    <div className="file-selected">
                      <span className="file-icon">📄</span>
                      <span className="file-name">{resumeFile.name}</span>
                      <span className="file-size">{(resumeFile.size / 1024).toFixed(0)} KB</span>
                      <button type="button" className="file-remove" onClick={e => { e.stopPropagation(); setResumeFile(null); }}>✕</button>
                    </div>
                  ) : (
                    <div className="file-placeholder">
                      <div className="file-upload-icon">☁️</div>
                      <p className="file-hint"><strong>Click to upload</strong> or drag & drop</p>
                      <p className="file-sub">PDF only • Max 10MB</p>
                    </div>
                  )}
                </div>
              ) : (
                <textarea className="form-input text-area" placeholder="Paste your resume text here..." value={resumeText} onChange={e => setResumeText(e.target.value)} rows={12} />
              )}
            </div>

            <div className="input-panel">
              <label className="form-label">Job Description <span style={{ color: 'var(--color-error)' }}>*</span></label>
              <textarea className="form-input text-area" placeholder="Paste the full job description here..." value={jobDescription} onChange={e => setJobDescription(e.target.value)} rows={12} required />
            </div>
          </div>

          {error && <div className="analyze-error"><span>⚠</span> {error}</div>}

          <button type="submit" className="btn-primary analyze-submit" disabled={isLoading}>
            {isLoading ? (<><div className="spinner"></div>Analyzing with AI... (this may take 10-30 seconds)</>) : '🚀 Analyze My Resume'}
          </button>
        </form>

        {isLoading && (
          <div className="analyzing-state glass-card" ref={resultsRef}>
            <div className="analyzing-animation">
              <div className="pulse-ring"></div>
              <span className="analyzing-icon">🤖</span>
            </div>
            <h3>AI is analyzing your resume...</h3>
            <p>Extracting skills → Calculating similarity → Generating feedback</p>
          </div>
        )}

        {result && !isLoading && (
          <div className="results-section" ref={resultsRef}>
            <h2 className="results-heading">
              Analysis Results
              {result.job_title && <span className="results-job"> — {result.job_title}</span>}
            </h2>

            <div className="results-hero glass-card">
              <ScoreArc score={parseFloat(result.match_score)} />
              <div className="results-hero-details">
                <div className="score-breakdown">
                  <h3 className="breakdown-title">Score Breakdown</h3>
                  {result.score_breakdown && (
                    <>
                      <ScoreBar label="Overall Match" value={result.score_breakdown.overall} color="#8b5cf6" />
                      <ScoreBar label="Semantic Similarity" value={result.score_breakdown.semantic_similarity} color="#3b82f6" />
                      <ScoreBar label="Skill Coverage" value={result.score_breakdown.skill_coverage} color="#10b981" />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="results-tabs">
              {['overview', 'skills', 'feedback', 'suggestions'].map(tab => (
                <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="tab-content">
              {activeTab === 'overview' && (
                <div className="animate-fade-in">
                  <div className="feedback-card glass-card">
                    <h3 className="card-title">🤖 AI Feedback</h3>
                    <p className="feedback-text">{result.ai_feedback}</p>
                  </div>
                  {result.interview_tips && (
                    <div className="feedback-card glass-card">
                      <h3 className="card-title">🎯 Interview Tips</h3>
                      <p className="feedback-text">{result.interview_tips}</p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'skills' && (
                <div className="skills-section animate-fade-in">
                  <div className="glass-card skill-panel">
                    <h3 className="card-title">✅ Skills Found in Your Resume ({result.skills_found?.length || 0})</h3>
                    <div className="skills-cloud">
                      {result.skills_found?.map(s => <SkillTag key={s} skill={s} type="found" />)}
                      {!result.skills_found?.length && <p style={{ color: 'var(--color-text-muted)' }}>No specific tech skills detected</p>}
                    </div>
                  </div>
                  <div className="glass-card skill-panel">
                    <h3 className="card-title">❌ Missing Skills ({result.missing_skills?.length || 0})</h3>
                    <div className="skills-cloud">
                      {result.missing_skills?.map(s => <SkillTag key={s} skill={s} type="missing" />)}
                      {!result.missing_skills?.length && <p style={{ color: 'var(--color-success)' }}>🎉 No missing skills!</p>}
                    </div>
                    {result.missing_skills_advice && <p className="skills-advice">{result.missing_skills_advice}</p>}
                  </div>
                  <div className="glass-card skill-panel">
                    <h3 className="card-title"># Matched Keywords ({result.keywords_matched?.length || 0})</h3>
                    <div className="skills-cloud">
                      {result.keywords_matched?.map(s => <SkillTag key={s} skill={s} type="keyword" />)}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'feedback' && (
                <div className="animate-fade-in">
                  <div className="glass-card skill-panel">
                    <h3 className="card-title">💪 Strengths</h3>
                    <ul className="feedback-list">
                      {result.strengths?.map((s, i) => (
                        <li key={i} className="feedback-list-item">
                          <span className="list-icon success">✓</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {result.formatting_tips && (
                    <div className="glass-card skill-panel">
                      <h3 className="card-title">🎨 Formatting Tips</h3>
                      <p className="feedback-text">{result.formatting_tips}</p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'suggestions' && (
                <div className="glass-card skill-panel animate-fade-in">
                  <h3 className="card-title">🔧 Improvement Suggestions</h3>
                  <ul className="feedback-list">
                    {result.improvement_suggestions?.map((s, i) => (
                      <li key={i} className="feedback-list-item">
                        <span className="list-icon warning">{i + 1}</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyzePage;
