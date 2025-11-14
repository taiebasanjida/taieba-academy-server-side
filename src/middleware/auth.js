import { getFirebaseAdmin } from '../firebaseAdmin.js'

export const authMiddleware = {
  required: async (req, res, next) => {
    const firebaseAdmin = getFirebaseAdmin()
    if (!firebaseAdmin) {
      return res.status(500).json({
        message: 'Firebase admin is not configured on the server.'
      })
    }

    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    try {
      const decoded = await firebaseAdmin.auth().verifyIdToken(token)
      req.user = decoded
      next()
    } catch {
      res.status(401).json({ message: 'Invalid token' })
    }
  },
  optional: async (req, _res, next) => {
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
      } catch {
        // ignore
      }
    }
    next()
  }
}

