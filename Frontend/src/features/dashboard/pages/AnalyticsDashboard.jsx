import React from 'react'
import { useNavigate } from 'react-router'
import SkillRadarChart from '../components/SkillRadarChart'
import { useInterview } from '../../interview/hooks/useInterview'
import '../../interview/style/home.scss'

const AnalyticsDashboard = () => {
    const navigate = useNavigate()
    const { reports } = useInterview()

    const latestReport = reports && reports.length > 0 ? reports[0] : null
    const overallMatchScore = latestReport ? latestReport.matchScore : 84

    return (
        <div className='home-page' style={{ padding: '2rem' }}>
            <header className='page-header' style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>RoleReady AI <span className='highlight'>Analytics Dashboard</span></h1>
                        <p>Candidate benchmark metrics, skill radar visualization & interview readiness tracking.</p>
                    </div>
                    <button className='generate-btn' onClick={() => navigate('/')}>
                        ← Back to Home
                    </button>
                </div>
            </header>

            {/* Metrics Overview Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <div className='info-box' style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.5rem', borderRadius: '16px' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Overall Job Readiness</p>
                    <h2 style={{ fontSize: '2.5rem', color: '#818cf8' }}>{overallMatchScore}%</h2>
                    <span className='badge badge--best'>Strong Profile Match</span>
                </div>

                <div className='info-box' style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.5rem', borderRadius: '16px' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Reports Generated</p>
                    <h2 style={{ fontSize: '2.5rem', color: '#34d399' }}>{reports ? reports.length : 1}</h2>
                    <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Saved strategy plans</span>
                </div>

                <div className='info-box' style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.5rem', borderRadius: '16px' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Target Role</p>
                    <h3 style={{ fontSize: '1.3rem', color: '#f8fafc' }}>{latestReport?.title || 'Senior Software Engineer'}</h3>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>AI RAG Analyzed</span>
                </div>
            </div>

            {/* Radar Chart & Skill Gaps Split Section */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
                marginBottom: '2rem'
            }}>
                <div style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    padding: '2rem'
                }}>
                    <h2 style={{ color: '#f8fafc', marginBottom: '1.5rem' }}>🧠 Skill Competency Radar</h2>
                    <SkillRadarChart />
                </div>

                <div style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    padding: '2rem'
                }}>
                    <h2 style={{ color: '#f8fafc', marginBottom: '1rem' }}>📌 Recommendations & Action Items</h2>
                    <ul style={{ listStyle: 'none', padding: 0, color: '#cbd5e1' }}>
                        <li style={{ padding: '0.8rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            ✅ <strong>System Design Focus:</strong> Review distributed caching & rate limiter algorithms for high-scale interviews.
                        </li>
                        <li style={{ padding: '0.8rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            🎙️ <strong>Voice Interview Practice:</strong> Complete a 4-turn AI voice mock round to improve verbal delivery.
                        </li>
                        <li style={{ padding: '0.8rem 0' }}>
                            📄 <strong>ATS Optimization:</strong> Align resume bullet points with quantified impact metrics (e.g. % performance gain).
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default AnalyticsDashboard
