import { Router } from 'express'
import mongoose from 'mongoose'
import Enrollment from '../models/Enrollment.js'
import Course from '../models/Course.js'

const router = Router()

// Background task queue for heavy operations
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

// OPTIMIZED: updateCourseRating as background task (non-blocking)
async function updateCourseRating(courseId) {
  try {
    const stats = await Enrollment.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
          rating: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$course',
          average: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ])
    const summary = stats[0] || { average: 0, count: 0 }
    await Course.findByIdAndUpdate(courseId, {
      ratingAverage: Number(summary.average?.toFixed(2)) || 0,
      ratingCount: summary.count || 0
    })
    console.log(`[BACKGROUND] Updated rating for course ${courseId}`)
  } catch (error) {
    console.error(`[BACKGROUND] Failed to update rating for course ${courseId}:`, error.message)
  }
}

// POST /api/enrollments
router.post('/', async (req, res) => {
  const startTime = Date.now()
  const requestId = `enroll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  logPerformance('POST /api/enrollments', 0, { requestId, email: req.user?.email })
  
  const userEmail = req.user?.email
  if (!userEmail) return res.status(401).json({ message: 'Unauthorized' })
  
  try {
    const { courseId } = req.body
    
    const exists = await Promise.race([
      Enrollment.findOne({ userEmail, course: courseId }).lean(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 2000)
      )
    ])
    
    if (exists) {
      const elapsed = Date.now() - startTime
      logPerformance('POST /api/enrollments (EXISTS)', elapsed, { requestId })
      return res.status(200).json(exists)
    }
    
    const enroll = await Promise.race([
      Enrollment.create({ userEmail, course: courseId }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Create timeout')), 2000)
      )
    ])
    
    const elapsed = Date.now() - startTime
    logPerformance('POST /api/enrollments (SUCCESS)', elapsed, { requestId })
    res.setHeader('X-Response-Time', `${elapsed}ms`)
    res.status(201).json(enroll)
  } catch (error) {
    const elapsed = Date.now() - startTime
    logPerformance('POST /api/enrollments (ERROR)', elapsed, { requestId, error: error.message })
    
    if (error.message.includes('timeout')) {
      return res.status(504).json({ message: 'Request timeout' })
    }
    res.status(500).json({ message: 'Failed to create enrollment' })
  }
})

// GET /api/enrollments/status/:courseId
router.get('/status/:courseId', async (req, res) => {
  const startTime = Date.now()
  const requestId = `status-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  logPerformance('GET /api/enrollments/status/:courseId', 0, { requestId, courseId: req.params.courseId })
  
  const userEmail = req.user?.email
  if (!userEmail) return res.status(401).json({ message: 'Unauthorized' })
  
  try {
    const { courseId } = req.params
    const enrollment = await Promise.race([
      Enrollment.findOne({ userEmail, course: courseId }).lean(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 2000)
      )
    ])
    
    const elapsed = Date.now() - startTime
    logPerformance('GET /api/enrollments/status/:courseId (SUCCESS)', elapsed, { requestId })
    res.setHeader('X-Response-Time', `${elapsed}ms`)
    res.json({ enrolled: !!enrollment })
  } catch (error) {
    const elapsed = Date.now() - startTime
    logPerformance('GET /api/enrollments/status/:courseId (ERROR)', elapsed, { requestId, error: error.message })
    
    if (error.message.includes('timeout')) {
      return res.json({ enrolled: false, error: 'Request timeout' })
    }
    res.status(500).json({ message: 'Failed to check enrollment status' })
  }
})

