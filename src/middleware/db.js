import mongoose from 'mongoose'
import { ensureDatabase } from '../lib/database.js'

/**
 * Middleware to ensure database connection before handling API requests
 * This is critical for Vercel serverless functions where connections
 * may be closed between invocations
 * OPTIMIZED: Very aggressive timeout for Free Tier (500ms max)
 */
export async function ensureDBConnection(req, res, next) {
  const startTime = Date.now()
  
  // Fast path: Already connected
  if (mongoose.connection.readyState === 1) {
    return next()
  }
  
  try {
    // Reasonable timeout for Free Tier - 3 seconds for Atlas connections
    await Promise.race([
      ensureDatabase(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('DB connection timeout')), 3000) // 3 seconds - reasonable for Atlas
      )
    ])
    next()
  } catch (error) {
    const elapsed = Date.now() - startTime
    console.error(`[DB] Connection middleware error (${elapsed}ms):`, error.message)
    
    // For Free Tier, skip DB and mark request - handler will return empty data
    req.skipDB = true
    return next() // Continue to handler, which will return empty data
  }
}

