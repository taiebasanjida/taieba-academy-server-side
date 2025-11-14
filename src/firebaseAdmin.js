import admin from 'firebase-admin'

let cached = null
let triedInit = false

function parseServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)
    if (parsed.private_key?.includes('\\n')) {
      parsed.private_key = parsed.private_key.replace(/\\n/g, '\n')
    }
    return parsed
  } catch (error) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', error.message)
    return null
  }
}

export function getFirebaseAdmin() {
  if (cached) {
    return cached
  }

  if (admin.apps.length) {
    cached = admin
    return cached
  }

  if (triedInit) {
    return null
  }

  triedInit = true

  const serviceAccount = parseServiceAccount()
  if (!serviceAccount) {
    console.warn('FIREBASE_SERVICE_ACCOUNT not set or invalid. Firebase Admin auth disabled.')
    return null
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    })
    cached = admin
    console.log('Firebase Admin initialized')
    return cached
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error.message)
    return null
  }
}

