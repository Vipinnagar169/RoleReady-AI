import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import '../../interview/style/home.scss'

const LiveResumeBuilder = () => {
    const navigate = useNavigate()

    const [ fullName, setFullName ] = useState('Vipin Nagar')
    const [ jobTitle, setJobTitle ] = useState('Full Stack AI Developer')
    const [ summary, setSummary ] = useState('Passionate engineer with experience building scalable Node.js microservices, React web apps, and AI GenAI integrations.')
    const [ skills, setSkills ] = useState('React.js, Node.js, Express, MongoDB, Google Gemini API, TailwindCSS, TypeScript')
    const [ experience, setExperience ] = useState('Full Stack Developer at Tech Corp (2024-Present)\n- Built AI-driven SaaS tools using Express.js and Google Gemini SDK.\n- Optimized MongoDB queries reducing API response time by 40%.')

    const [ selectedFileName, setSelectedFileName ] = useState(null)
    const [ selectedFileSize, setSelectedFileSize ] = useState(null)
    const fileInputRef = useRef()

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedFileName(file.name)
            setSelectedFileSize((file.size / (1024 * 1024)).toFixed(2))
        }
    }

    const removeSelectedFile = () => {
        setSelectedFileName(null)
        setSelectedFileSize(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handlePrintPdf = () => {
        window.print()
    }

    return (
        <div className='home-page' style={{ padding: '2rem' }}>
            <header className='page-header' style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>📄 Live ATS <span className='highlight'>Resume Optimizer & Builder</span></h1>
                        <p>Real-time WYSIWYG preview, PDF upload parser & 1-Click ATS Export.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className='generate-btn' onClick={handlePrintPdf}>
                            📥 1-Click Export ATS PDF
                        </button>
                        <button className='generate-btn' style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => navigate('/')}>
                            ← Back to Home
                        </button>
                    </div>
                </div>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '2rem'
            }}>
                {/* Editor Panel */}
                <div style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '24px',
                    padding: '2rem'
                }}>
                    <h2 style={{ color: '#f8fafc', marginBottom: '1.5rem' }}>✏️ Resume Details</h2>

                    {/* PDF Selector Badge */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className='section-label'>Upload Resume for ATS Parsing:</label>
                        {!selectedFileName ? (
                            <label className='dropzone' htmlFor='builderResume'>
                                <p className='dropzone__title'>Click to select PDF Resume</p>
                                <input ref={fileInputRef} onChange={handleFileChange} hidden type='file' id='builderResume' accept='.pdf' />
                            </label>
                        ) : (
                            <div style={{
                                background: 'rgba(52, 211, 153, 0.15)',
                                border: '1px solid #34d399',
                                padding: '1rem',
                                borderRadius: '12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <p style={{ color: '#34d399', fontWeight: 'bold' }}>📄 {selectedFileName}</p>
                                    <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{selectedFileSize} MB • Ready for AI optimization</p>
                                </div>
                                <button onClick={removeSelectedFile} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label className='section-label'>Full Name</label>
                            <input className='panel__textarea' style={{ minHeight: '45px' }} value={fullName} onChange={e => setFullName(e.target.value)} />
                        </div>

                        <div>
                            <label className='section-label'>Target Job Title</label>
                            <input className='panel__textarea' style={{ minHeight: '45px' }} value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
                        </div>

                        <div>
                            <label className='section-label'>Professional Summary</label>
                            <textarea className='panel__textarea' style={{ minHeight: '80px' }} value={summary} onChange={e => setSummary(e.target.value)} />
                        </div>

                        <div>
                            <label className='section-label'>Technical Skills (Comma Separated)</label>
                            <input className='panel__textarea' style={{ minHeight: '45px' }} value={skills} onChange={e => setSkills(e.target.value)} />
                        </div>

                        <div>
                            <label className='section-label'>Work Experience & Accomplishments</label>
                            <textarea className='panel__textarea' style={{ minHeight: '120px' }} value={experience} onChange={e => setExperience(e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Live WYSIWYG ATS Preview */}
                <div style={{
                    background: '#ffffff',
                    color: '#0f172a',
                    borderRadius: '24px',
                    padding: '2.5rem',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
                    fontFamily: 'Inter, Arial, sans-serif'
                }}>
                    <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                        <h1 style={{ fontSize: '2.2rem', margin: 0, color: '#0f172a' }}>{fullName}</h1>
                        <h3 style={{ fontSize: '1.1rem', color: '#475569', margin: '0.3rem 0 0 0' }}>{jobTitle}</h3>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ textTransform: 'uppercase', letterSpacing: '1px', color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.3rem' }}>Professional Summary</h4>
                        <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#334155' }}>{summary}</p>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ textTransform: 'uppercase', letterSpacing: '1px', color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.3rem' }}>Core Technical Skills</h4>
                        <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#334155', fontWeight: '500' }}>{skills}</p>
                    </div>

                    <div>
                        <h4 style={{ textTransform: 'uppercase', letterSpacing: '1px', color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.3rem' }}>Work Experience</h4>
                        <pre style={{ fontFamily: 'inherit', fontSize: '0.95rem', lineHeight: '1.6', color: '#334155', whitespace: 'pre-wrap' }}>{experience}</pre>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LiveResumeBuilder
