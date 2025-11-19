import { Router } from 'express'
import mongoose from 'mongoose'
import Course from '../models/Course.js'
import Enrollment from '../models/Enrollment.js'

const router = Router()

// Simple cache for courses endpoint
const coursesCache = new Map()
const CACHE_TTL = 30000 // 30 seconds

// Cache for ratings endpoint (ratings don't change often)
const ratingsCache = new Map()
const RATINGS_CACHE_TTL = 60000 // 60 seconds

// Enhanced logging for Vercel Dashboard
function logPerformance(operation, duration, details = {}) {
  const logData = {
    operation,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
    ...details
  }
  console.log(`[PERF] ${operation}: ${duration}ms`, JSON.stringify(logData))
}

// Background task queue (simple in-memory queue for serverless)
const backgroundTasks = []
let isProcessingBackground = false

async function processBackgroundTasks() {
  if (isProcessingBackground) return
  isProcessingBackground = true
  
  while (backgroundTasks.length > 0) {
    const task = backgroundTasks.shift()
    try {
      await task()
    } catch (error) {
      console.error('[BACKGROUND] Task failed:', error.message)
    }
  }
  
  isProcessingBackground = false
}

function queueBackgroundTask(task) {
  backgroundTasks.push(task)
  // Process in background (non-blocking)
  setImmediate(() => processBackgroundTasks())
}

// GET /api/courses?category=design
router.get('/', async (req, res) => {
  const startTime = Date.now()
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  logPerformance('GET /api/courses', 0, { requestId, category: req.query.category, skipDB: req.skipDB })
  
  // Fast path: If DB connection failed, return empty data immediately
  if (req.skipDB) {
    const elapsed = Date.now() - startTime
    logPerformance('GET /api/courses (skipDB)', elapsed, { requestId })
    res.setHeader('X-DB-Status', 'skipped')
    res.setHeader('Cache-Control', 'public, max-age=5')
    return res.json({ courses: [], error: 'Database unavailable' })
  }
  
  try {
    // Check cache first (Free Tier optimization)
    const cacheKey = `courses:${req.query.category || 'all'}`
    const cached = coursesCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      const elapsed = Date.now() - startTime
      logPerformance('GET /api/courses (CACHE HIT)', elapsed, { requestId, cacheKey })
      res.setHeader('X-Cache', 'HIT')
      res.setHeader('Cache-Control', 'public, max-age=30')
      return res.json(cached.data)
    }
    
    const { category } = req.query
    const query = {}
    if (category) query.category = category
    
    const queryStartTime = Date.now()
    // ULTRA-FAST: Add timeout to query itself
    // VERY aggressive timeout - 1.5 seconds max (reduced for safety)
    const courses = await Promise.race([
      Course.find(query)
        .sort({ createdAt: -1 })
        .limit(10) // Reduced to 10 for speed
        .lean()
        .select('title imageUrl price duration category description isFeatured ratingAverage ratingCount instructor createdAt updatedAt'),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 1500) // 1.5 seconds max - match enrollments
      )
    ])
    const queryTime = Date.now() - queryStartTime
    logPerformance('GET /api/courses (DB Query)', queryTime, { requestId, count: courses.length })
    
    const response = { courses }
    
    // Cache the response
    if (coursesCache.size >= 10) {
      const firstKey = coursesCache.keys().next().value
      coursesCache.delete(firstKey)
    }
    coursesCache.set(cacheKey, { data: response, timestamp: Date.now() })
    
    const elapsed = Date.now() - startTime
    logPerformance('GET /api/courses (SUCCESS)', elapsed, { requestId, cacheKey, count: courses.length })
    res.setHeader('X-Cache', 'MISS')
    res.setHeader('Cache-Control', 'public, max-age=30')
    res.setHeader('X-Response-Time', `${elapsed}ms`)
    res.json(response)
  } catch (error) {
    const elapsed = Date.now() - startTime
    logPerformance('GET /api/courses (ERROR)', elapsed, { requestId, error: error.message })
    console.error('Error fetching courses:', error)
    
    // Return empty response on timeout instead of error
    if (error.message.includes('timeout') || elapsed > 8000) {
      res.setHeader('X-Error', 'timeout')
      return res.json({ courses: [], error: 'Request timeout' })
    }
    res.status(500).json({ message: 'Failed to load courses' })
  }
})

