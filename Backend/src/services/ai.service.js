const Groq = require("groq-sdk")
const puppeteer = require("puppeteer")
const { buildRagContext } = require("./rag.service")
const { buildResumeHtml } = require("./resumeTemplate")

// Load all 3 Groq keys for rotation
const GROQ_KEYS = [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
].filter(k => k && k.trim() !== "")

if (GROQ_KEYS.length === 0) {
    throw new Error("No Groq API keys found! Add GROQ_API_KEY_1 to .env")
}

console.log(`[AI] Loaded ${GROQ_KEYS.length} Groq API key(s)`)

let currentKeyIndex = 0

// Best model → fallback chain
const MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-70b-versatile",
    "llama3-70b-8192",
    "mixtral-8x7b-32768",
]

/**
 * Try all keys × all models until one succeeds — JSON mode ON (for structured outputs)
 */
async function generateWithFallback(prompt) {
    for (const model of MODELS) {
        for (let attempt = 0; attempt < GROQ_KEYS.length; attempt++) {
            const keyIdx = (currentKeyIndex + attempt) % GROQ_KEYS.length
            const groq = new Groq({ apiKey: GROQ_KEYS[keyIdx] })

            try {
                const completion = await groq.chat.completions.create({
                    model,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.7,
                    max_tokens: 4096,
                    response_format: { type: "json_object" },
                })
                const text = completion.choices[0]?.message?.content
                console.log(`[AI] Success — Key #${keyIdx + 1}, Model: ${model}`)
                currentKeyIndex = (keyIdx + 1) % GROQ_KEYS.length
                return text
            } catch (err) {
                const status = err?.status || err?.code
                console.warn(`[AI] Key #${keyIdx + 1} / ${model} failed (${status}): ${err?.message?.substring(0, 80)}`)
                // On rate limit (429) → try next key, otherwise break to next model
                if (status !== 429 && status !== 503) break
            }
        }
    }
    throw new Error("All Groq keys and models exhausted. Try again later.")
}


async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const ragData = buildRagContext({ resume, selfDescription, jobDescription })

    const prompt = `You are a Senior Technical Recruiter and Hiring Manager. Analyze candidate background against target job requirements.

IMPORTANT: Even if the job description or candidate profile is short or minimal, infer standard industry expectations. Generate a complete, valuable interview report with:
- A REALISTIC match score that TRULY reflects how well the candidate's actual skills/experience match the job requirements. DO NOT always use 72. Calculate honestly: 40-55 for weak match, 56-70 for partial match, 71-84 for strong match, 85-95 for excellent match.
- Targeted technical & behavioral questions specific to this candidate and role.
- Real skill gaps identified from comparing resume to job requirements.
- A 7-day preparation roadmap.

Candidate Profile:
- Resume: ${resume || "Not provided"}
- Self Description: ${selfDescription || "Not provided"}

Job Description / Target Role:
${jobDescription || "Software Engineer"}

RAG Analysis:
- Skill Matches: ${ragData.matchedContext || "Infer standard industry baseline"}
- Skill Gaps: ${ragData.gapContext || "Infer standard skill gaps for role"}

Return ONLY a valid JSON object with this exact structure (replace all example values with REAL analysis):
{
  "title": "actual job title from description",
  "matchScore": <calculate this as an integer 40-95 based on actual candidate-job fit — NOT always 72>,
  "technicalQuestions": [
    { "question": "...", "intention": "...", "answer": "..." }
  ],
  "behavioralQuestions": [
    { "question": "...", "intention": "...", "answer": "..." }
  ],
  "skillGaps": [
    { "skill": "...", "severity": "low" }
  ],
  "preparationPlan": [
    { "day": 1, "focus": "...", "tasks": ["...", "..."] }
  ]
}`

    const text = await generateWithFallback(prompt)
    return JSON.parse(text)
}


