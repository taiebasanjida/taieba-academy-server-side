import mongoose from 'mongoose'

const EnrollmentSchema = new mongoose.Schema({
  userEmail: { type: String, index: true, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }
}, { timestamps: true })

export default mongoose.model('Enrollment', EnrollmentSchema)

