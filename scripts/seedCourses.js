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
    imageUrl: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=1080&auto=format&fit=crop',
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
    imageUrl: 'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=1080&auto=format&fit=crop',
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

  // 💼 Business & Entrepreneurship
  {
    title: 'Start Your Own Online Business',
    category: 'business-entrepreneurship',
    price: 49.99,
    duration: '8 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1080&auto=format&fit=crop',
    description: 'Complete guide to launching and scaling your online business. Learn e-commerce, digital marketing, customer acquisition, and business strategy.',
    isFeatured: true
  },
  {
    title: 'Principles of Digital Marketing',
    category: 'business-entrepreneurship',
    price: 34.99,
    duration: '6 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1080&auto=format&fit=crop',
    description: 'Master SEO, social media marketing, content marketing, and email campaigns. Learn to create effective digital marketing strategies that drive results.',
    isFeatured: false
  },
  {
    title: 'Finance Essentials for Beginners',
    category: 'business-entrepreneurship',
    price: 29.99,
    duration: '5 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1080&auto=format&fit=crop',
    description: 'Understand personal and business finance fundamentals. Learn budgeting, investing, financial planning, and money management strategies.',
    isFeatured: false
  },
  {
    title: 'Business Analytics Fundamentals',
    category: 'business-entrepreneurship',
    price: 42.99,
    duration: '7 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1080&auto=format&fit=crop',
    description: 'Learn to analyze business data, create reports, and make data-driven decisions. Master Excel, SQL, and business intelligence tools.',
    isFeatured: false
  },
  {
    title: 'Leadership & Project Management',
    category: 'business-entrepreneurship',
    price: 39.99,
    duration: '6 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1080&auto=format&fit=crop',
    description: 'Develop leadership skills and master project management methodologies. Learn Agile, Scrum, team management, and effective communication strategies.',
    isFeatured: false
  },

  // 🎨 Design & Creative Arts
  {
    title: 'Graphic Design with Adobe Photoshop',
    category: 'design-creative',
    price: 37.99,
    duration: '8 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=1080&auto=format&fit=crop',
    description: 'Master Adobe Photoshop from basics to advanced techniques. Learn photo editing, digital art, compositing, and professional design workflows.',
    isFeatured: true
  },
  {
    title: 'UI/UX Design for Mobile Apps',
    category: 'design-creative',
    price: 44.99,
    duration: '9 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1080&auto=format&fit=crop',
    description: 'Design beautiful and intuitive mobile app interfaces. Learn user research, wireframing, prototyping with Figma, and UX best practices.',
    isFeatured: false
  },
  {
    title: 'Introduction to Animation',
    category: 'design-creative',
    price: 39.99,
    duration: '7 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1080&auto=format&fit=crop',
    description: 'Learn animation principles and techniques. Create 2D and 3D animations using industry-standard tools and bring your designs to life.',
    isFeatured: false
  },
  {
    title: 'Canva for Beginners',
    category: 'design-creative',
    price: 19.99,
    duration: '4 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1080&auto=format&fit=crop',
    description: 'Create professional graphics, social media posts, and marketing materials with Canva. No design experience needed - perfect for beginners.',
    isFeatured: false
  },
  {
    title: 'Video Editing with Adobe Premiere Pro',
    category: 'design-creative',
    price: 42.99,
    duration: '8 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1080&auto=format&fit=crop',
    description: 'Master professional video editing with Adobe Premiere Pro. Learn cutting, color grading, audio mixing, and create cinematic videos.',
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

  // 🌍 Personal Development
  {
    title: 'Improve Your Communication Skills',
    category: 'personal-development',
    price: 24.99,
    duration: '5 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1080&auto=format&fit=crop',
    description: 'Enhance your verbal and written communication. Learn active listening, public speaking, and effective communication strategies for personal and professional success.',
    isFeatured: false
  },
  {
    title: 'Time Management Mastery',
    category: 'personal-development',
    price: 22.99,
    duration: '4 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78ffe36?q=80&w=1080&auto=format&fit=crop',
    description: 'Master time management techniques and productivity systems. Learn to prioritize tasks, eliminate distractions, and achieve your goals efficiently.',
    isFeatured: false
  },
  {
    title: 'Productivity Hacks for Students & Developers',
    category: 'personal-development',
    price: 19.99,
    duration: '3 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1080&auto=format&fit=crop',
    description: 'Discover productivity tools and techniques specifically for students and developers. Learn coding workflows, study methods, and efficiency tips.',
    isFeatured: false
  },
  {
    title: 'Public Speaking 101',
    category: 'personal-development',
    price: 27.99,
    duration: '5 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1080&auto=format&fit=crop',
    description: 'Overcome stage fright and become a confident public speaker. Learn presentation skills, storytelling, and techniques to engage your audience.',
    isFeatured: false
  },
  {
    title: 'Critical Thinking & Decision Making',
    category: 'personal-development',
    price: 29.99,
    duration: '6 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1080&auto=format&fit=crop',
    description: 'Develop critical thinking skills and make better decisions. Learn to analyze information, evaluate arguments, and solve problems effectively.',
    isFeatured: false
  },

  // 🧘 Health, Fitness & Lifestyle
  {
    title: 'Basics of Mental Wellness',
    category: 'health-fitness',
    price: 24.99,
    duration: '4 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1080&auto=format&fit=crop',
    description: 'Learn mental health fundamentals, stress management, mindfulness, and self-care practices. Build resilience and improve your overall well-being.',
    isFeatured: false
  },
  {
    title: 'Home Workout for Beginners',
    category: 'health-fitness',
    price: 19.99,
    duration: '6 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1080&auto=format&fit=crop',
    description: 'Start your fitness journey at home. Learn effective bodyweight exercises, create workout routines, and build strength without equipment.',
    isFeatured: false
  },
  {
    title: 'Healthy Nutrition & Meal Planning',
    category: 'health-fitness',
    price: 27.99,
    duration: '5 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1080&auto=format&fit=crop',
    description: 'Master nutrition basics and meal planning. Learn to create balanced meals, understand macronutrients, and develop healthy eating habits.',
    isFeatured: false
  },
  {
    title: 'Yoga for Stress Relief',
    category: 'health-fitness',
    price: 22.99,
    duration: '4 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1080&auto=format&fit=crop',
    description: 'Learn yoga poses and breathing techniques to reduce stress and improve flexibility. Perfect for beginners looking to enhance mental and physical wellness.',
    isFeatured: false
  },
  {
    title: 'Personal Fitness Coaching Basics',
    category: 'health-fitness',
    price: 34.99,
    duration: '6 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1080&auto=format&fit=crop',
    description: 'Learn fitness coaching fundamentals. Understand exercise science, program design, and how to help others achieve their fitness goals.',
    isFeatured: false
  },

  // 🎶 Music & Audio Production
  {
    title: 'Guitar Basics for Beginners',
    category: 'music-audio',
    price: 29.99,
    duration: '8 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1080&auto=format&fit=crop',
    description: 'Start your guitar journey from scratch. Learn chords, strumming patterns, fingerpicking, and play your favorite songs in no time.',
    isFeatured: false
  },
  {
    title: 'Music Production with FL Studio',
    category: 'music-audio',
    price: 44.99,
    duration: '10 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1080&auto=format&fit=crop',
    description: 'Master FL Studio and create professional music tracks. Learn mixing, mastering, sound design, and produce your own songs from start to finish.',
    isFeatured: true
  },
  {
    title: 'Vocal Training 101',
    category: 'music-audio',
    price: 32.99,
    duration: '6 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1080&auto=format&fit=crop',
    description: 'Improve your singing voice with proper vocal techniques. Learn breathing, pitch control, vocal range expansion, and performance skills.',
    isFeatured: false
  },
  {
    title: 'Introduction to Sound Engineering',
    category: 'music-audio',
    price: 39.99,
    duration: '8 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1080&auto=format&fit=crop',
    description: 'Learn audio engineering fundamentals. Master recording, mixing, EQ, compression, and create professional-quality audio productions.',
    isFeatured: false
  },
  {
    title: 'Beat Making for Beginners',
    category: 'music-audio',
    price: 34.99,
    duration: '7 weeks',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1080&auto=format&fit=crop',
    description: 'Create your own beats and instrumentals. Learn drum programming, melody creation, and music production basics for hip-hop, EDM, and more.',
    isFeatured: false
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
