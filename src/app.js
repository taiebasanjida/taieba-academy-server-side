import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import coursesRouter from './routes/courses.js'
import enrollmentsRouter from './routes/enrollments.js'
import { authMiddleware } from './middleware/auth.js'
import { ensureDBConnection } from './middleware/db.js'
import Enrollment from './models/Enrollment.js'
import Course from './models/Course.js'

dotenv.config()

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : []

const app = express()

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    // Always allow localhost for development/testing (even in production for flexibility)
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true)
    }
    
    // Check if origin is in allowed origins
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    
    // Default: allow if no origins specified (for development)
    if (allowedOrigins.length === 0) {
      return callback(null, true)
    }
    
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

const MONGO_URI = process.env.MONGO_URL || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/db_taieba_academy'

// Log connection string (without password) for debugging
if (MONGO_URI.includes('mongodb+srv://')) {
  const uriWithoutPassword = MONGO_URI.replace(/mongodb\+srv:\/\/[^:]+:[^@]+@/, 'mongodb+srv://***:***@')
  console.log('🔗 MongoDB URI:', uriWithoutPassword)
} else {
  console.log('🔗 MongoDB URI:', MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'))
}

let isDBConnected = false

// Simple in-memory cache for GET requests (Free Tier optimization)
const cache = new Map()
const CACHE_TTL = 30000 // 30 seconds cache
const MAX_CACHE_SIZE = 50 // Limit cache size

function getCacheKey(req) {
  return `${req.method}:${req.url}:${JSON.stringify(req.query)}`
}

function getCachedResponse(key) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  if (cached) {
    cache.delete(key) // Remove expired cache
  }
  return null
}

function setCachedResponse(key, data) {
  // Limit cache size
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value
    cache.delete(firstKey)
  }
  cache.set(key, { data, timestamp: Date.now() })
}

export async function ensureDatabase() {
  // Fast path: Already connected
  if (mongoose.connection.readyState === 1) {
    isDBConnected = true
    return
  }

  if (isDBConnected && mongoose.connection.readyState === 2) {
    // Connection in progress, wait for it with VERY fast timeout
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Connection timeout')), 500) // 500ms max - match api/index.js
      mongoose.connection.once('connected', () => {
        clearTimeout(timeout)
        isDBConnected = true
        resolve()
      })
      mongoose.connection.once('error', (err) => {
        clearTimeout(timeout)
        reject(err)
      })
    })
  }

  try {
    // ULTRA-FAST connection options for Free Tier (10s limit)
    // Must complete in <1 second to avoid timeout
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 500, // 500ms - match api/index.js timeout
      socketTimeoutMS: 1500, // 1.5 seconds
      connectTimeoutMS: 500, // 500ms - match api/index.js timeout
      maxPoolSize: 1, // Single connection for serverless
      minPoolSize: 0, // Allow connection to close when idle
      retryWrites: true,
      w: 'majority',
      // Optimize for serverless
      bufferCommands: false,
      // Additional optimizations for Free Tier
      maxIdleTimeMS: 10000,
      heartbeatFrequencyMS: 10000,
      // Disable unnecessary features
      autoIndex: false,
      autoCreate: false,
      directConnection: false,
    })
    isDBConnected = true
    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    isDBConnected = false // Reset flag on error
    throw error
  }
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

app.get('/', (_req, res) => {
  res.json({ ok: true, name: 'Taieba Academy API' })
})

// Apply database connection middleware to all API routes
app.use('/api/courses', ensureDBConnection, authMiddleware.optional, coursesRouter)

// GET /api/enrollments - No auth required for testing (MUST be before app.use)
app.get('/api/enrollments', ensureDBConnection, async (req, res) => {
  const startTime = Date.now()
  const requestId = `enrollments-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  logPerformance('GET /api/enrollments', 0, { requestId, skipDB: req.skipDB })
  
  // Fast path: If DB connection failed, return empty data immediately
  if (req.skipDB) {
    const elapsed = Date.now() - startTime
    logPerformance('GET /api/enrollments (skipDB)', elapsed, { requestId })
    res.setHeader('X-DB-Status', 'skipped')
    res.setHeader('Cache-Control', 'public, max-age=5')
    return res.json({ enrollments: [], count: 0, error: 'Database unavailable' })
  }
  
  try {
    // Check cache first (Free Tier optimization)
    const cacheKey = getCacheKey(req)
    const cached = getCachedResponse(cacheKey)
    if (cached) {
      const elapsed = Date.now() - startTime
      logPerformance('GET /api/enrollments (CACHE HIT)', elapsed, { requestId, cacheKey })
      res.setHeader('X-Cache', 'HIT')
      res.setHeader('Cache-Control', 'public, max-age=30')
      return res.json(cached)
    }
    
    const queryStartTime = Date.now()
    // ULTRA-FAST: Load only enrollments without course data for Free Tier
    // Client can fetch course details separately if needed
    // VERY aggressive timeout - 1.5 seconds max (reduced for safety)
    const enrollments = await Promise.race([
      Enrollment.find()
        .sort({ createdAt: -1 })
        .limit(10) // Reduced to 10 for even faster queries
        .lean()
        .select('userEmail course progress rating review completedAt createdAt updatedAt'),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 1500) // 1.5 seconds max
      )
    ])
    const queryTime = Date.now() - queryStartTime
    logPerformance('GET /api/enrollments (DB Query)', queryTime, { requestId, count: enrollments.length })
    
    // Early return if no enrollments
    if (enrollments.length === 0) {
      const response = { enrollments: [], count: 0 }
      setCachedResponse(cacheKey, response)
      const elapsed = Date.now() - startTime
      logPerformance('GET /api/enrollments (EMPTY)', elapsed, { requestId })
      res.setHeader('Cache-Control', 'public, max-age=30')
      return res.json(response)
    }
    
    // Return enrollments with course ID only (no populate for speed)
    const response = { 
      enrollments: enrollments.map(e => ({
        ...e,
        course: e.course ? { _id: e.course } : null // Only return ID, client can fetch details
      })), 
      count: enrollments.length 
    }
    
    // Cache the response
    setCachedResponse(cacheKey, response)
    const elapsed = Date.now() - startTime
    logPerformance('GET /api/enrollments (SUCCESS)', elapsed, { requestId, cacheKey, count: enrollments.length })
    res.setHeader('X-Cache', 'MISS')
    res.setHeader('Cache-Control', 'public, max-age=30')
    res.setHeader('X-Response-Time', `${elapsed}ms`)
    res.json(response)
  } catch (error) {
    const elapsed = Date.now() - startTime
    logPerformance('GET /api/enrollments (ERROR)', elapsed, { requestId, error: error.message })
    console.error('Error fetching enrollments:', error)
    
    // Return empty response on timeout instead of error
    if (error.message.includes('timeout') || elapsed > 8000) {
      res.setHeader('X-Error', 'timeout')
      return res.json({ enrollments: [], count: 0, error: 'Request timeout' })
    }
    res.status(500).json({ message: 'Failed to load enrollments' })
  }
})

// All other enrollment routes require authentication
app.use('/api/enrollments', ensureDBConnection, authMiddleware.required, enrollmentsRouter)

export default app

