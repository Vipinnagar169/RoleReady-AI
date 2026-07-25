const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const turnResponseSchema = z.object({
    feedback: z.string().describe("Constructive 1-2 sentence feedback on candidate's answer depth and tone"),
    score: z.number().describe("Answer evaluation score from 0 to 100"),
    confidenceRating: z.enum(["High", "Medium", "Low"]).describe("Assessed confidence level based on transcript clarity"),
    nextQuestion: z.string().describe("The next interview question to ask the candidate"),
    isFinished: z.boolean().describe("Set to true if 4 questions have been completed")
})

async function startVoiceSessionController(req, res) {
    const { jobTitle, interviewType } = req.body // 'technical' | 'hr'

    try {
        const prompt = `You are an expert AI Voice Interviewer conducting a dynamic ${interviewType || 'technical'} mock interview for the role of "${jobTitle || 'Software Engineer'}".
Generate the first engaging, clear interview question to ask the candidate.`

        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: prompt
        })

        const firstQuestion = response.text.trim()

        res.status(200).json({
            message: "Voice interview session started",
            question: firstQuestion,
            questionNumber: 1,
            totalQuestions: 4
        })
    } catch (error) {
        res.status(500).json({ message: "Failed to start voice session", error: error.message })
    }
}

async function evaluateVoiceTurnController(req, res) {
    const { question, candidateAnswer, questionNumber, jobTitle } = req.body

    try {
        const prompt = `You are evaluating a candidate's spoken response during an AI Voice Interview for "${jobTitle || 'Software Engineer'}".

Interview Question Asked: "${question}"
Candidate's Spoken Answer: "${candidateAnswer}"
Current Question Number: ${questionNumber} out of 4.

Evaluate candidate's answer depth, clarity, and relevance.
If questionNumber is 4, set isFinished to true and set nextQuestion to "That completes our mock interview session! Excellent effort."
Otherwise, generate the next technical/behavioral follow-up question.
`

        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(turnResponseSchema)
            }
        })

        const evaluation = JSON.parse(response.text)

        res.status(200).json({
            message: "Turn evaluated successfully",
            ...evaluation
        })
    } catch (error) {
        res.status(500).json({ message: "Failed to evaluate answer", error: error.message })
    }
}

module.exports = { startVoiceSessionController, evaluateVoiceTurnController }