// GET /api/courses/mine - by instructor email
router.get('/mine', async (req, res) => {
  const startTime = Date.now()
  const requestId = `mine-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  logPerformance('GET /api/courses/mine', 0, { requestId, email: req.user?.email })
  
  try {
    if (!req.user?.email) {
      return res.status(401).json({ message: 'Unauthorized - Please login to view your courses' })
    }
    
    const courses = await Promise.race([
      Course.find({ 'instructor.email': req.user.email })
        .sort({ createdAt: -1 })
        .lean()
        .select('title imageUrl price duration category description isFeatured ratingAverage ratingCount instructor createdAt updatedAt'),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 2500)
      )
    ])
    
    const elapsed = Date.now() - startTime
    logPerformance('GET /api/courses/mine (SUCCESS)', elapsed, { requestId, count: courses.length })
    res.setHeader('X-Response-Time', `${elapsed}ms`)
    res.json(courses)
  } catch (error) {
    const elapsed = Date.now() - startTime
    logPerformance('GET /api/courses/mine (ERROR)', elapsed, { requestId, error: error.message })
    console.error('Error fetching user courses:', error)
    
    if (error.message.includes('timeout')) {
      return res.status(504).json({ message: 'Request timeout' })
    }
    res.status(500).json({ message: 'Failed to load courses' })
  }
})

// GET /api/courses/count - Get total number of courses
router.get('/count', async (req, res) => {
  const startTime = Date.now()
  const requestId = `count-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  logPerformance('GET /api/courses/count', 0, { requestId })
  
  try {
    const count = await Promise.race([
      Course.countDocuments(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 2000)
      )
    ])
    
    const elapsed = Date.now() - startTime
    logPerformance('GET /api/courses/count (SUCCESS)', elapsed, { requestId, count })
    res.setHeader('X-Response-Time', `${elapsed}ms`)
    res.json({ count })
  } catch (error) {
    const elapsed = Date.now() - startTime
    logPerformance('GET /api/courses/count (ERROR)', elapsed, { requestId, error: error.message })
    console.error('Error counting courses:', error)
    
    if (error.message.includes('timeout')) {
      return res.status(504).json({ message: 'Request timeout', count: 0 })
    }
    res.status(500).json({ message: 'Failed to count courses' })
  }
})

