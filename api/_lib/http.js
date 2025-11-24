import { applyCors, handleOptions } from './cors.js'

const NEEDS_BODY = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function ensureQuery(req) {
  if (req.query) {
    return req.query
  }
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const query = {}
  for (const [key, value] of url.searchParams.entries()) {
    query[key] = value
  }
  req.query = query
  req._parsedUrl = url
  return query
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}

  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function enhanceResponse(res) {
  if (res.__enhanced) return
  res.__enhanced = true
  
  // Ensure statusCode is set
  if (!res.statusCode) {
    res.statusCode = 200
  }
  
  res.status = function status(code) {
    if (!res.headersSent) {
      res.statusCode = code
    }
    return res
  }
  res.json = function json(payload) {
    if (res.headersSent) return res
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/json')
    }
    res.end(JSON.stringify(payload))
    return res
  }
  res.send = function send(payload) {
    if (res.headersSent) return res
    if (typeof payload === 'object') {
      if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', 'application/json')
      }
      res.end(JSON.stringify(payload))
    } else {
      res.end(payload)
    }
    return res
  }
}

export function createHandler(handler) {
  return async function handlerWrapper(req, res) {
    try {
      enhanceResponse(res)

      // Handle OPTIONS preflight requests first
      if (handleOptions(req, res)) {
        return
      }

      // Apply CORS headers
      if (!applyCors(req, res)) {
        if (!res.headersSent) {
          return res.status(403).json({ message: 'Not allowed by CORS' })
        }
        return
      }
    } catch (corsError) {
      console.error('[HTTP] CORS/Options error:', corsError)
      // Even if CORS fails, try to continue (for development)
      try {
        if (!res.headersSent) {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        }
      } catch {
        // Ignore
      }
    }

    try {
      ensureQuery(req)
      if (NEEDS_BODY.has(req.method) && typeof req.body === 'undefined') {
        req.body = await readBody(req)
      }
      await handler(req, res)
    } catch (error) {
      console.error('[API] Handler error:', error)
      if (!res.headersSent) {
        const statusCode = error.statusCode || 500
        res.status(statusCode).json({
          message: error.message || 'Internal server error',
          error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        })
      }
    }
  }
}

