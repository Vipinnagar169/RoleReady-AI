const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf, parseResumePdfText } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")




/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {

    let resumeText = ""
    if (req.file) {
        try {
            const parsedPdf = await pdfParse(req.file.buffer)
            resumeText = parsedPdf.text || ""
        } catch (pdfErr) {
            console.error("PDF parsing error:", pdfErr.message)
            resumeText = "Candidate uploaded resume PDF."
        }
    }

    const { selfDescription, jobDescription } = req.body

    const targetJd = jobDescription || "Software Engineer"
    const targetProfile = resumeText || selfDescription || "General Candidate Profile"

    if (!jobDescription) {
        return res.status(400).json({
            message: "Job description is required."
        })
    }

    if (!resumeText && !selfDescription) {
        return res.status(400).json({
            message: "Please upload a resume or provide a self-description."
        })
    }

    const interViewReportByAi = await generateInterviewReport({
        resume: resumeText,
        selfDescription,
        jobDescription
    })

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeText,
        selfDescription,
        jobDescription,
        ...interViewReportByAi
    })

    res.status(201).json({
        message: "Interview report generated successfully.",
        interviewReport
    })

}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId).populate("user")

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription, user } = interviewReport

    const userName = user?.username || req.user?.username || "Vipin Nagar"
    const userEmail = user?.email || req.user?.email || "vipin.nagar@example.com"

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription, userName, userEmail })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}

/**
 * @description Controller to generate resume PDF directly from user details (Live Resume Builder page).
 */
async function generateDirectResumePdfController(req, res) {
    let resumeText = ""
    if (req.file) {
        try {
            const parsedPdf = await pdfParse(req.file.buffer)
            resumeText = parsedPdf.text || ""
        } catch (pdfErr) {
            console.error("PDF parse error:", pdfErr.message)
        }
    }

    const { fullName, jobTitle, summary, skills, experience } = req.body

    const userName = fullName || req.user?.username || "Vipin Nagar"
    const userEmail = req.user?.email || "vipin.nagar@example.com"
    const selfDescCombined = [summary, skills ? `Skills: ${skills}` : "", experience ? `Experience:\n${experience}` : ""].filter(Boolean).join("\n\n")

    const pdfBuffer = await generateResumePdf({
        resume: resumeText,
        selfDescription: selfDescCombined,
        jobDescription: jobTitle || "Software Engineer",
        userName,
        userEmail
    })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=ATS_Resume_${Date.now()}.pdf`
    })

    res.send(pdfBuffer)
}

/**
 * @description Controller to parse uploaded PDF resume and extract structured fields for Live Resume Builder.
 */
async function parseResumePdfController(req, res) {
    if (!req.file) {
        return res.status(400).json({ message: "PDF resume file is required." })
    }

    try {
        const parsedPdf = await pdfParse(req.file.buffer)
        const rawText = parsedPdf.text || ""

        if (!rawText.trim()) {
            return res.status(400).json({ message: "Could not extract text from uploaded PDF." })
        }

        const extractedData = await parseResumePdfText(rawText)

        res.status(200).json({
            message: "Resume parsed successfully.",
            data: extractedData
        })
    } catch (err) {
        console.error("Parse resume PDF error:", err)
        res.status(500).json({ message: "Failed to parse resume PDF", error: err.message })
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
    generateDirectResumePdfController,
    parseResumePdfController
}