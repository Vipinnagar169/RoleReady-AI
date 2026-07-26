const axios = require("axios")
const cheerio = require("cheerio")
const Groq = require("groq-sdk")

const GROQ_KEYS = [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
].filter(k => k && k.trim() !== "")

let currentKeyIndex = 0

async function callGroq(prompt) {
    for (let i = 0; i < GROQ_KEYS.length; i++) {
        const keyIdx = (currentKeyIndex + i) % GROQ_KEYS.length
        const groq = new Groq({ apiKey: GROQ_KEYS[keyIdx] })
        try {
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3,
            })
            currentKeyIndex = (keyIdx + 1) % GROQ_KEYS.length
            return completion.choices[0]?.message?.content?.trim()
        } catch (err) {
            if (err?.status !== 429 && err?.status !== 503) throw err
        }
    }
    throw new Error("All Groq keys exhausted in urlFetcher service.")
}

/**
 * Scrapes clean text from a job posting URL and uses Groq to extract structured Job Description.
 */
async function extractJdFromUrl(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            timeout: 12000
        })

        const $ = cheerio.load(response.data)

        // Remove scripts, styles, nav, footers, headers
        $("script, style, nav, footer, header, svg, noscript, iframe").remove()

        const rawText = $("body").text().replace(/\s+/g, " ").trim().slice(0, 12000)

        if (!rawText || rawText.length < 50) {
            throw new Error("Could not extract sufficient text content from URL.")
        }

        const prompt = `Extract the complete Job Title and Job Description (requirements, key responsibilities, qualifications, and skills needed) from the following raw web page content.
Filter out navigation menus, headers, footers, and ads. Return only clean, well-formatted job details.

Raw Page Content:
${rawText}`

        return await callGroq(prompt)
    } catch (error) {
        console.error("Error fetching job URL:", error.message)
        throw new Error(error.message || "Failed to fetch or parse Job Description from URL.")
    }
}

module.exports = { extractJdFromUrl }
