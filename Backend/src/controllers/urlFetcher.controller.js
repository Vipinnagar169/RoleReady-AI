const { extractJdFromUrl } = require("../services/urlFetcher.service")

async function fetchJdFromUrlController(req, res) {
    const { url } = req.body

    if (!url) {
        return res.status(400).json({ message: "URL is required" })
    }

    try {
        const jobDescription = await extractJdFromUrl(url)
        res.status(200).json({
            message: "Job Description extracted successfully",
            jobDescription
        })
    } catch (error) {
        res.status(500).json({
            message: error.message || "Failed to extract Job Description from URL"
        })
    }
}

module.exports = { fetchJdFromUrlController }
