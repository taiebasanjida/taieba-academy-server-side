// Vercel Serverless Function Entry Point
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import coursesRouter from '../src/routes/courses.js'
import enrollmentsRouter from '../src/routes/enrollments.js'
import { authMiddleware } from '../src/middleware/auth.js'

dotenv.config()

const app = express()

// CORS configuration
const allowedOrigins = process.env.CLIENT_ORIGIN?.split(',') || ['*']
app.use(cors({ 
  origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
  credentials: true 
}))

app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

// MongoDB connection (reuse connection if exists)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taieba_academy'

if (!mongoose.connection.readyState) {
  mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('✅ MongoDB connected successfully')
  }).catch(err => {
    console.error('❌ MongoDB connection error:', err)
  })
}

// Routes
app.get('/', (_req, res) => {
  res.json({ ok: true, name: 'Taieba Academy API', version: '1.0.0' })
})

app.use('/api/courses', authMiddleware.optional, coursesRouter)
app.use('/api/enrollments', authMiddleware.required, enrollmentsRouter)

// Export for Vercel
export default app

