import React, { useState, useEffect } from 'react'

const STEPS = [
    "🔍 Analyzing Target Job Description & Key Requirements...",
    "📄 Extracting Candidate Resume Keywords & Profile...",
    "🧠 Running RAG Semantic Vector Skill-Gap Engine...",
    "🎯 Formulating Customized Technical & Behavioral Questions...",
    "📑 Building 7-Day Interview Preparation Strategy..."
]

const ProductionLoader = ({ title = "Crafting Your Custom AI Strategy" }) => {
    const [ currentStepIndex, setCurrentStepIndex ] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStepIndex(prev => (prev + 1) % STEPS.length)
        }, 2200)
        return () => clearInterval(interval)
    }, [])

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(11, 15, 25, 0.92)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div style={{
                background: 'rgba(17, 24, 39, 0.85)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                boxShadow: '0 0 50px rgba(99, 102, 241, 0.2), 0 20px 30px rgba(0, 0, 0, 0.5)',
                borderRadius: '28px',
                padding: '3.5rem 3rem',
                textAlign: 'center',
                maxWidth: '520px',
                width: '100%'
            }}>

                {/* Animated Glowing Ring Spinner */}
                <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 2rem' }}>
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        border: '3px solid rgba(99, 102, 241, 0.15)',
                        borderTopColor: '#6366f1',
                        borderRightColor: '#a855f7',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <div style={{
                        position: 'absolute',
                        inset: '12px',
                        borderRadius: '50%',
                        border: '3px solid rgba(52, 211, 153, 0.15)',
                        borderBottomColor: '#34d399',
                        animation: 'spin 1.5s linear infinite reverse'
                    }} />
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.2rem'
                    }}>
                        ⚡
                    </div>
                </div>

                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    @keyframes pulseGlow {
                        0%, 100% { opacity: 0.7; }
                        50% { opacity: 1; }
                    }
                `}</style>

                {/* Title */}
                <h2 style={{
                    color: '#f8fafc',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    marginBottom: '0.5rem',
                    letterSpacing: '-0.02em'
                }}>
                    {title}
                </h2>

                <p style={{
                    color: '#94a3b8',
                    fontSize: '0.9rem',
                    marginBottom: '2rem'
                }}>
                    Our AI models are synthesizing your profile against the job market requirements.
                </p>

                {/* Step Indicator Card */}
                <div style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '1rem 1.2rem',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <p style={{
                        color: '#34d399',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        margin: 0,
                        animation: 'pulseGlow 2s ease-in-out infinite'
                    }}>
                        {STEPS[ currentStepIndex ]}
                    </p>
                </div>

                <div style={{
                    marginTop: '1.8rem',
                    display: 'flex',
                    justify: 'center',
                    gap: '0.4rem'
                }}>
                    {STEPS.map((_, idx) => (
                        <div key={idx} style={{
                            width: idx === currentStepIndex ? '24px' : '8px',
                            height: '8px',
                            borderRadius: '4px',
                            background: idx === currentStepIndex ? '#6366f1' : 'rgba(255, 255, 255, 0.15)',
                            transition: 'all 0.4s ease'
                        }} />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ProductionLoader
