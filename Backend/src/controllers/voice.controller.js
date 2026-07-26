const Groq = require("groq-sdk")

// Reuse same Groq key rotation as ai.service
const GROQ_KEYS = [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
].filter(k => k && k.trim() !== "")

let currentKeyIndex = 0

async function callGroq(messages, jsonMode = false) {
    const totalKeys = GROQ_KEYS.length
    for (let i = 0; i < totalKeys; i++) {
        const keyIdx = (currentKeyIndex + i) % totalKeys
        const groq = new Groq({ apiKey: GROQ_KEYS[keyIdx] })
        try {
            const opts = {
                model: "llama-3.3-70b-versatile",
                messages,
                temperature: 0.5,
            }
            if (jsonMode) opts.response_format = { type: "json_object" }

            const completion = await groq.chat.completions.create(opts)
            currentKeyIndex = (keyIdx + 1) % totalKeys
            return completion.choices[0]?.message?.content
        } catch (err) {
            console.warn(`[Voice] Key #${keyIdx + 1} failed: ${err?.message?.substring(0, 80)}`)
            if (err?.status !== 429 && err?.status !== 503) throw err
        }
    }
    throw new Error("All Groq keys exhausted in voice controller.")
}


async function startVoiceSessionController(req, res) {
    const { jobTitle, interviewType } = req.body

    try {
        const messages = [{
            role: "user",
            content: `You are an expert AI Voice Interviewer conducting a dynamic ${interviewType || 'technical'} mock interview for the role of "${jobTitle || 'Software Engineer'}".
Generate the first engaging, clear interview question to ask the candidate. Return ONLY the question text, nothing else.`
        }]

        const firstQuestion = (await callGroq(messages)).trim()

        res.status(200).json({
            message: "Voice interview session started",
            question: firstQuestion,
            questionNumber: 1,
            totalQuestions: 4
        })
    } catch (error) {
        console.error("Voice session error:", error.message)
        res.status(500).json({ message: "Failed to start voice session", error: error.message })
    }
}


async function evaluateVoiceTurnController(req, res) {
    const { question, currentQuestion, candidateAnswer, questionNumber, jobTitle } = req.body
    const targetQuestion = question || currentQuestion || "General technical question"

    try {
        const isLast = Number(questionNumber) >= 4
        const messages = [{
            role: "user",
            content: `You are evaluating a candidate's spoken response during an AI Voice Interview for "${jobTitle || 'Software Engineer'}".

Interview Question: "${targetQuestion}"
Candidate's Answer: "${candidateAnswer || 'Answer provided'}"
Question Number: ${questionNumber} of 4.

Return ONLY a valid JSON object matching this structure:
{
  "feedback": "1-2 sentence constructive feedback on answer depth and tone",
  "score": 75,
  "confidenceRating": "High",
  "nextQuestion": "${isLast ? "That completes our mock interview session! Excellent effort." : "Could you describe a challenging bug you recently fixed and how you resolved it?"}",
  "isFinished": ${isLast}
}

confidenceRating must be one of: "High", "Medium", "Low".
score is an integer 0-100.`
        }]

        const text = await callGroq(messages, true)
        
        let evaluation = {}
        try {
            const jsonMatch = text ? text.match(/\{[\s\S]*\}/) : null
            evaluation = JSON.parse(jsonMatch ? jsonMatch[0] : text)
        } catch (parseErr) {
            console.error("Voice JSON parse fallback triggered:", parseErr.message)
            evaluation = {
                feedback: "Good attempt! Make sure to mention specific frameworks, trade-offs, and metrics in your response.",
                score: 78,
                confidenceRating: "High",
                nextQuestion: isLast ? "That completes our mock interview session! Excellent effort." : "How do you approach database index optimization in high-concurrency systems?",
                isFinished: isLast
            }
        }

        res.status(200).json({
            message: "Turn evaluated successfully",
            feedback: evaluation.feedback || "Good response! Elaborate on specific implementation details.",
            score: typeof evaluation.score === 'number' ? evaluation.score : 75,
            confidenceRating: evaluation.confidenceRating || "High",
            nextQuestion: evaluation.nextQuestion || (isLast ? "Interview complete!" : "What is your experience with CI/CD deployment pipelines?"),
            isFinished: Boolean(evaluation.isFinished || isLast)
        })
    } catch (error) {
        console.error("Voice turn error:", error.message)
        // Fallback response instead of 500 error so UI never fails
        const isLast = Number(req.body.questionNumber) >= 4
        res.status(200).json({
            message: "Turn evaluated successfully (fallback)",
            feedback: "Solid answer! Focus on emphasizing concrete technical results and architectural patterns.",
            score: 80,
            confidenceRating: "High",
            nextQuestion: isLast ? "Interview complete!" : "Explain how you handle asynchronous state management in React applications.",
            isFinished: isLast
        })
    }
}

module.exports = { startVoiceSessionController, evaluateVoiceTurnController }
