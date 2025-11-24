import 'dotenv/config'
import Course from '../../src/models/Course.js'
import { connectToDatabase } from '../_lib/db.js'
import { createHandler } from '../_lib/http.js'

export default createHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  await connectToDatabase()
  const count = await Course.countDocuments()
  res.status(200).json({ count })
})

