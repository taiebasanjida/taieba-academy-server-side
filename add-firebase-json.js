// Helper script to add Firebase Service Account JSON to .env
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read the JSON file path from command line argument
const jsonFilePath = process.argv[2]

if (!jsonFilePath) {
  console.log('📝 Usage: node add-firebase-json.js <path-to-firebase-json-file>')
  console.log('')
  console.log('Example:')
  console.log('  node add-firebase-json.js taieba-academy-firebase-adminsdk-xxxxx.json')
  console.log('')
  console.log('Or paste JSON directly:')
  console.log('  1. Get JSON from Firebase Console')
  console.log('  2. Copy entire JSON content')
  console.log('  3. Paste in .env file after FIREBASE_SERVICE_ACCOUNT=')
  process.exit(1)
}

try {
  // Read JSON file
  const jsonContent = fs.readFileSync(jsonFilePath, 'utf8')
  const jsonData = JSON.parse(jsonContent)
  
  // Convert to single line string
  const jsonString = JSON.stringify(jsonData)
  
  // Read .env file
  const envPath = path.join(__dirname, '.env')
  let envContent = fs.readFileSync(envPath, 'utf8')
  
  // Update or add FIREBASE_SERVICE_ACCOUNT
  if (envContent.includes('FIREBASE_SERVICE_ACCOUNT=')) {
    // Replace existing
    envContent = envContent.replace(
      /FIREBASE_SERVICE_ACCOUNT=.*/,
      `FIREBASE_SERVICE_ACCOUNT=${jsonString}`
    )
  } else {
    // Add new line
    envContent += `\nFIREBASE_SERVICE_ACCOUNT=${jsonString}\n`
  }
  
  // Write back to .env
  fs.writeFileSync(envPath, envContent)
  
  console.log('✅ Firebase Service Account JSON added to .env file!')
  console.log('')
  console.log('🔄 Next steps:')
  console.log('1. Restart server: npm run dev')
  console.log('2. Check logs for: "Firebase Admin initialized"')
  console.log('3. Test enrollment in browser')
  
} catch (error) {
  console.error('❌ Error:', error.message)
  console.log('')
  console.log('💡 Alternative: Manually add to .env file:')
  console.log('   FIREBASE_SERVICE_ACCOUNT={...paste JSON here...}')
  process.exit(1)
}

