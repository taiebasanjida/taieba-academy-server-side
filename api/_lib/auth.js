import { getFirebaseAdmin } from '../../src/firebaseAdmin.js'

const isDevelopment = process.env.NODE_ENV !== 'production'

function decodeTokenUnverified(token) {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const json = Buffer.from(payload, 'base64').toString('utf8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

async function verifyToken(token) {
  const firebaseAdmin = getFirebaseAdmin()
  if (firebaseAdmin) {
    return firebaseAdmin.auth().verifyIdToken(token)
  }

  if (isDevelopment) {
    return decodeTokenUnverified(token)
  }

  throw new Error('Firebase admin not configured')
}

function extractToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || ''
  if (header.startsWith('Bearer ')) {
    return header.slice(7)
  }
  return null
}

export async function getOptionalUser(req) {
  const token = extractToken(req)
  if (!token) return null
  try {
    const decoded = await verifyToken(token)
    if (decoded && decoded.email) {
      req.user = decoded
      return decoded
    }
  } catch (error) {
    console.warn('[AUTH] Optional token verification failed:', error.message)
  }
  return null
}

export async function requireUser(req) {
  const token = extractToken(req)
  if (!token) {
    console.error('[AUTH] No token found in request')
    throw Object.assign(new Error('Unauthorized'), { statusCode: 401 })
  }
  try {
    const decoded = await verifyToken(token)
    console.log('[AUTH] Decoded token:', { 
      email: decoded?.email, 
      uid: decoded?.uid, 
      sub: decoded?.sub,
      hasEmail: !!decoded?.email 
    })
    
    if (decoded && decoded.email) {
      req.user = decoded
      console.log('[AUTH] User authenticated:', decoded.email)
      return decoded
    } else {
      console.error('[AUTH] Token decoded but no email found:', decoded)
    }
  } catch (error) {
    console.error('[AUTH] Token verification error:', error.message)
    throw Object.assign(new Error('Invalid or expired token'), { statusCode: 401 })
  }
  console.error('[AUTH] No user email in token')
  throw Object.assign(new Error('Unauthorized'), { statusCode: 401 })
}

