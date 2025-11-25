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

  // Debug logging
  console.log('🔍 [COURSES/MINE] User email:', user.email)
  console.log('🔍 [COURSES/MINE] User object:', { email: user.email, uid: user.uid, sub: user.sub })

  if (!user.email) {
    console.error('❌ [COURSES/MINE] No user email found!')
    return res.status(401).json({ message: 'Unauthorized - No user email' })
  }

  // Normalize email to lowercase for case-insensitive matching
  const normalizedEmail = user.email.toLowerCase().trim()

  // Use case-insensitive regex for email matching
  const courses = await Course.find({ 
    'instructor.email': { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
  })
    .sort({ createdAt: -1 })
    .lean()
    .select('title imageUrl price duration category description isFeatured ratingAverage ratingCount instructor createdAt updatedAt')

  console.log(`📚 [COURSES/MINE] Found ${courses.length} courses for instructor ${user.email}`)
  console.log('📚 [COURSES/MINE] Course instructor emails:', courses.map(c => c.instructor?.email))

  return res.status(200).json(courses)
})

