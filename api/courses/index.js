import 'dotenv/config'
import Course from '../../src/models/Course.js'
import { connectToDatabase } from '../_lib/db.js'
import { createHandler } from '../_lib/http.js'
import { getOptionalUser, requireUser } from '../_lib/auth.js'

const coursesCache = new Map()
const CACHE_TTL = 30_000

function cacheKey(query) {
  return JSON.stringify({
    category: query.category || 'all',
  })
}

function getCachedResponse(key) {
  const cached = coursesCache.get(key)
  if (!cached) return null
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    coursesCache.delete(key)
    return null
  }
  return cached.payload
}

function setCachedResponse(key, payload) {
  if (coursesCache.size > 25) {
    const firstKey = coursesCache.keys().next().value
    coursesCache.delete(firstKey)
  }
  coursesCache.set(key, { payload, timestamp: Date.now() })
}

async function listCourses(req, res) {
  const key = cacheKey(req.query || {})
  const cached = getCachedResponse(key)
  if (cached) {
    return res.status(200).json(cached)
  }

  const filter = {}
  if (req.query?.category) {
    filter.category = req.query.category
  }

  const courses = await Course.find(filter)
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()
    .select('title imageUrl price duration category description isFeatured ratingAverage ratingCount instructor createdAt updatedAt')

  const payload = { courses }
  setCachedResponse(key, payload)
  return res.status(200).json(payload)
}

async function createCourse(req, res) {
  const user = await requireUser(req)
  if (!user?.email) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const body = req.body || {}
  if (!body.title) {
    return res.status(400).json({ message: 'Title is required' })
  }

  const course = await Course.create({
    ...body,
    instructor: body.instructor || { email: user.email },
  })

  return res.status(201).json(course)
}

export default createHandler(async (req, res) => {
  await connectToDatabase()
  await getOptionalUser(req)

  if (req.method === 'GET') {
    return listCourses(req, res)
  }

  if (req.method === 'POST') {
    return createCourse(req, res)
  }

  res.status(405).json({ message: 'Method not allowed' })
})

