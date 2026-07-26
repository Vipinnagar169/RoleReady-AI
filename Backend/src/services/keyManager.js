/**
 * Gemini API Key Rotation Manager
 * - Loads all GEMINI_API_KEY_* from .env
 * - Auto-switches to next key on 429 (rate limit) or 403/404 errors
 * - Logs which key is currently active
 */

const { GoogleGenAI } = require("@google/genai")

// Load all keys from env
const API_KEYS = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
].filter(k => k && k.trim() !== "")

if (API_KEYS.length === 0) {
    throw new Error("No Gemini API keys found! Add at least GEMINI_API_KEY_1 to your .env file")
}

console.log(`[KeyManager] Loaded ${API_KEYS.length} Gemini API key(s)`)

let currentKeyIndex = 0

function getCurrentClient() {
    return new GoogleGenAI({ apiKey: API_KEYS[currentKeyIndex] })
}

function rotateKey() {
    const prev = currentKeyIndex
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length
    console.log(`[KeyManager] Rotated from key #${prev + 1} to key #${currentKeyIndex + 1}`)
}

// Error codes that trigger key rotation
const ROTATE_ON_CODES = [429, 403, 404, 503]

/**
 * Call Gemini with auto key rotation on failure.
 * @param {Function} fn - async fn that receives (aiClient) and returns the result
 */
async function withKeyRotation(fn) {
    const totalKeys = API_KEYS.length
    let attempts = 0

    while (attempts < totalKeys) {
        try {
            const client = getCurrentClient()
            return await fn(client)
        } catch (err) {
            const statusCode = err?.status || err?.code || (err?.message?.match(/(\d{3})/)?.[1])
            const shouldRotate = ROTATE_ON_CODES.includes(Number(statusCode))

            console.error(`[KeyManager] Key #${currentKeyIndex + 1} failed — ${err?.message || err}`)

            if (shouldRotate && attempts + 1 < totalKeys) {
                rotateKey()
                attempts++
            } else {
                throw err  // All keys exhausted or non-rotatable error
            }
        }
    }
    throw new Error("[KeyManager] All API keys exhausted. Please add more keys to .env")
}

module.exports = { withKeyRotation }