// GET /api/enrollments/mine
router.get('/mine', async (req, res) => {
  const startTime = Date.now()
  const requestId = `mine-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  logPerformance('GET /api/enrollments/mine', 0, { requestId, email: req.user?.email })
  
  try {
    const userEmail = req.user?.email
    if (!userEmail) return res.status(401).json({ message: 'Unauthorized' })
    
    // CRITICAL: Remove populate() - load courses separately for better performance
    const enrollments = await Promise.race([
      Enrollment.find({ userEmail })
        .sort({ createdAt: -1 })
        .lean()
        .select('userEmail course progress rating review completedAt createdAt updatedAt'),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 2500)
      )
    ])
    
    // Early return if no enrollments
    if (enrollments.length === 0) {
      const elapsed = Date.now() - startTime
      logPerformance('GET /api/enrollments/mine (EMPTY)', elapsed, { requestId })
      return res.json([])
    }
    
    // Get unique course IDs
    const courseIds = [...new Set(enrollments.map(e => e.course?.toString()).filter(Boolean))]
    
    // Load courses separately (much faster than populate) with timeout
    const courses = await Promise.race([
      Course.find({ _id: { $in: courseIds } })
        .lean()
        .select('title imageUrl price category instructor duration description'),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Courses query timeout')), 2000)
      )
    ])
    
    // Create a map for fast lookup
    const courseMap = new Map(courses.map(c => [c._id.toString(), c]))
    
    // Combine enrollments with course data
    const enrichedEnrollments = enrollments.map(enrollment => ({
      ...enrollment,
      course: enrollment.course ? courseMap.get(enrollment.course.toString()) || null : null
    }))
    
    const elapsed = Date.now() - startTime
    logPerformance('GET /api/enrollments/mine (SUCCESS)', elapsed, { requestId, count: enrichedEnrollments.length })
    res.setHeader('X-Response-Time', `${elapsed}ms`)
    res.json(enrichedEnrollments)
  } catch (error) {
    const elapsed = Date.now() - startTime
    logPerformance('GET /api/enrollments/mine (ERROR)', elapsed, { requestId, error: error.message })
    console.error('Error fetching user enrollments:', error)
    
    if (error.message.includes('timeout')) {
      return res.status(504).json({ message: 'Request timeout', enrollments: [] })
    }
    res.status(500).json({ message: 'Failed to load enrollments' })
  }
})

// PATCH /api/enrollments/:id/progress
router.patch('/:id/progress', async (req, res) => {
  const startTime = Date.now()
  const requestId = `progress-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  logPerformance('PATCH /api/enrollments/:id/progress', 0, { requestId, enrollmentId: req.params.id })
  
  const userEmail = req.user?.email
  if (!userEmail) return res.status(401).json({ message: 'Unauthorized' })
  
  try {
    const { id } = req.params
    const { progress } = req.body
    if (typeof progress === 'undefined') {
      return res.status(400).json({ message: 'Progress value is required' })
    }
    
    // OPTIMIZED: Remove populate() for better performance
    const enrollment = await Promise.race([
      Enrollment.findOne({ _id: id, userEmail }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 2000)
      )
    ])
    
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' })
    
    enrollment.progress = Math.max(0, Math.min(100, Number(progress)))
    if (enrollment.progress >= 100) {
      enrollment.completedAt = enrollment.completedAt || new Date()
    } else {
      enrollment.completedAt = null
    }
    
    await Promise.race([
      enrollment.save(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Save timeout')), 2000)
      )
    ])
    
    const elapsed = Date.now() - startTime
    logPerformance('PATCH /api/enrollments/:id/progress (SUCCESS)', elapsed, { requestId, progress: enrollment.progress })
    res.setHeader('X-Response-Time', `${elapsed}ms`)
    res.json(enrollment)
  } catch (error) {
    const elapsed = Date.now() - startTime
    logPerformance('PATCH /api/enrollments/:id/progress (ERROR)', elapsed, { requestId, error: error.message })
    
    if (error.message.includes('timeout')) {
      return res.status(504).json({ message: 'Request timeout' })
    }
    res.status(500).json({ message: 'Failed to update progress' })
  }
})

// POST /api/enrollments/:id/rating
router.post('/:id/rating', async (req, res) => {
  const startTime = Date.now()
  const requestId = `rating-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  logPerformance('POST /api/enrollments/:id/rating', 0, { requestId, enrollmentId: req.params.id })
  
  const userEmail = req.user?.email
  if (!userEmail) return res.status(401).json({ message: 'Unauthorized' })
  
  try {
    const { id } = req.params
    const { rating, review } = req.body
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' })
    }
    
    const enrollment = await Promise.race([
      Enrollment.findOne({ _id: id, userEmail }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 2000)
      )
    ])
    
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' })
    if (enrollment.progress < 100) {
      return res.status(400).json({ message: 'Complete the course before leaving a review' })
    }
    
    enrollment.rating = rating
    enrollment.review = review || ''
    await Promise.race([
      enrollment.save(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Save timeout')), 2000)
      )
    ])
    
    // OPTIMIZED: Run updateCourseRating in background (non-blocking)
    const courseId = enrollment.course.toString()
    queueBackgroundTask(() => updateCourseRating(courseId))
    
    // Also invalidate ratings cache for this course
    // (Note: This would need access to ratingsCache from courses.js, but for now we'll let cache expire naturally)
    
    const elapsed = Date.now() - startTime
    logPerformance('POST /api/enrollments/:id/rating (SUCCESS)', elapsed, { requestId, courseId })
    res.setHeader('X-Response-Time', `${elapsed}ms`)
    res.json(enrollment)
  } catch (error) {
    const elapsed = Date.now() - startTime
    logPerformance('POST /api/enrollments/:id/rating (ERROR)', elapsed, { requestId, error: error.message })
    
    if (error.message.includes('timeout')) {
      return res.status(504).json({ message: 'Request timeout' })
    }
    res.status(500).json({ message: 'Failed to save rating' })
  }
})

export default router

