import { getFirebaseAdmin } from '../firebaseAdmin.js'

export const authMiddleware = {
  required: async (req, res, next) => {
    try {
      const firebaseAdmin = getFirebaseAdmin()
      if (!firebaseAdmin) {
        console.error('Firebase admin is not configured')
        return res.status(500).json({
          message: 'Firebase admin is not configured on the server.'
        })
      }

      const header = req.headers.authorization || ''
      const token = header.startsWith('Bearer ') ? header.slice(7) : null
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized - No token provided' })
      }
      
      try {
        const decoded = await firebaseAdmin.auth().verifyIdToken(token)
        req.user = decoded
        next()
      } catch (error) {
        console.error('Token verification error:', error.message)
        return res.status(401).json({ message: 'Invalid or expired token' })
      }
    } catch (error) {
      console.error('Auth middleware error:', error)
      return res.status(500).json({ message: 'Authentication error' })
    }
  },
  optional: async (req, _res, next) => {
    try {
      const firebaseAdmin = getFirebaseAdmin()
      if (!firebaseAdmin) {
        return next()
      }

      const header = req.headers.authorization || ''
      const token = header.startsWith('Bearer ') ? header.slice(7) : null
      if (token) {
        try {
          const decoded = await firebaseAdmin.auth().verifyIdToken(token)
          req.user = decoded
        } catch (error) {
          console.error('Token verification failed in optional middleware:', error.message)
          // Continue without user for optional routes
        }
      }
      next()
    } catch (error) {
      console.error('Optional auth middleware error:', error)
      next()
    }
  }
}

