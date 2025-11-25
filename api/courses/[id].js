import 'dotenv/config'
import mongoose from 'mongoose'
import Course from '../../src/models/Course.js'
import { connectToDatabase } from '../_lib/db.js'
import { createHandler } from '../_lib/http.js'
import { requireUser, getOptionalUser } from '../_lib/auth.js'

function getCourseId(req) {
  // Vercel extracts dynamic route params from filename [id].js into req.query.id
  let id = req.query?.id || req.query?.courseId
  
  // If not in query, try to extract from URL path
  // Handle both /api/courses/ID and /courses/ID patterns
  if (!id && req.url) {
    // Try /api/courses/ID first
    let match = req.url.match(/\/api\/courses\/([^/?]+)/)
    if (!match) {
      // Try /courses/ID
      match = req.url.match(/\/courses\/([^/?]+)/)
    }
    if (match) {
      id = match[1]
    }
  }
  
  // Also check if id is in the path segments (Vercel might put it there)
  if (!id && req.url) {
    const parts = req.url.split('/').filter(Boolean)
    const coursesIndex = parts.indexOf('courses')
    if (coursesIndex >= 0 && coursesIndex < parts.length - 1) {
      id = parts[coursesIndex + 1]
    }
  }
  
  return Array.isArray(id) ? id[0] : id
}

async function getCourse(req, res) {
  const id = getCourseId(req)
  console.log('[COURSE] Fetching course:', { id, url: req.url, query: req.query })
  
  if (!id) {
    return res.status(400).json({ message: 'Course ID is required' })
  }
  
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid course ID' })
  }

  const course = await Course.findById(id).lean()
  if (!course) {
    return res.status(404).json({ message: 'Not found' })
  }
  return res.status(200).json(course)
}

async function updateCourse(req, res) {
  const user = await requireUser(req)
  const id = getCourseId(req)
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid course ID' })
  }

  const course = await Course.findById(id)
  if (!course) {
    return res.status(404).json({ message: 'Not found' })
  }
  
  // Case-insensitive email comparison
  const userEmail = user.email?.toLowerCase().trim()
  const courseEmail = course.instructor?.email?.toLowerCase().trim()
  if (courseEmail !== userEmail) {
    return res.status(403).json({ message: 'Forbidden' })
  }

  // Normalize email in instructor data if provided
  if (req.body?.instructor?.email) {
    req.body.instructor.email = req.body.instructor.email.toLowerCase().trim()
  }

  Object.assign(course, req.body || {})
  await course.save()
  return res.status(200).json(course)
}

async function deleteCourse(req, res) {
  const user = await requireUser(req)
  const id = getCourseId(req)
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid course ID' })
  }

  const course = await Course.findById(id)
  if (!course) {
    return res.status(404).json({ message: 'Not found' })
  }
  
  // Case-insensitive email comparison
  const userEmail = user.email?.toLowerCase().trim()
  const courseEmail = course.instructor?.email?.toLowerCase().trim()
  if (courseEmail !== userEmail) {
    return res.status(403).json({ message: 'Forbidden' })
  }

  await course.deleteOne()
  return res.status(204).end()
}

export default createHandler(async (req, res) => {
  const requestId = `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  console.log(`[COURSE] [${requestId}] Request received:`, {
    method: req.method,
    url: req.url,
    path: req.url?.split('?')[0],
    query: req.query,
    headers: {
      origin: req.headers.origin,
      'user-agent': req.headers['user-agent']?.substring(0, 50)
    }
  })

  try {
    await connectToDatabase()
    console.log(`[COURSE] [${requestId}] Database connected`)
    
    await getOptionalUser(req)
    console.log(`[COURSE] [${requestId}] User check complete`)

    if (req.method === 'GET') {
      console.log(`[COURSE] [${requestId}] Handling GET request`)
      return getCourse(req, res)
    }
    if (req.method === 'PUT') {
      return updateCourse(req, res)
    }
    if (req.method === 'DELETE') {
      return deleteCourse(req, res)
    }

    console.log(`[COURSE] [${requestId}] Method not allowed: ${req.method}`)
    res.status(405).json({ message: 'Method not allowed' })
  } catch (error) {
    console.error(`[COURSE] [${requestId}] Handler error:`, error)
    throw error // Let createHandler handle it
  }
})

