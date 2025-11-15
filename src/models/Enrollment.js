import mongoose from 'mongoose'

const EnrollmentSchema = new mongoose.Schema({
  userEmail: { type: String, index: true, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String, default: '' },
  completedAt: { type: Date }
}, { timestamps: true })

export default mongoose.model('Enrollment', EnrollmentSchema)

