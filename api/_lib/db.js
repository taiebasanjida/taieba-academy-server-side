import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGO_URL || process.env.MONGO_URI

if (!MONGO_URI) {
  throw new Error('Missing MONGO_URL or MONGO_URI environment variable')
}

const globalCache = globalThis.__MONGOOSE_CACHE__ || {
  conn: null,
  promise: null,
  lastError: null,
}

globalThis.__MONGOOSE_CACHE__ = globalCache

const CONNECT_TIMEOUT = Number(process.env.DB_CONNECT_TIMEOUT_MS || 4000)

export async function connectToDatabase() {
  if (globalCache.conn) {
    return globalCache.conn
  }

  if (!globalCache.promise) {
    globalCache.promise = mongoose.connect(MONGO_URI, {
      maxPoolSize: 1,
      minPoolSize: 0,
      serverSelectionTimeoutMS: CONNECT_TIMEOUT,
      socketTimeoutMS: CONNECT_TIMEOUT + 1500,
      connectTimeoutMS: CONNECT_TIMEOUT,
      retryWrites: true,
      w: 'majority',
      bufferCommands: false,
      maxIdleTimeMS: 10000,
      heartbeatFrequencyMS: 10000,
      autoIndex: false,
      autoCreate: false,
      directConnection: false,
    }).then((connection) => {
      globalCache.conn = connection
      return connection
    }).catch((error) => {
      globalCache.promise = null
      globalCache.lastError = error
      throw error
    })
  }

  return globalCache.promise
}

