import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Course from '../src/models/Course.js'

dotenv.config({ path: new URL('../.env', import.meta.url) })

const SAMPLE_INSTRUCTOR = {
  name: 'Taieba Instructor',
  email: 'instructor@taieba-academy.com',
  photoURL: 'https://randomuser.me/api/portraits/men/32.jpg'
}

const courses = [
  {
    title: 'Modern React Fundamentals',
    category: 'development',
    price: 39.99,
    duration: '6 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1080&auto=format&fit=crop',
    description:
      'Learn React 18 from scratch. Build reusable components, manage state with hooks, and integrate APIs to create production-ready applications.',
    isFeatured: true
  },
  {
    title: 'UI/UX Design Essentials',
    category: 'design',
    price: 29.99,
    duration: '4 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=1080&auto=format&fit=crop',
    description:
      'Master the design process from research to wireframes. Create beautiful, user-centered interfaces using Figma and modern design systems.'
  },
  {
    title: 'Digital Marketing Accelerator',
    category: 'marketing',
    price: 24.99,
    duration: '5 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1080&auto=format&fit=crop',
    description:
      'Develop a complete digital marketing strategy covering SEO, social media, email marketing, and analytics to boost brand growth.'
  },
  {
    title: 'Data Storytelling with Python',
    category: 'data',
    price: 34.99,
    duration: '7 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=1080&auto=format&fit=crop',
    description:
      'Transform raw data into compelling narratives. Use Python, Pandas, and visualization libraries to communicate insights effectively.',
    isFeatured: true
  }
].map((course) => ({
  ...course,
  instructor: SAMPLE_INSTRUCTOR
}))

async function seed() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taieba_academy'
  if (!uri) {
    console.error('⚠️  MONGO_URI is not set.')
    process.exit(1)
  }

  await mongoose.connect(uri)
  console.log('✅ Connected to MongoDB')

  try {
    await Course.deleteMany({})
    await Course.insertMany(courses)
    console.log(`🌱 Seeded ${courses.length} courses.`)
  } catch (error) {
    console.error('❌ Failed to seed courses:', error)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

seed()

