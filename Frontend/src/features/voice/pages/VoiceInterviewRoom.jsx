import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import axios from 'axios'
import '../../interview/style/home.scss'

const api = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true
})

const VoiceInterviewRoom = () => {
    const navigate = useNavigate()

    const [ isSessionActive, setIsSessionActive ] = useState(false)
    const [ isListening, setIsListening ] = useState(false)
    const [ isSpeaking, setIsSpeaking ] = useState(false)

    const [ currentQuestion, setCurrentQuestion ] = useState('')
    const [ questionNumber, setQuestionNumber ] = useState(1)
    const [ candidateAnswer, setCandidateAnswer ] = useState('')
    const [ history, setHistory ] = useState([])

    const [ loading, setLoading ] = useState(false)
    const [ feedback, setFeedback ] = useState(null)
    const [ sessionFinished, setSessionFinished ] = useState(false)

    const recognitionRef = useRef(null)
    const isListeningRef = useRef(false)
    const accumulatedTextRef = useRef('')
    const candidateAnswerRef = useRef('')

    const updateAnswer = (text) => {
        candidateAnswerRef.current = text
        accumulatedTextRef.current = text
        setCandidateAnswer(text)
    }

    const resetAnswer = () => {
        candidateAnswerRef.current = ''
        accumulatedTextRef.current = ''
        setCandidateAnswer('')
    }

    // Clean, robust SpeechRecognition initialization
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition()
            recognition.continuous = true
            recognition.interimResults = true
            recognition.lang = 'en-US'

            recognition.onstart = () => {
                console.log("[Voice] Mic recording started")
                setIsListening(true)
                isListeningRef.current = true
            }

            recognition.onresult = (event) => {
                let currentSessionText = ''
                for (let i = 0; i < event.results.length; i++) {
                    currentSessionText += event.results[i][0].transcript
                }
                const prefix = accumulatedTextRef.current ? accumulatedTextRef.current.trim() + ' ' : ''
                const fullText = (prefix + currentSessionText).trim()
                candidateAnswerRef.current = fullText
                setCandidateAnswer(fullText)
            }

            recognition.onerror = (err) => {
                console.error("[Voice] Speech Recognition Error:", err.error)
                if (err.error === 'not-allowed' || err.error === 'service-not-allowed') {
                    alert("Microphone access denied. Please allow microphone permissions in browser settings.")
                    isListeningRef.current = false
                    setIsListening(false)
                }
            }

            recognition.onend = () => {
                console.log("[Voice] Speech recognition paused")
                // Save what was spoken so far into accumulatedTextRef
                accumulatedTextRef.current = candidateAnswerRef.current

                // Auto-restart if user hasn't explicitly stopped recording
                if (isListeningRef.current) {
                    try {
                        recognition.start()
                    } catch (e) {
                        console.log("[Voice] Auto-restart error:", e)
                    }
                } else {
                    setIsListening(false)
                }
            }

            recognitionRef.current = recognition
        } else {
            console.warn("[Voice] Web Speech API not supported in this browser.")
        }

        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel()
            }
            if (recognitionRef.current) {
                isListeningRef.current = false
                try {
                    recognitionRef.current.stop()
                } catch (e) {}
            }
        }
    }, [])

    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel()
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.rate = 1.0
            utterance.pitch = 1.0
            utterance.onstart = () => setIsSpeaking(true)
            utterance.onend = () => setIsSpeaking(false)
            utterance.onerror = () => setIsSpeaking(false)
            window.speechSynthesis.speak(utterance)
        }
    }

    const stopSpeaking = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel()
            setIsSpeaking(false)
        }
    }

    const toggleAudio = () => {
        if (isSpeaking) {
            stopSpeaking()
        } else {
            speakText(currentQuestion)
        }
    }

    const startInterview = async () => {
        setLoading(true)
        try {
            const res = await api.post('/api/voice/start', {
                jobTitle: 'Senior Software Engineer',
                interviewType: 'technical'
            })
            setCurrentQuestion(res.data.question)
            setQuestionNumber(1)
            setIsSessionActive(true)
            setSessionFinished(false)
            setHistory([])
            setFeedback(null)
            resetAnswer()
            speakText(res.data.question)
        } catch (err) {
            console.error(err)
            alert("Could not start voice session. Check server connection.")
        } finally {
            setLoading(false)
        }
    }

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.")
            return
        }

        stopSpeaking()

        if (isListeningRef.current) {
            isListeningRef.current = false
            try {
                recognitionRef.current.stop()
            } catch (e) {}
            setIsListening(false)
        } else {
            accumulatedTextRef.current = candidateAnswerRef.current
            isListeningRef.current = true
            setIsListening(true)
            try {
                recognitionRef.current.start()
            } catch (e) {
                console.log("[Voice] Start error:", e)
            }
        }
    }

    const submitAnswer = async () => {
        const textToSubmit = candidateAnswerRef.current.trim() || candidateAnswer.trim()
        if (!textToSubmit) {
            alert("Please speak your answer first or type it into the box before submitting.")
            return
        }

        stopSpeaking()

        if (isListeningRef.current && recognitionRef.current) {
            isListeningRef.current = false
            try {
                recognitionRef.current.stop()
            } catch (e) {}
            setIsListening(false)
        }

        setLoading(true)
        try {
            const res = await api.post('/api/voice/answer', {
                question: currentQuestion,
                currentQuestion: currentQuestion,
                candidateAnswer: textToSubmit,
                questionNumber
            })

            setFeedback(res.data)
            setHistory(prev => [ ...prev, {
                question: currentQuestion,
                answer: textToSubmit,
                feedback: res.data.feedback
            } ])

            if (res.data.isFinished) {
                setSessionFinished(true)
                setIsSessionActive(false)
                speakText("Interview complete! Great job.")
            } else {
                setQuestionNumber(prev => prev + 1)
                setCurrentQuestion(res.data.nextQuestion)
                resetAnswer()
                speakText(res.data.nextQuestion)
            }
        } catch (err) {
            console.error("Voice submit error:", err)
            alert(err.response?.data?.message || "Failed to evaluate answer. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleBackToHome = () => {
        stopSpeaking()
        if (recognitionRef.current) {
            isListeningRef.current = false
            try { recognitionRef.current.stop() } catch (e) {}
        }
        navigate('/')
    }

    return (
        <div className='home-page' style={{ padding: '1.5rem 2rem', position: 'relative' }}>
            {/* Top Extreme Left Navigation (Absolute so title remains perfectly centered) */}
            <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'flex-start', marginBottom: '1.5rem' }}>
                <button
                    onClick={handleBackToHome}
                    className='generate-btn'
                    style={{
                        position: 'absolute',
                        left: '2rem',
                        top: '1.5rem',
                        background: 'rgba(99,102,241,0.15)',
                        border: '1px solid #6366f1',
                        color: '#818cf8',
                        fontSize: '0.9rem',
                        padding: '0.5rem 1.2rem',
                        borderRadius: '10px'
                    }}
                >
                    ← Back to Home
                </button>
            </div>

            <header className='page-header' style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1>🎙️ RoleReady <span className='highlight'>AI Voice Mock Interviewer</span></h1>
                <p>Real-time Speech-to-Text, Voice synthesis, dynamic AI questions &amp; instant scoring.</p>
            </header>

            {!isSessionActive && !sessionFinished && (
                <div style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '24px',
                    padding: '3rem',
                    textAlign: 'center',
                    maxWidth: '650px',
                    margin: '0 auto'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎙️</div>
                    <h2 style={{ color: '#f8fafc', marginBottom: '1rem' }}>Ready for your AI Voice Interview?</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
                        The AI interviewer will ask technical &amp; behavioral questions out loud. Click microphone to record your voice response!
                    </p>
                    <button onClick={startInterview} disabled={loading} className='generate-btn' style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                        {loading ? 'Starting Session...' : 'Start Voice Interview Now'}
                    </button>
                </div>
            )}

            {isSessionActive && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '2rem'
                }}>
                    {/* Live Voice Room Box */}
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '24px',
                        padding: '2rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <span className='badge badge--best'>Question {questionNumber} of 4</span>
                            <span style={{ color: isSpeaking ? '#34d399' : isListening ? '#ef4444' : '#94a3b8', fontWeight: 'bold' }}>
                                {isSpeaking ? '🔊 AI Speaking...' : isListening ? '🔴 Recording Mic Live...' : '🎧 Ready to Listen'}
                            </span>
                        </div>

                        <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
                            <h3 style={{ color: '#818cf8', fontSize: '1.2rem', marginBottom: '0.5rem' }}>AI Interviewer:</h3>
                            <p style={{ color: '#f8fafc', fontSize: '1.1rem', lineHeight: '1.6' }}>"{currentQuestion}"</p>
                            <button
                                onClick={toggleAudio}
                                style={{
                                    background: isSpeaking ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                                    border: isSpeaking ? '1px solid #ef4444' : '1px solid #6366f1',
                                    color: isSpeaking ? '#ef4444' : '#818cf8',
                                    padding: '0.4rem 0.9rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    marginTop: '0.8rem',
                                    fontSize: '0.85rem'
                                }}
                            >
                                {isSpeaking ? '⏹️ Stop Audio' : '🔊 Play Question'}
                            </button>
                        </div>

                        {/* Spoken Answer Live Box */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className='section-label'>
                                Your Spoken Transcript (Live or Edit):
                                {isListening && <span style={{ color: '#ef4444', marginLeft: '8px', fontSize: '0.8rem' }}>🎙️ Listening... speak now</span>}
                            </label>
                            <textarea
                                value={candidateAnswer}
                                onChange={(e) => updateAnswer(e.target.value)}
                                className='panel__textarea'
                                placeholder="Click 'Start Speaking' below and speak your answer..."
                                style={{ minHeight: '120px' }}
                            />
                        </div>

                        {/* Controls */}
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={toggleListening}
                                className='generate-btn'
                                style={{
                                    flex: 1,
                                    background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                                    border: isListening ? '1px solid #ef4444' : '1px solid #6366f1',
                                    color: isListening ? '#ef4444' : '#818cf8'
                                }}
                            >
                                {isListening ? '🛑 Stop Recording' : '🎙️ Start Speaking'}
                            </button>

                            <button
                                onClick={submitAnswer}
                                disabled={loading || !candidateAnswer.trim()}
                                className='generate-btn'
                                style={{ flex: 1 }}
                            >
                                {loading ? 'Evaluating...' : 'Submit Answer ➔'}
                            </button>
                        </div>
                    </div>

                    {/* Feedback Side Panel */}
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '24px',
                        padding: '2rem'
                    }}>
                        <h3 style={{ color: '#f8fafc', marginBottom: '1rem' }}>💡 Instant AI Feedback</h3>
                        {feedback ? (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: feedback.score >= 70 ? '#34d399' : '#f43f5e' }}>
                                        {feedback.score}/100
                                    </span>
                                    <span className='badge badge--best'>{feedback.score >= 70 ? 'Strong Answer' : 'Needs Polish'}</span>
                                </div>
                                <p style={{ color: '#cbd5e1', lineHeight: '1.6', marginBottom: '1rem' }}>{feedback.feedback}</p>
                                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>Confidence Rating: <strong style={{ color: '#818cf8' }}>{feedback.confidenceRating || 'High'}</strong></p>
                            </div>
                        ) : (
                            <p style={{ color: '#64748b' }}>Submit an answer to receive live AI scoring and constructive feedback.</p>
                        )}
                    </div>
                </div>
            )}

            {sessionFinished && (
                <div style={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(52, 211, 153, 0.3)',
                    borderRadius: '24px',
                    padding: '3rem',
                    textAlign: 'center',
                    maxWidth: '650px',
                    margin: '0 auto'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                    <h2 style={{ color: '#f8fafc', marginBottom: '1rem' }}>Voice Interview Completed!</h2>
                    <p style={{ color: '#cbd5e1', marginBottom: '2rem' }}>
                        You completed all 4 mock questions. Start a new round to practice more questions!
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button onClick={startInterview} className='generate-btn'>
                            🔄 Start New Voice Round
                        </button>
                        <button onClick={() => navigate('/dashboard')} className='generate-btn' style={{ background: 'rgba(244, 63, 94, 0.2)', border: '1px solid #f43f5e' }}>
                            📊 View Analytics
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default VoiceInterviewRoom
