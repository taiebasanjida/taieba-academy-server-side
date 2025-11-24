import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

const FALLBACK_LOCAL_URI = 'mongodb://127.0.0.1:27017/db_taieba_academy'
const envMongoUri = process.env.MONGO_URL || process.env.MONGO_URI
if (!envMongoUri) {
  console.warn('[DB] MONGO_URL/MONGO_URI not set. Falling back to local MongoDB URI.')
}

const MONGO_URI = envMongoUri || FALLBACK_LOCAL_URI
const DB_CONNECT_TIMEOUT_MS = Math.max(Number(process.env.DB_CONNECT_TIMEOUT_MS || 3500), 1000)
const DB_RETRY_COOLDOWN_MS = Number(process.env.DB_RETRY_COOLDOWN_MS || 60000)

if (MONGO_URI.includes('mongodb+srv://')) {
  const uriWithoutPassword = MONGO_URI.replace(/mongodb\+srv:\/\/[^:]+:[^@]+@/, 'mongodb+srv://***:***@')
  console.log('🔗 MongoDB URI:', uriWithoutPassword)
} else {
  console.log('🔗 MongoDB URI:', MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'))
}

let isDBConnected = false
let dbConnectPromise = null
let lastFailedConnectionAt = 0

export function getMongoUri() {
  return MONGO_URI
}

export async function ensureDatabase() {
  if (mongoose.connection.readyState === 1) {
    isDBConnected = true
    return
  }

  if (isDBConnected && mongoose.connection.readyState === 2) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Connection timeout')), DB_CONNECT_TIMEOUT_MS)
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

  const now = Date.now()
  if (now - lastFailedConnectionAt < DB_RETRY_COOLDOWN_MS) {
    throw new Error('Database cooldown active')
  }

  if (!dbConnectPromise) {
    const connectTimeout = Math.max(DB_CONNECT_TIMEOUT_MS - 500, 500)
    dbConnectPromise = (async () => {
      try {
        await mongoose.connect(MONGO_URI, {
          serverSelectionTimeoutMS: connectTimeout,
          socketTimeoutMS: DB_CONNECT_TIMEOUT_MS,
          connectTimeoutMS: connectTimeout,
          maxPoolSize: 1,
          minPoolSize: 0,
          retryWrites: true,
          w: 'majority',
          bufferCommands: false,
          maxIdleTimeMS: 10000,
          heartbeatFrequencyMS: 10000,
          autoIndex: false,
          autoCreate: false,
          directConnection: false,
        })
        isDBConnected = true
        lastFailedConnectionAt = 0
        console.log('✅ MongoDB connected successfully')
      } catch (error) {
        isDBConnected = false
        lastFailedConnectionAt = Date.now()
        console.error('❌ MongoDB connection error:', error.message)
        throw error
      } finally {
        dbConnectPromise = null
      }
    })()
  }

  await Promise.race([
    dbConnectPromise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout exceeded')), DB_CONNECT_TIMEOUT_MS)
    )
  ])
}

