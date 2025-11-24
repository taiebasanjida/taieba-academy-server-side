import 'dotenv/config'
import Enrollment from '../../../src/models/Enrollment.js'
import { connectToDatabase } from '../../_lib/db.js'
import { createHandler } from '../../_lib/http.js'
import { getOptionalUser } from '../../_lib/auth.js'

export default createHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  await connectToDatabase()
  const user = await getOptionalUser(req)
  
  // If no user, return not enrolled
  if (!user || !user.email) {
    return res.status(200).json({ enrolled: false })
  }
  
  // Extract courseId from URL path or query
  let courseId = Array.isArray(req.query?.courseId) ? req.query.courseId[0] : req.query?.courseId
  
  // If not in query, try to extract from URL
  if (!courseId && req.url) {
    const match = req.url.match(/\/enrollments\/status\/([^/?]+)/)
    if (match) {
      courseId = match[1]
    }
  }
  
  if (!courseId) {
    return res.status(400).json({ message: 'courseId is required' })
  }

  const enrollment = await Enrollment.findOne({ userEmail: user.email, course: courseId }).lean()
  res.status(200).json({ enrolled: !!enrollment })
})

