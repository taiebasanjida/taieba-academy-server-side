import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import coursesRouter from './routes/courses.js'
import enrollmentsRouter from './routes/enrollments.js'
import { authMiddleware } from './middleware/auth.js'

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

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taieba_academy'

let isDBConnected = false

export async function ensureDatabase() {
  if (isDBConnected) return
  if (mongoose.connection.readyState === 1) {
    isDBConnected = true
    return
  }

  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 4000, // 4 seconds to select server (increased for Atlas free tier)
      socketTimeoutMS: 8000, // 8 seconds socket timeout
      connectTimeoutMS: 4000, // 4 seconds connection timeout (increased)
      maxPoolSize: 5, // Reduce pool size for faster initialization
      minPoolSize: 0, // No min pool - don't pre-connect
      // Reduce retry attempts for faster failure
      retryWrites: true,
      retryReads: true,
      // Disable auto-reconnect to fail faster
      bufferMaxEntries: 0,
      bufferCommands: false,
      // Optimize for serverless/cloud
      heartbeatFrequencyMS: 10000,
      retryReads: true,
      directConnection: false, // Use replica set
    })
    isDBConnected = true
    console.log(' MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    // Close any partial connections
    try {
      await mongoose.disconnect()
    } catch (e) {
      // Ignore disconnect errors
    }
    isDBConnected = false // Reset flag on error
    throw error
  }
}

app.get('/', (_req, res) => {
  res.json({ ok: true, name: 'Taieba Academy API' })
})

app.use('/api/courses', authMiddleware.optional, coursesRouter)
app.use('/api/enrollments', authMiddleware.required, enrollmentsRouter)

export default app