async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    })
    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })
    const pdfBuffer = await page.pdf({
        format: "A4",
        margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" }
    })
    await browser.close()
    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription, userName, userEmail }) {
    const fallbackName = userName || "Vipin Nagar"
    const fallbackEmail = userEmail || "vipin.nagar@example.com"

    const prompt = `You are an expert ATS resume writer and parser. Your primary task is to EXTRACT all candidate details directly from the provided Resume Content and Self Description to generate a rich, complete 1-page professional resume.

CRITICAL INSTRUCTIONS FOR EXTRACTION & GENERATION:
1. FULL NAME: Extract the candidate's real full name from the Resume Content or Self Description text. If none found, use "${fallbackName}".
2. CONTACT INFO: Extract Email (or "${fallbackEmail}"), Phone (+91-9876543210), City/Location ("Jodhpur, Rajasthan"), LinkedIn, and GitHub links.
3. TECHNICAL SKILLS: You MUST categorize ALL candidate skills into these 5 keys (DO NOT OMIT Programming Languages!):
   - "Programming Languages": [list ALL languages like C++, Java, Python, JavaScript, TypeScript, HTML/CSS, SQL found or relevant]
   - "Frameworks & Web Tech": [React, Node.js, Express, Next.js, Redux, Tailwind, etc.]
   - "Databases": [MongoDB, PostgreSQL, MySQL, Redis, Firebase, etc.]
   - "Tools & Platforms": [Git, GitHub, Docker, Postman, VS Code, Linux, AWS, Vercel, etc.]
   - "Core Subjects": [Data Structures & Algorithms, OOPs, DBMS, Operating Systems, Computer Networks, Software Engineering]
4. PROJECTS & INTERNSHIPS: For each project or internship, write 2 to 3 detailed, high-impact bullet points specifying technologies used, feature implementation, and quantified outcomes (% performance, automation, user scalability).
5. CERTIFICATIONS & ACHIEVEMENTS: Include all real certifications and achievements found in the resume.

Candidate Raw Data:
--- RESUME CONTENT ---
${resume || "Not provided"}

--- SELF DESCRIPTION ---
${selfDescription || "Not provided"}

--- TARGET JOB ---
${jobDescription || "Software Engineer"}

Return ONLY a valid JSON object matching this structure:
{
  "fullName": "Extract real candidate full name",
  "city": "Location",
  "phone": "Phone number",
  "email": "Email address",
  "linkedin": "LinkedIn URL",
  "github": "GitHub URL",
  "careerObjective": "A strong, tailored 3-sentence professional objective for target role",
  "education": [
    {
      "degree": "B.E. / B.Tech / Degree",
      "specialization": "Information Technology / Computer Science",
      "institution": "University / College Name",
      "cgpa": "CGPA / Percentage",
      "year": "Final Year / Duration"
    }
  ],
  "technicalSkills": {
    "Programming Languages": ["C++", "JavaScript", "Python"],
    "Frameworks & Web Tech": ["React", "Node.js", "Express"],
    "Databases": ["MongoDB"],
    "Tools & Platforms": ["Git", "GitHub", "Docker", "VS Code"],
    "Core Subjects": ["Data Structures", "Algorithms", "OOPs", "DBMS", "Operating Systems", "Computer Networks"]
  },
  "projects": [
    {
      "title": "Project Name — Tech Stack",
      "duration": "Duration / Year",
      "bullets": [
        "Detailed bullet point describing system architecture and core feature implementation.",
        "Detailed bullet point highlighting performance optimization and user experience."
      ]
    }
  ],
  "internships": [
    {
      "role": "Role Title",
      "company": "Company Name",
      "duration": "Duration / Year",
      "bullets": [
        "Key technical achievement or contribution during internship."
      ]
    }
  ],
  "certifications": [
    "Certification Title — Issuing Body"
  ],
  "achievements": [
    "Key academic or hackathon achievement"
  ]
}`

    const text = await generateWithFallback(prompt)
    let resumeData = {}
    try {
        resumeData = JSON.parse(text)
    } catch (e) {
        console.error("Resume JSON parse error:", e)
    }

    resumeData.userName = fallbackName
    resumeData.userEmail = fallbackEmail

    const htmlContent = buildResumeHtml(resumeData)
    return await generatePdfFromHtml(htmlContent)
}

async function parseResumePdfText(rawText) {
    // Use a dedicated call WITHOUT json_object mode so the model can write
    // long text in experience/skills without being cut short
    const prompt = `You are an expert resume parser. Extract ALL information from the following raw resume text into a structured JSON format.

CRITICAL: Do NOT truncate, shorten, or omit any details. Extract every project, internship, certification, and achievement in full.

Raw Resume Text:
${rawText}

Return ONLY a valid JSON object with these EXACT keys:
{
  "fullName": "Real candidate full name from resume",
  "jobTitle": "Target or current job title inferred from resume",
  "summary": "Complete career objective or professional summary text from resume (full paragraph, nothing shortened)",
  "skills": "Comprehensive comma-separated list of ALL: programming languages, frameworks, libraries, databases, tools, platforms, and core CS subjects found in resume",
  "experience": "Multi-line text with ALL projects, internships, work experience, certifications, and achievements. Format each entry as:\\n\\nTitle | Company/Role | Duration\\n- Bullet point 1\\n- Bullet point 2\\n\\nInclude ALL entries from the resume without skipping any."
}`

    // Manual Groq call - no json_object mode, high token limit
    for (const model of MODELS) {
        for (let i = 0; i < GROQ_KEYS.length; i++) {
            const keyIdx = (currentKeyIndex + i) % GROQ_KEYS.length
            const groq = new Groq({ apiKey: GROQ_KEYS[keyIdx] })
            try {
                const completion = await groq.chat.completions.create({
                    model,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.2,
                    max_tokens: 4096,
                })
                currentKeyIndex = (keyIdx + 1) % GROQ_KEYS.length
                const text = completion.choices[0]?.message?.content?.trim()

                // Extract JSON from response (handles cases where model adds extra text)
                const jsonMatch = text.match(/\{[\s\S]*\}/)
                if (jsonMatch) return JSON.parse(jsonMatch[0])
                return JSON.parse(text)
            } catch (err) {
                console.warn(`[ParseResume] ${model} key #${keyIdx + 1} failed:`, err?.message?.substring(0, 60))
                if (err?.status !== 429 && err?.status !== 503) break
            }
        }
    }
    throw new Error("Failed to parse resume PDF text using Groq.")
}

module.exports = { generateInterviewReport, generateResumePdf, parseResumePdfText }