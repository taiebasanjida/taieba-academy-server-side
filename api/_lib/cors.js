const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

function isLocalhost(origin = '') {
  return origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')
}

export function applyCors(req, res) {
  try {
    const originHeader = req.headers.origin || req.headers.referer || req.headers.Origin || '*'
    const allowAll = allowedOrigins.length === 0
    const isAllowed = allowAll || allowedOrigins.includes(originHeader) || isLocalhost(originHeader)

    // Always allow localhost for development
    if (isLocalhost(originHeader)) {
      if (!res.headersSent) {
        res.setHeader('Access-Control-Allow-Origin', originHeader)
      }
    } else if (originHeader === '*' || !originHeader) {
      if (!res.headersSent) {
        res.setHeader('Access-Control-Allow-Origin', '*')
      }
    } else if (isAllowed) {
      if (!res.headersSent) {
        res.setHeader('Access-Control-Allow-Origin', originHeader)
      }
    } else {
      // Still set CORS headers but with wildcard for safety
      if (!res.headersSent) {
        res.setHeader('Access-Control-Allow-Origin', '*')
      }
    }

    if (!res.headersSent) {
      res.setHeader('Access-Control-Allow-Credentials', 'true')
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
      res.setHeader('Access-Control-Max-Age', '86400') // 24 hours
      res.setHeader('Vary', 'Origin')
    }
    return true
  } catch (error) {
    console.error('[CORS] Error applying CORS:', error)
    // Fallback: allow all origins if there's an error
    try {
      if (!res.headersSent) {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      }
      return true
    } catch {
      // If headers already sent, just return true
      return true
    }
  }
}

export function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    try {
      // Always set CORS headers for OPTIONS, even if applyCors fails
      const origin = req.headers.origin || req.headers.referer || req.headers.Origin || '*'
      const isLocalhost = origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')
      
      if (isLocalhost || !origin || origin === '*') {
        res.setHeader('Access-Control-Allow-Origin', origin === '*' ? '*' : origin)
      } else {
        res.setHeader('Access-Control-Allow-Origin', origin)
      }
      
      res.setHeader('Access-Control-Allow-Credentials', 'true')
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
      res.setHeader('Access-Control-Max-Age', '86400')
      
      if (!res.headersSent) {
        res.statusCode = 204
        res.end()
      }
      return true
    } catch (error) {
      console.error('[CORS] Options handler error:', error)
      // Last resort: set minimal CORS headers
      try {
        if (!res.headersSent) {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
          res.statusCode = 204
          res.end()
        }
      } catch {
        // If even this fails, just return
      }
      return true
    }
  }
  return false
}

