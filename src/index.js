import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import coursesRouter from './routes/courses.js'
import enrollmentsRouter from './routes/enrollments.js'
import { authMiddleware } from './middleware/auth.js'

dotenv.config()

const app = express()
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || '*', credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taieba_academy'

mongoose.connect(MONGO_URI).then(() => {
  console.log('✅ MongoDB connected successfully')
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message)
  process.exit(1)
})

app.get('/', (_req, res) => {
  res.json({ ok: true, name: 'Taieba Academy API' })
})

app.use('/api/courses', authMiddleware.optional, coursesRouter)
app.use('/api/enrollments', authMiddleware.required, enrollmentsRouter)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`)
})

