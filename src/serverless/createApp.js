import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import dotenv from 'dotenv'

dotenv.config()

function getAllowedOrigins() {
  return process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
    : []
}

export function createServerlessApp() {
  const app = express()
  const allowedOrigins = getAllowedOrigins()

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true)
      }
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      if (allowedOrigins.length === 0) {
        return callback(null, true)
      }
      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }))

  app.use(express.json({ limit: '1mb' }))
  app.use(morgan('dev'))

  return app
}

