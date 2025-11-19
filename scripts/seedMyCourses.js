import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Course from '../src/models/Course.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from server root
const envPath = path.resolve(__dirname, '../.env')
dotenv.config({ path: envPath })

// Also try loading from process.cwd()
if (!process.env.MONGO_URI) {
  dotenv.config()
}

// User's email from Firebase
const USER_EMAIL = 'taieba.sanjida@gmail.com'
const USER_NAME = 'Taieba Sanjida'
const USER_PHOTO = 'https://ui-avatars.com/api/?name=Taieba+Sanjida&background=6366f1&color=fff'

const myCourses = [
  {
    title: 'Full-Stack Web Development with MERN',
    category: 'web-development',
    price: 49.99,
    duration: '12 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1080&auto=format&fit=crop',
    description: 'Master the MERN stack (MongoDB, Express, React, Node.js) and build full-stack web applications from scratch. Learn to create RESTful APIs, manage databases, and deploy your projects.',
    isFeatured: true
  },
  {
    title: 'JavaScript for Beginners to Advanced',
    category: 'web-development',
    price: 39.99,
    duration: '10 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?q=80&w=1080&auto=format&fit=crop',
    description: 'From variables to advanced concepts like closures and async/await. Build real-world projects and master JavaScript fundamentals and modern ES6+ features.',
    isFeatured: true
  },
  {
    title: 'Introduction to Machine Learning',
    category: 'ai-data-science',
    price: 54.99,
    duration: '10 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=1080&auto=format&fit=crop',
    description: 'Start your AI journey with machine learning fundamentals. Learn supervised and unsupervised learning, neural networks, and real-world ML applications.',
    isFeatured: true
  },
  {
    title: 'Start Your Own Online Business',
    category: 'business-entrepreneurship',
    price: 49.99,
    duration: '8 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1080&auto=format&fit=crop',
    description: 'Complete guide to launching and scaling your online business. Learn e-commerce, digital marketing, customer acquisition, and business strategy.',
    isFeatured: false
  },
  {
    title: 'Graphic Design with Adobe Photoshop',
    category: 'design-creative',
    price: 37.99,
    duration: '8 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=1080&auto=format&fit=crop',
    description: 'Master Adobe Photoshop from basics to advanced techniques. Learn photo editing, digital art, compositing, and professional design workflows.',
    isFeatured: false
  },
  {
    title: 'Python Programming from Zero to Hero',
    category: 'programming-software',
    price: 47.99,
    duration: '10 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?q=80&w=1080&auto=format&fit=crop',
    description: 'Complete Python course from basics to advanced. Learn data structures, OOP, file handling, web scraping, and build real-world projects.',
    isFeatured: true
  }
].map((course) => ({
  ...course,
  instructor: {
    name: USER_NAME,
    email: USER_EMAIL,
    photoURL: USER_PHOTO
  }
}))

async function seedMyCourses() {
  const uri = process.env.MONGO_URL || process.env.MONGO_URI
  
  if (!uri) {
    console.error('⚠️  MONGO_URL or MONGO_URI is not set in .env file.')
    process.exit(1)
  }
  
  console.log(`📍 Connecting to MongoDB Atlas...`)

  try {
    await mongoose.connect(uri)
    console.log('✅ Connected to MongoDB')
    console.log(`📧 Adding courses for: ${USER_EMAIL}`)

    // Delete existing courses by this user
    const deleted = await Course.deleteMany({ 'instructor.email': USER_EMAIL })
    console.log(`🗑️  Deleted ${deleted.deletedCount} existing courses`)

    // Insert new courses
    const result = await Course.insertMany(myCourses)
    console.log(`✅ Successfully added ${result.length} courses to "My Added Courses"`)
    console.log('\n📚 Courses added:')
    result.forEach((course, idx) => {
      console.log(`   ${idx + 1}. ${course.title}`)
    })
    console.log('\n🎉 Done! Check "My Added Courses" in your dashboard.')
  } catch (error) {
    console.error('❌ Failed to seed courses:', error.message)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

seedMyCourses()

