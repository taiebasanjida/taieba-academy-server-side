import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import coursesRouter from './routes/courses.js'
import enrollmentsRouter from './routes/enrollments.js'
import { authMiddleware } from './middleware/auth.js'
import Enrollment from './models/Enrollment.js'

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
    // Use default Mongoose connection options (no legacy driver options)
    await mongoose.connect(MONGO_URI)
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

// GET /api/enrollments - No auth required for testing (MUST be before app.use)
app.get('/api/enrollments', async (req, res) => {
  try {
    const list = await Enrollment.find().populate('course').sort({ createdAt: -1 }).limit(100)
    res.json({ enrollments: list, count: list.length })
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    res.status(500).json({ message: 'Failed to load enrollments' })
  }
})

// All other enrollment routes require authentication
app.use('/api/enrollments', authMiddleware.required, enrollmentsRouter)

export default app

