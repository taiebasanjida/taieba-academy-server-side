import 'dotenv/config'
import mongoose from 'mongoose'
import Enrollment from '../../../src/models/Enrollment.js'
import { connectToDatabase } from '../../../_lib/db.js'
import { createHandler } from '../../../_lib/http.js'
import { requireUser } from '../../../_lib/auth.js'

function getEnrollmentId(req) {
  const id = req.query?.id
  return Array.isArray(id) ? id[0] : id
}

export default createHandler(async (req, res) => {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  await connectToDatabase()
  const user = await requireUser(req)
  const enrollmentId = getEnrollmentId(req)

  if (!mongoose.isValidObjectId(enrollmentId)) {
    return res.status(400).json({ message: 'Invalid enrollment ID' })
  }

  const enrollment = await Enrollment.findOne({ _id: enrollmentId, userEmail: user.email })
  if (!enrollment) {
    return res.status(404).json({ message: 'Enrollment not found' })
  }

  const { progress } = req.body || {}
  if (typeof progress === 'undefined') {
    return res.status(400).json({ message: 'Progress is required' })
  }

  enrollment.progress = Math.max(0, Math.min(100, Number(progress)))
  if (enrollment.progress >= 100) {
    enrollment.completedAt = enrollment.completedAt || new Date()
  } else {
    enrollment.completedAt = null
  }

  await enrollment.save()
  res.status(200).json(enrollment)
})

