import { Router } from 'express'
import Enrollment from '../models/Enrollment.js'
import Course from '../models/Course.js'

const router = Router()

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

// GET /api/enrollments/mine
router.get('/mine', async (req, res) => {
  const userEmail = req.user?.email
  if (!userEmail) return res.status(401).json({ message: 'Unauthorized' })
  const list = await Enrollment.find({ userEmail }).populate('course').sort({ createdAt: -1 })
  res.json(list)
})

export default router

