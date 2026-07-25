/**
 * RAG & Semantic Skill Gap Service
 * Chunking, keyword vector matching, and semantic context construction
 */

function tokenize(text) {
    if (!text) return new Set()
    return new Set(
        text.toLowerCase()
            .replace(/[^a-z0-9+#\s]/g, " ")
            .split(/\s+/)
            .filter(word => word.length > 2)
    )
}

function calculateJaccardSimilarity(textA, textB) {
    const setA = tokenize(textA)
    const setB = tokenize(textB)
    if (setA.size === 0 || setB.size === 0) return 0

    const intersection = new Set([...setA].filter(x => setB.has(x)))
    const union = new Set([...setA, ...setB])
    return intersection.size / union.size
}

function chunkText(text, maxChunkSize = 300) {
    if (!text) return []
    const sentences = text.split(/(?<=[.?!])\s+|\n+/)
    const chunks = []
    let currentChunk = ""

    for (const sentence of sentences) {
        if ((currentChunk + " " + sentence).length > maxChunkSize) {
            if (currentChunk) chunks.push(currentChunk.trim())
            currentChunk = sentence
        } else {
            currentChunk += (currentChunk ? " " : "") + sentence
        }
    }
    if (currentChunk) chunks.push(currentChunk.trim())
    return chunks
}

/**
 * Builds RAG Semantic Context for Gemini Prompt
 */
function buildRagContext({ resume, selfDescription, jobDescription }) {
    const candidateFullProfile = `${resume || ""} ${selfDescription || ""}`.trim()
    const jdChunks = chunkText(jobDescription, 250)

    const scoredChunks = jdChunks.map(chunk => ({
        chunk,
        similarity: calculateJaccardSimilarity(candidateFullProfile, chunk)
    }))

    // Sort chunks by relevance
    scoredChunks.sort((a, b) => b.similarity - a.similarity)

    const highMatchChunks = scoredChunks.filter(c => c.similarity > 0.15).map(c => c.chunk)
    const missingSkillChunks = scoredChunks.filter(c => c.similarity <= 0.15).map(c => c.chunk)

    return {
        matchedContext: highMatchChunks.join("\n- "),
        gapContext: missingSkillChunks.join("\n- "),
        totalChunksCount: jdChunks.length
    }
}

module.exports = { buildRagContext, calculateJaccardSimilarity }
