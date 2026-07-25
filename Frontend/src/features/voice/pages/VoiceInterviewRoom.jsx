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

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition()
            recognition.continuous = true
            recognition.interimResults = true
            recognition.lang = 'en-US'

            recognition.onresult = (event) => {
                let transcript = ''
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[ i ][ 0 ].transcript
                }
                setCandidateAnswer(transcript)
            }

            recognition.onerror = (err) => {
                console.error("Speech Recognition Error:", err)
                setIsListening(false)
            }

            recognition.onend = () => {
                setIsListening(false)
            }

            recognitionRef.current = recognition
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
            alert("Speech recognition is not supported in this browser. Please use Google Chrome or Edge.")
            return
        }

        if (isListening) {
            recognitionRef.current.stop()
            setIsListening(false)
        } else {
            setCandidateAnswer('')
            recognitionRef.current.start()
            setIsListening(true)
        }
    }

    const submitAnswer = async () => {
        if (!candidateAnswer.trim()) {
            alert("Please speak your answer first or type in your transcript.")
            return
        }

        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop()
            setIsListening(false)
        }

        setLoading(true)
        try {
            const res = await api.post('/api/voice/turn', {
                question: currentQuestion,
                candidateAnswer,
                questionNumber,
                jobTitle: 'Senior Software Engineer'
            })

            const newHistoryItem = {
                qNum: questionNumber,
                question: currentQuestion,
                answer: candidateAnswer,
                score: res.data.score,
                feedback: res.data.feedback,
                confidence: res.data.confidenceRating
            }

            setHistory(prev => [ ...prev, newHistoryItem ])
            setFeedback(res.data)

            if (res.data.isFinished) {
                setSessionFinished(true)
                setIsSessionActive(false)
                speakText("Interview complete! Great job.")
            } else {
                setQuestionNumber(prev => prev + 1)
                setCurrentQuestion(res.data.nextQuestion)
                setCandidateAnswer('')
                speakText(res.data.nextQuestion)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='home-page' style={{ padding: '2rem' }}>
            <header className='page-header' style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>🎙️ RoleReady <span className='highlight'>AI Voice Mock Interviewer</span></h1>
                        <p>Real-time Speech-to-Text, Voice synthesis, dynamic AI questions & instant scoring.</p>
                    </div>
                    <button className='generate-btn' onClick={() => navigate('/')}>
                        ← Back to Home
                    </button>
                </div>
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
                        The AI interviewer will ask technical & behavioral questions out loud. Click microphone to record your voice response!
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
                            <span style={{ color: isSpeaking ? '#34d399' : '#94a3b8' }}>
                                {isSpeaking ? '🔊 AI Speaking...' : '🎧 Listening Mode'}
                            </span>
                        </div>

                        <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
                            <h3 style={{ color: '#818cf8', fontSize: '1.2rem', marginBottom: '0.5rem' }}>AI Interviewer:</h3>
                            <p style={{ color: '#f8fafc', fontSize: '1.1rem', lineHeight: '1.6' }}>"{currentQuestion}"</p>
                            <button
                                onClick={() => speakText(currentQuestion)}
                                style={{ background: 'transparent', border: 'none', color: '#6366f1', cursor: 'pointer', marginTop: '0.8rem' }}
                            >
                                🔊 Replay Question
                            </button>
                        </div>

                        {/* Spoken Answer Live Box */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className='section-label'>Your Spoken Transcript:</label>
                            <textarea
                                value={candidateAnswer}
                                onChange={(e) => setCandidateAnswer(e.target.value)}
                                className='panel__textarea'
                                placeholder="Click the Mic button below and speak your answer..."
                                style={{ minHeight: '120px' }}
                            />
                        </div>

                        {/* Controls */}
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={toggleListening}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    background: isListening ? '#ef4444' : '#6366f1',
                                    color: '#fff'
                                }}
                            >
                                {isListening ? '🛑 Stop Recording' : '🎙️ Start Speaking (Mic)'}
                            </button>

                            <button
                                onClick={submitAnswer}
                                disabled={loading}
                                className='generate-btn'
                                style={{ flex: 1 }}
                            >
                                {loading ? 'Evaluating...' : 'Submit Answer →'}
                            </button>
                        </div>
                    </div>

                    {/* Live Evaluation & Turn History */}
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '24px',
                        padding: '2rem'
                    }}>
                        <h3 style={{ color: '#f8fafc', marginBottom: '1.5rem' }}>📊 Turn Evaluation Feedback</h3>

                        {feedback && (
                            <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '1.2rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.8rem' }}>
                                    <span style={{ color: '#34d399', fontWeight: 'bold' }}>Score: {feedback.score}/100</span>
                                    <span style={{ color: '#818cf8' }}>Confidence: {feedback.confidenceRating}</span>
                                </div>
                                <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>{feedback.feedback}</p>
                            </div>
                        )}

                        <h4 style={{ color: '#94a3b8', marginBottom: '1rem' }}>Completed Turns ({history.length}):</h4>
                        <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                            {history.map((item, index) => (
                                <div key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem', marginBottom: '0.8rem' }}>
                                    <p style={{ color: '#818cf8', fontSize: '0.85rem' }}>Q{item.qNum}: {item.question}</p>
                                    <p style={{ color: '#f8fafc', fontSize: '0.9rem' }}>Ans: "{item.answer}"</p>
                                    <span style={{ fontSize: '0.8rem', color: '#34d399' }}>Score: {item.score}% | {item.feedback}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {sessionFinished && (
                <div style={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(52, 211, 153, 0.4)',
                    borderRadius: '24px',
                    padding: '3rem',
                    textAlign: 'center',
                    maxWidth: '650px',
                    margin: '0 auto'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                    <h2 style={{ color: '#34d399', marginBottom: '1rem' }}>Interview Completed Successfully!</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>You completed all 4 questions in this voice round.</p>
                    <button onClick={startInterview} className='generate-btn'>Start New Voice Round</button>
                </div>
            )}
        </div>
    )
}

export default VoiceInterviewRoom
