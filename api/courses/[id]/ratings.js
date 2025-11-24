import 'dotenv/config'
import mongoose from 'mongoose'
import Enrollment from '../../../src/models/Enrollment.js'
import { connectToDatabase } from '../../../_lib/db.js'
import { createHandler } from '../../../_lib/http.js'

const ratingsCache = new Map()
const RATINGS_CACHE_TTL = 60_000

function cacheKey(courseId) {
  return `ratings:${courseId}`
}

function getCached(courseId) {
  const cached = ratingsCache.get(cacheKey(courseId))
  if (!cached) return null
  if (Date.now() - cached.timestamp > RATINGS_CACHE_TTL) {
    ratingsCache.delete(cacheKey(courseId))
    return null
  }
  return cached.payload
}

function setCached(courseId, payload) {
  ratingsCache.set(cacheKey(courseId), { payload, timestamp: Date.now() })
}

export default createHandler(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  await connectToDatabase()
  const courseId = Array.isArray(req.query?.id) ? req.query.id[0] : req.query?.id
  if (!mongoose.isValidObjectId(courseId)) {
    return res.status(400).json({ message: 'Invalid course ID' })
  }

  const cached = getCached(courseId)
  if (cached) {
    return res.status(200).json(cached)
  }

  const matchStage = {
    $match: {
      course: new mongoose.Types.ObjectId(courseId),
      rating: { $exists: true, $ne: null },
    },
  }

  const [summary, breakdownRaw, reviews] = await Promise.all([
    Enrollment.aggregate([
      matchStage,
      {
        $group: {
          _id: '$course',
          average: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]),
    Enrollment.aggregate([
      matchStage,
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
    ]),
    Enrollment.find({
      course: courseId,
      rating: { $exists: true, $ne: null },
      review: { $ne: '' },
    })
      .sort({ updatedAt: -1 })
      .limit(6)
      .lean()
      .select('rating review userEmail updatedAt'),
  ])

  const breakdown = breakdownRaw.reduce((acc, item) => {
    acc[item._id] = item.count
    return acc
  }, {})

  const payload = {
    average: Number(summary[0]?.average?.toFixed(2)) || 0,
    count: summary[0]?.count || 0,
    breakdown,
    reviews,
  }

  setCached(courseId, payload)
  res.status(200).json(payload)
})

