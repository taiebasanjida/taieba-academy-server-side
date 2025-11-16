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
app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  credentials: true,
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
      serverSelectionTimeoutMS: 5000, // 5 seconds to select server
      socketTimeoutMS: 10000, // 10 seconds socket timeout
      connectTimeoutMS: 5000, // 5 seconds connection timeout
      maxPoolSize: 10,
      minPoolSize: 1,
    })
    isDBConnected = true
    console.log(' MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    throw error
  }
}

app.get('/', (_req, res) => {
  res.json({ ok: true, name: 'Taieba Academy API' })
})

app.use('/api/courses', authMiddleware.optional, coursesRouter)
app.use('/api/enrollments', authMiddleware.required, enrollmentsRouter)

export default app

