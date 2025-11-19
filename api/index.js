import serverless from 'serverless-http'
import mongoose from 'mongoose'
import app, { ensureDatabase } from '../src/app.js'

let dbInitialized = false
let handler = null

// Helper function to set CORS headers
function setCORSHeaders(req, res) {
  // Get origin from request headers
  const origin = req.headers.origin || req.headers.referer || '*'
  
  // Allow all origins for flexibility (app.js CORS middleware will validate)
  // This ensures CORS headers are always present
  res.setHeader('Access-Control-Allow-Origin', origin === '*' ? '*' : origin)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
}

// Handle OPTIONS preflight requests
function handleOPTIONS(req, res) {
  setCORSHeaders(req, res)
  res.status(204).end()
}

// Enhanced logging for Vercel Dashboard
function logPerformance(operation, duration, details = {}) {
  const logData = {
    operation,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
    ...details
  }
  console.log(`[PERF] ${operation}: ${duration}ms`, JSON.stringify(logData))
}

export default async function (req, res) {
  const requestStartTime = Date.now()
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  // CRITICAL: Global timeout for entire request (8 seconds max for Free Tier)
  // This ensures we never exceed Vercel's 10 second limit
  // 8s leaves buffer for Vercel's own processing
  const MAX_REQUEST_TIME = 8000 // 8 seconds
  let requestTimeout = null
  
  // Set a global timeout that will force return if request takes too long
  const timeoutPromise = new Promise((resolve) => {
    requestTimeout = setTimeout(() => {
      logPerformance('REQUEST_GLOBAL_TIMEOUT', MAX_REQUEST_TIME, { requestId, url: req.url })
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('X-Timeout', 'global')
        if (req.url === '/api/enrollments') {
          res.status(200).json({ enrollments: [], count: 0, error: 'Request timeout - please try again' })
        } else if (req.url === '/api/courses') {
          res.status(200).json({ courses: [], error: 'Request timeout - please try again' })
        } else {
          res.status(504).json({ message: 'Request timeout', error: 'Service temporarily unavailable' })
        }
      }
      resolve('timeout')
    }, MAX_REQUEST_TIME)
  })
  
  logPerformance('REQUEST_START', 0, { 
    requestId, 
    method: req.method, 
    url: req.url,
    userAgent: req.headers['user-agent']?.substring(0, 50)
  })
  
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      const elapsed = Date.now() - requestStartTime
      logPerformance('OPTIONS_REQUEST', elapsed, { requestId })
      return handleOPTIONS(req, res)
    }
    
    // Set CORS headers for all responses
    setCORSHeaders(req, res)
    
    // Fast path: Root endpoint doesn't need database or handler initialization
    if (req.url === '/' && req.method === 'GET') {
      const elapsed = Date.now() - requestStartTime
      logPerformance('ROOT_ENDPOINT', elapsed, { requestId })
      res.setHeader('Content-Type', 'application/json')
      return res.status(200).json({ 
        ok: true, 
        name: 'Taieba Academy API',
        message: 'API is running'
      })
    }
    
    // Initialize serverless handler for other routes
    if (!handler) {
      const handlerInitStart = Date.now()
      console.log('[INIT] Initializing serverless handler...')
      handler = serverless(app, {
        binary: ['image/*', 'application/pdf']
      })
      const handlerInitTime = Date.now() - handlerInitStart
      logPerformance('HANDLER_INIT', handlerInitTime, { requestId })
      console.log('[INIT] Serverless handler initialized')
    }
    
    // CRITICAL: Fast path for GET endpoints - return empty data if DB is slow
    // This prevents 504 timeouts on Vercel Free Tier
    if (req.method === 'GET' && (req.url === '/api/enrollments' || req.url === '/api/courses')) {
      // Check if DB is already connected (fast path)
      if (mongoose.connection.readyState === 1) {
        // DB is connected, proceed normally
        dbInitialized = true
        logPerformance('DB_REUSE', 0, { requestId })
      } else {
        // DB not connected - try to connect with reasonable timeout
        const connectionStart = Date.now()
        logPerformance('DB_INIT_START', 0, { requestId, url: req.url })
        try {
          await Promise.race([
            ensureDatabase(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('DB timeout')), 3000) // 3 seconds - reasonable for Atlas
            ),
            timeoutPromise // Also race against global timeout
          ])
          dbInitialized = true
          const dbInitTime = Date.now() - connectionStart
          logPerformance('DB_INIT_SUCCESS', dbInitTime, { requestId })
        } catch (dbError) {
          // DB connection failed or timed out - return empty data immediately
          // This prevents 504 timeout errors
          const elapsed = Date.now() - connectionStart
          logPerformance('DB_INIT_TIMEOUT', elapsed, { requestId, error: dbError.message })
          console.log(`[DB] Connection failed after ${elapsed}ms, returning empty data`)
          
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('X-DB-Status', 'timeout')
          res.setHeader('Cache-Control', 'public, max-age=5')
          
          if (req.url === '/api/enrollments') {
            return res.json({ enrollments: [], count: 0, error: 'Database connection timeout' })
          } else if (req.url === '/api/courses') {
            return res.json({ courses: [], error: 'Database connection timeout' })
          }
        }
      }
    } else if (req.url.startsWith('/api/') && mongoose.connection.readyState !== 1) {
      // For other API routes, try to connect but with timeout
      const dbInitStart = Date.now()
      logPerformance('DB_INIT_START', 0, { requestId, url: req.url })
      console.log('[DB] Initializing database connection for:', req.url)
      
      try {
        await Promise.race([
          ensureDatabase(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database connection timeout')), 3000) // 3 seconds - reasonable for Atlas
          ),
          timeoutPromise // Also race against global timeout
        ])
        dbInitialized = true
        const dbInitTime = Date.now() - dbInitStart
        logPerformance('DB_INIT_SUCCESS', dbInitTime, { requestId })
        console.log('[DB] Database initialized successfully')
      } catch (dbError) {
        const dbInitTime = Date.now() - dbInitStart
        logPerformance('DB_INIT_ERROR', dbInitTime, { requestId, error: dbError.message })
        console.error('[DB] Database connection failed:', dbError.message)
        
        // Return error response immediately
        if (!res.headersSent) {
          res.setHeader('Content-Type', 'application/json')
          return res.status(503).json({ 
            message: 'Database connection failed. Please try again in a moment.',
            error: 'Service temporarily unavailable',
            errorCode: 'TIMEOUT',
            retryAfter: 3,
            timestamp: new Date().toISOString()
          })
        }
      }
    } else if (req.url.startsWith('/api/') && mongoose.connection.readyState === 1) {
      // Connection already exists - mark as initialized
      dbInitialized = true
      logPerformance('DB_REUSE', 0, { requestId })
    }
    
    const handlerStartTime = Date.now()
    
    // CRITICAL: For GET /api/courses and /api/enrollments, we already handled DB connection
    // So handler should be fast. But still race against global timeout for safety
    const handlerPromise = handler(req, res)
    
    // Race handler against global timeout with early return
    try {
      const result = await Promise.race([
        handlerPromise,
        timeoutPromise.then(() => {
          // Timeout occurred - response should already be sent by timeout handler
          throw new Error('Handler timeout')
        })
      ])
      
      // Clear timeout if handler completed successfully
      if (requestTimeout) {
        clearTimeout(requestTimeout)
      }
      
      const handlerTime = Date.now() - handlerStartTime
      const totalTime = Date.now() - requestStartTime
      
      logPerformance('REQUEST_COMPLETE', totalTime, { 
        requestId, 
        handlerTime,
        method: req.method,
        url: req.url
      })
      
      return result
    } catch (handlerError) {
      // Handler timed out or errored
      if (requestTimeout) {
        clearTimeout(requestTimeout)
      }
      
      // If timeout already sent response, just return
      if (res.headersSent) {
        return
      }
      
      // Otherwise, send error response
      const totalTime = Date.now() - requestStartTime
      logPerformance('HANDLER_TIMEOUT', totalTime, { 
        requestId, 
        error: handlerError.message,
        method: req.method,
        url: req.url
      })
      
      if (req.url === '/api/enrollments' || req.url === '/api/courses') {
        res.status(200).json({ 
          [req.url.includes('enrollments') ? 'enrollments' : 'courses']: [], 
          error: 'Request timeout' 
        })
      } else {
        res.status(504).json({ message: 'Request timeout' })
      }
    }
  } catch (error) {
    // Clear timeout on error
    if (requestTimeout) {
      clearTimeout(requestTimeout)
    }
    
    const totalTime = Date.now() - requestStartTime
    logPerformance('REQUEST_ERROR', totalTime, { 
      requestId, 
      error: error.message,
      stack: error.stack?.substring(0, 200)
    })
    console.error('[ERROR] Handler error:', error)
    console.error('[ERROR] Error stack:', error.stack)
    if (!res.headersSent) {
      return res.status(500).json({ 
        message: 'Server error', 
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    }
  }
}
