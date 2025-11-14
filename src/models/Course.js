import mongoose from 'mongoose'

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  category: { type: String, required: true, index: true },
  description: { type: String, required: true },
  isFeatured: { type: Boolean, default: false },
  instructor: {
    name: String,
    email: { type: String, index: true },
    photoURL: String
  }
}, { timestamps: true })

export default mongoose.model('Course', CourseSchema)

