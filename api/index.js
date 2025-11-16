import serverless from 'serverless-http'
import app, { ensureDatabase } from '../src/app.js'

let dbInitialized = false
let handler = null

export default async function (req, res) {
  try {
    // Initialize database connection
    if (!dbInitialized) {
      console.log('Initializing database connection...')
      await ensureDatabase()
      dbInitialized = true
      console.log('Database initialized successfully')
    }
    
    // Initialize serverless handler
    if (!handler) {
      console.log('Initializing serverless handler...')
      handler = serverless(app, {
        binary: ['image/*', 'application/pdf']
      })
      console.log('Serverless handler initialized')
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
