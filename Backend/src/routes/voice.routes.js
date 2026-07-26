const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const { startVoiceSessionController, evaluateVoiceTurnController } = require("../controllers/voice.controller")

const voiceRouter = express.Router()

/**
 * @route POST /api/voice/start
 * @description Start a voice interview session
 * @access Private
 */
voiceRouter.post("/start", authMiddleware.authUser, startVoiceSessionController)

/**
 * @route POST /api/voice/turn
 * @description Evaluate current turn candidate answer & get next question
 * @access Private
 */
voiceRouter.post("/turn", authMiddleware.authUser, evaluateVoiceTurnController)
voiceRouter.post("/answer", authMiddleware.authUser, evaluateVoiceTurnController)

module.exports = voiceRouter
