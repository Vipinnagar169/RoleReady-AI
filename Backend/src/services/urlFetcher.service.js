const axios = require("axios")
const cheerio = require("cheerio")
const { GoogleGenAI } = require("@google/genai")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

/**
 * Scrapes clean text from a job posting URL and uses Gemini to extract structured Job Description.
 */
async function extractJdFromUrl(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            timeout: 10000
        })

        const $ = cheerio.load(response.data)

        // Remove scripts, styles, nav, footers, headers
        $("script, style, nav, footer, header, svg, noscript, iframe").remove()

        const rawText = $("body").text().replace(/\s+/g, " ").trim().slice(0, 12000)

        if (!rawText || rawText.length < 50) {
            throw new Error("Could not extract sufficient text content from URL.")
        }

        const prompt = `Extract the complete Job Title and Job Description (including requirements, key responsibilities, and qualifications) from the following raw web page content.
Filter out website navigation or headers and return clean job details in formatted text.

Raw Page Content:
${rawText}
`

        const aiResponse = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: prompt
        })

        return aiResponse.text.trim()
    } catch (error) {
        console.error("Error fetching job URL:", error.message)
        throw new Error(error.message || "Failed to fetch or parse Job Description from URL.")
    }
}

module.exports = { extractJdFromUrl }
