import serverless from 'serverless-http'
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

export default async function (req, res) {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return handleOPTIONS(req, res)
    }
    
    // Set CORS headers for all responses
    setCORSHeaders(req, res)
    
    // Fast path: Root endpoint doesn't need database or handler initialization
    if (req.url === '/' && req.method === 'GET') {
      res.setHeader('Content-Type', 'application/json')
      return res.status(200).json({ 
        ok: true, 
        name: 'Taieba Academy API',
        message: 'API is running'
      })
    }
    
    // Initialize serverless handler for other routes
    if (!handler) {
      console.log('Initializing serverless handler...')
      handler = serverless(app, {
        binary: ['image/*', 'application/pdf']
      })
      console.log('Serverless handler initialized')
    }
    
    // Lazy load database connection only for API routes
    // Use aggressive timeout and fail fast
    if (req.url.startsWith('/api/') && !dbInitialized) {
      console.log('Initializing database connection for:', req.url)
      
      // Set a very aggressive timeout (3 seconds) to avoid hitting Vercel's 10s limit
      const connectionPromise = ensureDatabase()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout after 3s')), 3000)
      )
      
      try {
        await Promise.race([connectionPromise, timeoutPromise])
        dbInitialized = true
        console.log('Database initialized successfully')
      } catch (dbError) {
        console.error('Database connection failed:', dbError.message)
        
        // Cancel the connection attempt if possible
        connectionPromise.catch(() => {}) // Suppress unhandled promise rejection
        
        // Return error response immediately - don't wait for handler
        if (!res.headersSent) {
          // CORS headers already set at the beginning
          res.setHeader('Content-Type', 'application/json')
          return res.status(503).json({ 
            message: 'Database connection failed. Please try again in a moment.',
            error: 'Service temporarily unavailable',
            retryAfter: 3,
            timestamp: new Date().toISOString()
          })
        }
      }
    }
    
    return handler(req, res)
  } catch (error) {
    console.error('Handler error:', error)
    console.error('Error stack:', error.stack)
    if (!res.headersSent) {
      return res.status(500).json({ 
        message: 'Server error', 
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    }
  }
}
