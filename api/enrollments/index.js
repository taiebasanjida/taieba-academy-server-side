import 'dotenv/config'
import Enrollment from '../../src/models/Enrollment.js'
import { connectToDatabase } from '../_lib/db.js'
import { createHandler } from '../_lib/http.js'
import { getOptionalUser, requireUser } from '../_lib/auth.js'

const enrollmentsCache = new Map()
const CACHE_TTL = 30_000

function getCacheKey(req) {
  return `${req.query?.limit || 10}`
}

function getCached(key) {
  const cached = enrollmentsCache.get(key)
  if (!cached) return null
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    enrollmentsCache.delete(key)
    return null
  }
  return cached.payload
}

function setCached(key, payload) {
  if (enrollmentsCache.size > 25) {
    const oldest = enrollmentsCache.keys().next().value
    enrollmentsCache.delete(oldest)
  }
  enrollmentsCache.set(key, { payload, timestamp: Date.now() })
}

async function listEnrollments(req, res) {
  const key = getCacheKey(req)
  const cached = getCached(key)
  if (cached) {
    res.setHeader('X-Cache', 'HIT')
    return res.status(200).json(cached)
  }

  const limit = Number(req.query?.limit || 10)

  const enrollments = await Enrollment.find()
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 25))
    .lean()
    .select('userEmail course progress rating review completedAt createdAt updatedAt')

  const payload = {
    enrollments,
    count: enrollments.length,
  }

  setCached(key, payload)
  res.setHeader('X-Cache', 'MISS')
  res.status(200).json(payload)
}

async function createEnrollment(req, res) {
  const user = await requireUser(req)
  const { courseId } = req.body || {}
  if (!courseId) {
    return res.status(400).json({ message: 'courseId is required' })
  }

  const existing = await Enrollment.findOne({ userEmail: user.email, course: courseId }).lean()
  if (existing) {
    return res.status(200).json(existing)
  }

  const enrollment = await Enrollment.create({ userEmail: user.email, course: courseId })
  return res.status(201).json(enrollment)
}

export default createHandler(async (req, res) => {
  await connectToDatabase()
  await getOptionalUser(req)

  if (req.method === 'GET') {
    return listEnrollments(req, res)
  }

  if (req.method === 'POST') {
    return createEnrollment(req, res)
  }

  res.status(405).json({ message: 'Method not allowed' })
})

