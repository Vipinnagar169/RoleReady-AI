const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const { fetchJdFromUrlController } = require("../controllers/urlFetcher.controller")

const urlFetcherRouter = express.Router()

/**
 * @route POST /api/url-fetcher/fetch
 * @description Scrape job URL and extract job description via AI
 * @access Private
 */
urlFetcherRouter.post("/fetch", authMiddleware.authUser, fetchJdFromUrlController)

module.exports = urlFetcherRouter
