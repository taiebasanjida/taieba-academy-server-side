import { Router } from 'express'
import mongoose from 'mongoose'
import Enrollment from '../models/Enrollment.js'
import Course from '../models/Course.js'

const router = Router()

async function updateCourseRating(courseId) {
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
}

// POST /api/enrollments
router.post('/', async (req, res) => {
  const userEmail = req.user?.email
  if (!userEmail) return res.status(401).json({ message: 'Unauthorized' })
  const { courseId } = req.body
  const exists = await Enrollment.findOne({ userEmail, course: courseId })
  if (exists) return res.status(200).json(exists)
  const enroll = await Enrollment.create({ userEmail, course: courseId })
  res.status(201).json(enroll)
})

// GET /api/enrollments/status/:courseId
router.get('/status/:courseId', async (req, res) => {
  const userEmail = req.user?.email
  if (!userEmail) return res.status(401).json({ message: 'Unauthorized' })
  const { courseId } = req.params
  const enrollment = await Enrollment.findOne({ userEmail, course: courseId })
  res.json({ enrolled: !!enrollment })
})

// GET /api/enrollments/mine
router.get('/mine', async (req, res) => {
  const userEmail = req.user?.email
  if (!userEmail) return res.status(401).json({ message: 'Unauthorized' })
  const list = await Enrollment.find({ userEmail }).populate('course').sort({ createdAt: -1 })
  res.json(list)
})

// PATCH /api/enrollments/:id/progress
router.patch('/:id/progress', async (req, res) => {
  const userEmail = req.user?.email
  if (!userEmail) return res.status(401).json({ message: 'Unauthorized' })
  const { id } = req.params
  const { progress } = req.body
  if (typeof progress === 'undefined') {
    return res.status(400).json({ message: 'Progress value is required' })
  }
  const enrollment = await Enrollment.findOne({ _id: id, userEmail }).populate('course')
  if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' })
  enrollment.progress = Math.max(0, Math.min(100, Number(progress)))
  if (enrollment.progress >= 100) {
    enrollment.completedAt = enrollment.completedAt || new Date()
  } else {
    enrollment.completedAt = null
  }
  await enrollment.save()
  res.json(enrollment)
})

// POST /api/enrollments/:id/rating
router.post('/:id/rating', async (req, res) => {
  const userEmail = req.user?.email
  if (!userEmail) return res.status(401).json({ message: 'Unauthorized' })
  const { id } = req.params
  const { rating, review } = req.body
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' })
  }
  const enrollment = await Enrollment.findOne({ _id: id, userEmail })
  if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' })
  if (enrollment.progress < 100) {
    return res.status(400).json({ message: 'Complete the course before leaving a review' })
  }
  enrollment.rating = rating
  enrollment.review = review || ''
  await enrollment.save()
  await updateCourseRating(enrollment.course)
  res.json(enrollment)
})

export default router

