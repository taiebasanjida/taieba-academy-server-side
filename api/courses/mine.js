import 'dotenv/config'
import Course from '../../src/models/Course.js'
import { createHandler } from '../_lib/http.js'
import { connectToDatabase } from '../_lib/db.js'
import { requireUser } from '../_lib/auth.js'

export default createHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  await connectToDatabase()
  const user = await requireUser(req)

  const courses = await Course.find({ 'instructor.email': user.email })
    .sort({ createdAt: -1 })
    .lean()
    .select('title imageUrl price duration category description isFeatured ratingAverage ratingCount instructor createdAt updatedAt')

  return res.status(200).json(courses)
})

