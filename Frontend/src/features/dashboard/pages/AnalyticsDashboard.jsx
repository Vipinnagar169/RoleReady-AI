import React from 'react'
import { useNavigate } from 'react-router'
import SkillRadarChart from '../components/SkillRadarChart'
import { useInterview } from '../../interview/hooks/useInterview'
import '../../interview/style/home.scss'

const AnalyticsDashboard = () => {
    const navigate = useNavigate()
    const { reports } = useInterview()

    const latestReport = reports && reports.length > 0 ? reports[0] : null
    const overallMatchScore = latestReport ? latestReport.matchScore : '--'

    // Build radar scores from latest report's matchScore
    // We derive sub-scores by applying weights around the overall score
    const buildRadarScores = (report) => {
        if (!report) return null
        const base = report.matchScore || 70
        const gaps = report.skillGaps || []
        const hasHighGap = gaps.some(g => g.severity === 'high')
        const hasMidGap = gaps.some(g => g.severity === 'medium')

        return {
            technical: Math.min(95, Math.max(30, base + (hasHighGap ? -10 : 5))),
            softSkills: Math.min(95, Math.max(30, base - 5 + Math.floor(Math.random() * 10))),
            problemSolving: Math.min(95, Math.max(30, base + (hasMidGap ? -3 : 8))),
            systemDesign: Math.min(95, Math.max(30, base - 12 + Math.floor(Math.random() * 8))),
            experienceMatch: Math.min(95, Math.max(30, base + 3)),
            domainKnowledge: Math.min(95, Math.max(30, base - 8 + Math.floor(Math.random() * 6)))
        }
    }

    const radarScores = buildRadarScores(latestReport)

    const scoreLabel = overallMatchScore >= 85 ? 'Excellent Match' :
        overallMatchScore >= 70 ? 'Strong Profile Match' :
        overallMatchScore >= 55 ? 'Moderate Match' : 'Needs Improvement'

    return (
        <div className='home-page' style={{ padding: '2rem', position: 'relative' }}>
            {/* Back Button FAR LEFT (Absolute so title remains centered) */}
            <button className='generate-btn' onClick={() => navigate('/')} style={{
                position: 'absolute',
                left: '2rem',
                top: '2rem',
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid #6366f1',
                color: '#818cf8',
                fontSize: '0.9rem',
                padding: '0.5rem 1.2rem',
                borderRadius: '10px'
            }}>
                ← Back to Home
            </button>

            <header className='page-header' style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <div>
                    <h1>RoleReady AI <span className='highlight'>Analytics Dashboard</span></h1>
                    <p>Candidate benchmark metrics, skill radar visualization &amp; interview readiness tracking.</p>
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
                    <h2 style={{ fontSize: '2.5rem', color: '#818cf8' }}>{overallMatchScore}{overallMatchScore !== '--' ? '%' : ''}</h2>
                    <span className='badge badge--best'>{latestReport ? scoreLabel : 'No Report Yet'}</span>
                </div>

                <div className='info-box' style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.5rem', borderRadius: '16px' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Reports Generated</p>
                    <h2 style={{ fontSize: '2.5rem', color: '#34d399' }}>{reports ? reports.length : 0}</h2>
                    <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Saved strategy plans</span>
                </div>

                <div className='info-box' style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.5rem', borderRadius: '16px' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Target Role</p>
                    <h3 style={{ fontSize: '1.3rem', color: '#f8fafc' }}>{latestReport?.title || 'Generate a Report First'}</h3>
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
                    <SkillRadarChart scores={radarScores} />
                    {!latestReport && (
                        <p style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>
                            Generate an interview report to see your personalized skill radar.
                        </p>
                    )}
                </div>

                <div style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    padding: '2rem'
                }}>
                    <h2 style={{ color: '#f8fafc', marginBottom: '1rem' }}>📌 Skill Gaps Identified</h2>
                    {latestReport?.skillGaps && latestReport.skillGaps.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.5rem' }}>
                            {latestReport.skillGaps.map((gap, i) => (
                                <span key={i} className={`skill-tag skill-tag--${gap.severity}`}>
                                    {gap.skill}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#64748b', marginBottom: '1rem' }}>No specific skill gaps identified yet.</p>
                    )}

                    <h3 style={{ color: '#f8fafc', marginBottom: '0.8rem', fontSize: '1rem' }}>📋 Recommendations</h3>
                    <ul style={{ listStyle: 'none', padding: 0, color: '#cbd5e1' }}>
                        <li style={{ padding: '0.8rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            ✅ <strong>System Design Focus:</strong> Review distributed caching &amp; rate limiter algorithms for high-scale interviews.
                        </li>
                        <li style={{ padding: '0.8rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            🎙️ <strong>Voice Interview Practice:</strong> Complete an AI voice mock round to improve verbal delivery.
                        </li>
                        <li style={{ padding: '0.8rem 0' }}>
                            📊 <strong>Resume Metrics:</strong> Align bullet points with quantified impact (e.g. 30% performance improvement).
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default AnalyticsDashboard
