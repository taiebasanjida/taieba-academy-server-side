// Quick MongoDB Connection Test Script
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI || MONGO_URI.includes('YOUR_PASSWORD')) {
  console.error('❌ Error: MONGO_URI not set or password not replaced!')
  console.log('\n📝 Please update server/.env file:')
  console.log('   Replace YOUR_PASSWORD with your actual MongoDB password')
  process.exit(1)
}

console.log('🔄 Testing MongoDB connection...')
console.log(`📍 Connecting to: ${MONGO_URI.replace(/:[^:@]+@/, ':****@')}`) // Hide password in logs

mongoose.connect(MONGO_URI)
.then(() => {
  console.log('✅ MongoDB connected successfully!')
  console.log('✅ Connection test passed!')
  mongoose.disconnect()
  process.exit(0)
})
.catch(err => {
  console.error('❌ MongoDB connection failed!')
  console.error('Error:', err.message)
  
  if (err.message.includes('authentication')) {
    console.log('\n💡 Tip: Check your username and password in .env file')
  } else if (err.message.includes('timeout') || err.message.includes('ENOTFOUND')) {
    console.log('\n💡 Tip: Check your IP whitelist in MongoDB Atlas')
    console.log('   Go to: Network Access -> Add IP Address -> Allow from Anywhere')
  }
  
  process.exit(1)
})