// GET /api/courses/:id
router.get('/:id', async (req, res) => {
  const startTime = Date.now()
  const { id } = req.params
  const requestId = `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  logPerformance('GET /api/courses/:id', 0, { requestId, courseId: id })
  
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid course ID' })
  }
  
  try {
    const course = await Promise.race([
      Course.findById(id).lean(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 2000)
      )
    ])
    
    if (!course) {
      const elapsed = Date.now() - startTime
      logPerformance('GET /api/courses/:id (NOT FOUND)', elapsed, { requestId, courseId: id })
      return res.status(404).json({ message: 'Not found' })
    }
    
    const elapsed = Date.now() - startTime
    logPerformance('GET /api/courses/:id (SUCCESS)', elapsed, { requestId, courseId: id })
    res.setHeader('X-Response-Time', `${elapsed}ms`)
    res.json(course)
  } catch (error) {
    const elapsed = Date.now() - startTime
    logPerformance('GET /api/courses/:id (ERROR)', elapsed, { requestId, courseId: id, error: error.message })
    
    if (error.message.includes('timeout')) {
      return res.status(504).json({ message: 'Request timeout' })
    }
    res.status(500).json({ message: 'Failed to load course' })
  }
})

// GET /api/courses/:id/ratings
router.get('/:id/ratings', async (req, res) => {
  const startTime = Date.now()
  const { id } = req.params
  const requestId = `ratings-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  logPerformance('GET /api/courses/:id/ratings', 0, { requestId, courseId: id })
  
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid course ID' })
  }
  
  // Check cache first
  const cacheKey = `ratings:${id}`
  const cached = ratingsCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < RATINGS_CACHE_TTL) {
    const elapsed = Date.now() - startTime
    logPerformance('GET /api/courses/:id/ratings (CACHE HIT)', elapsed, { requestId, courseId: id })
    res.setHeader('X-Cache', 'HIT')
    res.setHeader('Cache-Control', 'public, max-age=60')
    return res.json(cached.data)
  }
  
  try {
    const matchStage = {
      $match: {
        course: new mongoose.Types.ObjectId(id),
        rating: { $exists: true, $ne: null }
      }
    }
    
    // OPTIMIZED: Run all queries in parallel with timeouts
    const [summary, breakdownRaw, reviews] = await Promise.all([
      Promise.race([
        Enrollment.aggregate([
          matchStage,
          {
            $group: {
              _id: '$course',
              average: { $avg: '$rating' },
              count: { $sum: 1 }
            }
          }
        ]),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Summary query timeout')), 2000)
        )
      ]),
      Promise.race([
        Enrollment.aggregate([
          matchStage,
          {
            $group: {
              _id: '$rating',
              count: { $sum: 1 }
            }
          }
        ]),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Breakdown query timeout')), 2000)
        )
      ]),
      Promise.race([
        Enrollment.find({
          course: id,
          rating: { $exists: true, $ne: null },
          review: { $ne: '' }
        })
          .sort({ updatedAt: -1 })
          .limit(6)
          .lean()
          .select('rating review userEmail updatedAt'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Reviews query timeout')), 2000)
        )
      ])
    ])
    
    const breakdown = breakdownRaw.reduce((acc, item) => {
      acc[item._id] = item.count
      return acc
    }, {})

    const response = {
      average: Number(summary[0]?.average?.toFixed(2)) || 0,
      count: summary[0]?.count || 0,
      breakdown,
      reviews
    }
    
    // Cache the response
    if (ratingsCache.size >= 20) {
      const firstKey = ratingsCache.keys().next().value
      ratingsCache.delete(firstKey)
    }
    ratingsCache.set(cacheKey, { data: response, timestamp: Date.now() })
    
    const elapsed = Date.now() - startTime
    logPerformance('GET /api/courses/:id/ratings (SUCCESS)', elapsed, { requestId, courseId: id })
    res.setHeader('X-Cache', 'MISS')
    res.setHeader('Cache-Control', 'public, max-age=60')
    res.setHeader('X-Response-Time', `${elapsed}ms`)
    res.json(response)
  } catch (error) {
    const elapsed = Date.now() - startTime
    logPerformance('GET /api/courses/:id/ratings (ERROR)', elapsed, { requestId, courseId: id, error: error.message })
    console.error('Error fetching ratings:', error)
    
    // Return default response on timeout
    if (error.message.includes('timeout') || elapsed > 8000) {
      res.setHeader('X-Error', 'timeout')
      return res.json({
        average: 0,
        count: 0,
        breakdown: {},
        reviews: [],
        error: 'Request timeout'
      })
    }
    res.status(500).json({ message: 'Failed to load ratings' })
  }
})

// POST /api/courses
router.post('/', async (req, res) => {
  if (!req.user?.email) return res.status(401).json({ message: 'Unauthorized' })
  const body = req.body
  const course = await Course.create(body)
  res.status(201).json(course)
})

// PUT /api/courses/:id
router.put('/:id', async (req, res) => {
  if (!req.user?.email) return res.status(401).json({ message: 'Unauthorized' })
  const course = await Course.findById(req.params.id)
  if (!course) return res.status(404).json({ message: 'Not found' })
  if (course.instructor?.email !== req.user.email) return res.status(403).json({ message: 'Forbidden' })
  Object.assign(course, req.body)
  await course.save()
  res.json(course)
})

// DELETE /api/courses/:id
router.delete('/:id', async (req, res) => {
  if (!req.user?.email) return res.status(401).json({ message: 'Unauthorized' })
  const course = await Course.findById(req.params.id)
  if (!course) return res.status(404).json({ message: 'Not found' })
  if (course.instructor?.email !== req.user.email) return res.status(403).json({ message: 'Forbidden' })
  await course.deleteOne()
  res.status(204).end()
})

export default router

