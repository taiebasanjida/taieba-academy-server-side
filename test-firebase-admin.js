// Test Firebase Admin Configuration
import dotenv from 'dotenv'
import { getFirebaseAdmin } from './src/firebaseAdmin.js'

dotenv.config()

console.log('🔍 Testing Firebase Admin Configuration...\n')

const firebaseAdmin = getFirebaseAdmin()

if (firebaseAdmin) {
  console.log('✅ Firebase Admin initialized successfully!')
  console.log('✅ Authentication will work properly\n')
  process.exit(0)
} else {
  console.error('❌ Firebase Admin failed to initialize\n')
  console.log('📝 Troubleshooting:')
  console.log('1. Check .env file has FIREBASE_SERVICE_ACCOUNT')
  console.log('2. Verify FIREBASE_SERVICE_ACCOUNT is valid JSON')
  console.log('3. Make sure server restarts after .env changes')
  console.log('4. Check server logs for detailed error messages\n')
  process.exit(1)
}

