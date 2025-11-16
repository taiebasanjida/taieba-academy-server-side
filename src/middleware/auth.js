import { getFirebaseAdmin } from '../firebaseAdmin.js'

// Helper function to decode JWT token without verification (for development only)
function decodeTokenUnverified(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
    return payload
  } catch (error) {
    return null
  }
}

export const authMiddleware = {
  required: async (req, res, next) => {
    try {
      const firebaseAdmin = getFirebaseAdmin()
      const isDevelopment = process.env.NODE_ENV === 'development'
      
      const header = req.headers.authorization || ''
      const token = header.startsWith('Bearer ') ? header.slice(7) : null
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized - No token provided' })
      }

      // If Firebase Admin is configured, use it for verification
      if (firebaseAdmin) {
        try {
          const decoded = await firebaseAdmin.auth().verifyIdToken(token)
          req.user = decoded
          return next()
        } catch (error) {
          console.error('Token verification error:', error.message)
          return res.status(401).json({ message: 'Invalid or expired token' })
        }
      }

      // Fallback for development mode when Firebase Admin is not configured
      if (isDevelopment) {
        console.warn('⚠️  Development mode: Using unverified token (Firebase Admin not configured)')
        const decoded = decodeTokenUnverified(token)
        if (decoded && decoded.email) {
          req.user = {
            uid: decoded.user_id || decoded.sub || decoded.uid,
            email: decoded.email,
            ...decoded
          }
          return next()
        }
        return res.status(401).json({ message: 'Invalid token format' })
      }

      // Production mode requires Firebase Admin
      console.error('Firebase admin is not configured')
      return res.status(500).json({
        message: 'Firebase admin is not configured on the server.'
      })
    } catch (error) {
      console.error('Auth middleware error:', error)
      return res.status(500).json({ message: 'Authentication error' })
    }
  },
  optional: async (req, _res, next) => {
    try {
      const firebaseAdmin = getFirebaseAdmin()
      const isDevelopment = process.env.NODE_ENV === 'development'

      const header = req.headers.authorization || ''
      const token = header.startsWith('Bearer ') ? header.slice(7) : null
      
      if (token) {
        // If Firebase Admin is configured, use it for verification
        if (firebaseAdmin) {
          try {
            const decoded = await firebaseAdmin.auth().verifyIdToken(token)
            req.user = decoded
          } catch (error) {
            console.error('Token verification failed in optional middleware:', error.message)
            // Continue without user for optional routes
          }
        } else if (isDevelopment) {
          // Fallback for development mode
          const decoded = decodeTokenUnverified(token)
          if (decoded && decoded.email) {
            req.user = {
              uid: decoded.user_id || decoded.sub || decoded.uid,
              email: decoded.email,
              ...decoded
            }
          }
        }
      }
      next()
    } catch (error) {
      console.error('Optional auth middleware error:', error)
      next()
    }
  }
}

