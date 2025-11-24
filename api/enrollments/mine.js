import 'dotenv/config'
import Enrollment from '../../src/models/Enrollment.js'
import Course from '../../src/models/Course.js'
import { connectToDatabase } from '../_lib/db.js'
import { createHandler } from '../_lib/http.js'
import { requireUser } from '../_lib/auth.js'

export default createHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  await connectToDatabase()
  const user = await requireUser(req)

  const enrollments = await Enrollment.find({ userEmail: user.email })
    .sort({ createdAt: -1 })
    .lean()
    .select('userEmail course progress rating review completedAt createdAt updatedAt')

  if (enrollments.length === 0) {
    return res.status(200).json([])
  }

  const courseIds = [...new Set(enrollments.map(e => e.course?.toString()).filter(Boolean))]
  const courses = await Course.find({ _id: { $in: courseIds } })
    .lean()
    .select('title imageUrl price category instructor duration description')

  const courseMap = new Map(courses.map(course => [course._id.toString(), course]))
  const enriched = enrollments.map(enrollment => ({
    ...enrollment,
    course: enrollment.course ? courseMap.get(enrollment.course.toString()) || null : null,
  }))

  res.status(200).json(enriched)
})

