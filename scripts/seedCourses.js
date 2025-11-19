import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Course from '../src/models/Course.js'

dotenv.config({ path: new URL('../.env', import.meta.url) })

const SAMPLE_INSTRUCTOR = {
  name: 'Taieba Instructor',
  email: 'instructor@taieba-academy.com',
  photoURL: 'https://ui-avatars.com/api/?name=Instructor&background=6366f1&color=fff&size=128'
}

const courses = [
  // 🔧 Web Development
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
    title: 'Responsive Web Design with HTML & CSS',
    category: 'web-development',
    price: 29.99,
    duration: '6 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1080&auto=format&fit=crop',
    description: 'Learn modern HTML5 and CSS3 to create beautiful, responsive websites that work perfectly on all devices. Master Flexbox, Grid, and CSS animations.',
    isFeatured: false
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
    title: 'Modern React & Next.js Fundamentals',
    category: 'web-development',
    price: 44.99,
    duration: '8 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1080&auto=format&fit=crop',
    description: 'Learn React hooks, context API, and Next.js for server-side rendering. Build modern, performant web applications with the latest React ecosystem.',
    isFeatured: false
  },
  {
    title: 'Backend Development with Node.js & Express',
    category: 'web-development',
    price: 42.99,
    duration: '9 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1080&auto=format&fit=crop',
    description: 'Build robust RESTful APIs and server-side applications with Node.js and Express. Learn authentication, database integration, and deployment strategies.',
    isFeatured: false
  },
  {
    title: 'Vue.js Complete Guide',
    category: 'web-development',
    price: 41.99,
    duration: '8 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1080&auto=format&fit=crop',
    description: 'Master Vue.js framework from basics to advanced. Learn Vue Router, Vuex, Composition API, and build modern single-page applications.',
    isFeatured: false
  },
  {
    title: 'TypeScript for Modern Development',
    category: 'web-development',
    price: 38.99,
    duration: '7 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=1080&auto=format&fit=crop',
    description: 'Learn TypeScript to write type-safe JavaScript. Master interfaces, generics, decorators, and integrate TypeScript with React and Node.js.',
    isFeatured: false
  },

  // 🤖 AI & Data Science
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
    title: 'Deep Learning with TensorFlow',
    category: 'ai-data-science',
    price: 59.99,
    duration: '12 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?q=80&w=1080&auto=format&fit=crop',
    description: 'Dive deep into neural networks, CNNs, RNNs, and advanced deep learning techniques using TensorFlow. Build AI models for image recognition and NLP.',
    isFeatured: false
  },
  {
    title: 'Data Analysis with Python (NumPy, Pandas)',
    category: 'ai-data-science',
    price: 47.99,
    duration: '8 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1080&auto=format&fit=crop',
    description: 'Master data manipulation and analysis with Python. Learn NumPy, Pandas, and data cleaning techniques to extract insights from real-world datasets.',
    isFeatured: false
  },
  {
    title: 'AI for Beginners: Building Smart Applications',
    category: 'ai-data-science',
    price: 44.99,
    duration: '7 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1080&auto=format&fit=crop',
    description: 'Learn AI concepts without complex math. Build practical AI applications using pre-trained models and understand how AI works in real-world scenarios.',
    isFeatured: false
  },
  {
    title: 'Data Visualization with Power BI & Tableau',
    category: 'ai-data-science',
    price: 39.99,
    duration: '6 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1080&auto=format&fit=crop',
    description: 'Create stunning data visualizations and interactive dashboards. Learn Power BI and Tableau to transform data into compelling business insights.',
    isFeatured: false
  },
  {
    title: 'Natural Language Processing (NLP)',
    category: 'ai-data-science',
    price: 52.99,
    duration: '9 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1080&auto=format&fit=crop',
    description: 'Learn NLP techniques to process and understand human language. Build chatbots, sentiment analysis systems, and text classification models.',
    isFeatured: false
  },

  // 👨‍💻 Programming & Software Development
  {
    title: 'Python Programming from Zero to Hero',
    category: 'programming-software',
    price: 47.99,
    duration: '10 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?q=80&w=1080&auto=format&fit=crop',
    description: 'Complete Python course from basics to advanced. Learn data structures, OOP, file handling, web scraping, and build real-world projects.',
    isFeatured: true
  },
  {
    title: 'Java Fundamentals & Object-Oriented Programming',
    category: 'programming-software',
    price: 44.99,
    duration: '9 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=1080&auto=format&fit=crop',
    description: 'Master Java programming and OOP concepts. Learn classes, inheritance, polymorphism, and build desktop applications with Java.',
    isFeatured: false
  },
  {
    title: 'C++ for Problem Solving',
    category: 'programming-software',
    price: 39.99,
    duration: '8 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1080&auto=format&fit=crop',
    description: 'Learn C++ programming and algorithmic problem-solving. Master data structures, algorithms, and competitive programming techniques.',
    isFeatured: false
  },
  {
    title: 'Mobile App Development with Flutter',
    category: 'programming-software',
    price: 49.99,
    duration: '10 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1080&auto=format&fit=crop',
    description: 'Build cross-platform mobile apps with Flutter and Dart. Create beautiful, native iOS and Android apps from a single codebase.',
    isFeatured: false
  },
  {
    title: 'Software Testing & Quality Assurance',
    category: 'programming-software',
    price: 37.99,
    duration: '7 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1080&auto=format&fit=crop',
    description: 'Learn software testing methodologies, automation testing, and QA best practices. Master tools like Selenium, Jest, and testing frameworks.',
    isFeatured: false
  },
  {
    title: 'Docker & Kubernetes for DevOps',
    category: 'programming-software',
    price: 48.99,
    duration: '9 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?q=80&w=1080&auto=format&fit=crop',
    description: 'Master containerization with Docker and orchestration with Kubernetes. Learn to deploy, scale, and manage containerized applications.',
    isFeatured: false
  },
  {
    title: 'Git & GitHub Version Control',
    category: 'programming-software',
    price: 24.99,
    duration: '4 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1080&auto=format&fit=crop',
    description: 'Master Git version control and GitHub collaboration. Learn branching, merging, pull requests, and best practices for team development.',
    isFeatured: false
  },
  {
    title: 'Linux System Administration',
    category: 'programming-software',
    price: 42.99,
    duration: '8 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1080&auto=format&fit=crop',
    description: 'Learn Linux command line, shell scripting, system administration, and server management. Master essential Linux skills for developers and sysadmins.',
    isFeatured: false
  },
  {
    title: 'Database Design & SQL Mastery',
    category: 'programming-software',
    price: 43.99,
    duration: '8 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1080&auto=format&fit=crop',
    description: 'Master database design principles and SQL queries. Learn normalization, indexing, stored procedures, and work with MySQL, PostgreSQL, and MongoDB.',
    isFeatured: false
  },
  {
    title: 'Cybersecurity Fundamentals',
    category: 'programming-software',
    price: 49.99,
    duration: '10 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1080&auto=format&fit=crop',
    description: 'Learn cybersecurity basics, ethical hacking, network security, and secure coding practices. Protect applications and systems from common vulnerabilities.',
    isFeatured: false
  }
].map((course) => ({
  ...course,
  instructor: SAMPLE_INSTRUCTOR
}))

async function seed() {
  const uri = process.env.MONGO_URL || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/db_taieba_academy'
  if (!uri) {
    console.error('⚠️  MONGO_URL or MONGO_URI is not set.')
    process.exit(1)
  }

  await mongoose.connect(uri)
  console.log('✅ Connected to MongoDB')

  try {
    await Course.deleteMany({})
    await Course.insertMany(courses)
    console.log(`🌱 Seeded ${courses.length} IT/Technology courses.`)
    console.log(`📚 Categories: Web Development, AI/Data Science, Programming & Software`)
  } catch (error) {
    console.error('❌ Failed to seed courses:', error)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

seed()
