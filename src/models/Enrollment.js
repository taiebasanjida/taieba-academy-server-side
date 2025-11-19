import mongoose from 'mongoose'

const EnrollmentSchema = new mongoose.Schema({
  userEmail: { type: String, index: true, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true }, // Added index for faster populate queries
  progress: { type: Number, default: 0, min: 0, max: 100 },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String, default: '' },
  completedAt: { type: Date }
}, { timestamps: true })

// Compound index for common queries
EnrollmentSchema.index({ userEmail: 1, course: 1 })
EnrollmentSchema.index({ createdAt: -1 }) // For sorting

export default mongoose.model('Enrollment', EnrollmentSchema)

