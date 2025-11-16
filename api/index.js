import serverless from 'serverless-http'
import app, { ensureDatabase } from '../src/app.js'

let dbInitialized = false
let handler = null

export default async function (req, res) {
  try {
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
    if (req.url.startsWith('/api/') && !dbInitialized) {
      console.log('Initializing database connection for:', req.url)
      try {
        // Stricter timeout: 5 seconds max (Vercel free plan has 10s limit)
        await Promise.race([
          ensureDatabase(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database connection timeout')), 5000)
          )
        ])
        dbInitialized = true
        console.log('Database initialized successfully')
      } catch (dbError) {
        console.error('Database connection failed:', dbError.message)
        // Return error response immediately instead of continuing
        if (!res.headersSent) {
          return res.status(503).json({ 
            message: 'Database connection failed. Please try again in a moment.',
            error: 'Service temporarily unavailable',
            retryAfter: 5
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
