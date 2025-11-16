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
        await Promise.race([
          ensureDatabase(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database connection timeout')), 8000)
          )
        ])
        dbInitialized = true
        console.log('Database initialized successfully')
      } catch (dbError) {
        console.error('Database connection failed:', dbError.message)
        // Continue anyway - some endpoints might work without DB
        // Database will be retried on next request
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
