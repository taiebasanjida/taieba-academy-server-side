import { Router } from 'express'
import Course from '../models/Course.js'

const router = Router()

// GET /api/courses?category=design
router.get('/', async (req, res) => {
  const { category } = req.query
  const query = {}
  if (category) query.category = category
  const courses = await Course.find(query).sort({ createdAt: -1 }).limit(60)
  res.json({ courses })
})

// GET /api/courses/:id
router.get('/:id', async (req, res) => {
  const course = await Course.findById(req.params.id)
  if (!course) return res.status(404).json({ message: 'Not found' })
  res.json(course)
})

// GET /api/courses/mine - by instructor email
router.get('/mine', async (req, res) => {
  if (!req.user?.email) return res.status(401).json({ message: 'Unauthorized' })
  const courses = await Course.find({ 'instructor.email': req.user.email }).sort({ createdAt: -1 })
  res.json(courses)
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

