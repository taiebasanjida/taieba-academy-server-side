import 'dotenv/config'
import mongoose from 'mongoose'
import Enrollment from '../../../src/models/Enrollment.js'
import Course from '../../../src/models/Course.js'
import { connectToDatabase } from '../../../_lib/db.js'
import { createHandler } from '../../../_lib/http.js'
import { requireUser } from '../../../_lib/auth.js'

async function updateCourseRating(courseId) {
  try {
    const stats = await Enrollment.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
          rating: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$course',
          average: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ])
    const summary = stats[0] || { average: 0, count: 0 }
    await Course.findByIdAndUpdate(courseId, {
      ratingAverage: Number(summary.average?.toFixed(2)) || 0,
      ratingCount: summary.count || 0,
    })
  } catch (error) {
    console.error('[BACKGROUND] Failed to update course rating:', error.message)
  }
}

export default createHandler(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  await connectToDatabase()
  const user = await requireUser(req)
  const enrollmentId = Array.isArray(req.query?.id) ? req.query.id[0] : req.query?.id

  if (!mongoose.isValidObjectId(enrollmentId)) {
    return res.status(400).json({ message: 'Invalid enrollment ID' })
  }

  const enrollment = await Enrollment.findOne({ _id: enrollmentId, userEmail: user.email })
  if (!enrollment) {
    return res.status(404).json({ message: 'Enrollment not found' })
  }
  if (enrollment.progress < 100) {
    return res.status(400).json({ message: 'Complete the course before leaving a review' })
  }

  const { rating, review } = req.body || {}
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' })
  }

  enrollment.rating = rating
  enrollment.review = review || ''
  await enrollment.save()

  if (enrollment.course) {
    updateCourseRating(enrollment.course.toString())
  }

  res.status(200).json(enrollment)
})

