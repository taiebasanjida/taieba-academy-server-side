# 🔥 Firebase Admin Setup Guide

## Problem
"Firebase admin is not configured on the server" error when trying to enroll.

## Solution

### Step 1: Get Firebase Service Account Key

1. **Go to Firebase Console**
   - https://console.firebase.google.com/
   - Login with `taieba.sanjida@gmail.com`
   - Select project: **`taieba-academy`**

2. **Get Service Account Key**
   - Click **Settings** (gear icon) → **Project Settings**
   - Go to **"Service Accounts"** tab
   - Click **"Generate new private key"** button
   - A JSON file will download (e.g., `taieba-academy-firebase-adminsdk-xxxxx.json`)

3. **Copy JSON Content**
   - Open the downloaded JSON file
   - Copy **ALL** content (Ctrl+A, Ctrl+C)
   - It should look like:
     ```json
     {
       "type": "service_account",
       "project_id": "taieba-academy",
       "private_key_id": "...",
       "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
       "client_email": "...",
       "client_id": "...",
       "auth_uri": "...",
       "token_uri": "...",
       ...
     }
     ```

### Step 2: Add to .env File

1. **Open** `server/.env` file
2. **Find** or **Add** this line:
   ```
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"taieba-academy",...}
   ```
3. **Important**: 
   - Paste the **ENTIRE JSON** as a **single line**
   - No line breaks
   - No extra spaces
   - Keep all quotes and brackets

### Step 3: Format Example

**Correct format:**
```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"taieba-academy","private_key_id":"abc123","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk@taieba-academy.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/..."}
```

### Step 4: Restart Server

After updating .env file:

1. **Stop server** (Ctrl+C in server terminal)
2. **Start server** again:
   ```bash
   cd server
   npm run dev
   ```
3. **Check logs** - You should see:
   ```
   ✅ Firebase Admin initialized
   ```

### Step 5: Test

1. **Refresh browser** (F5)
2. **Try to enroll** in a course
3. **Error should be fixed!**

---

## 🆘 Troubleshooting

### If JSON parsing fails:
- Make sure JSON is on **single line**
- Remove any line breaks (`\n` should stay as `\n` in the string)
- Verify all quotes are properly escaped

### If still not working:
1. Check server terminal logs for error messages
2. Verify .env file is in `server/` directory
3. Make sure server restarted after .env changes
4. Test with: `node test-firebase-admin.js`

---

## ✅ Quick Checklist

- [ ] Firebase Console → Service Accounts → Generate new private key
- [ ] JSON file downloaded
- [ ] JSON content copied (all of it)
- [ ] Added to `server/.env` as single line
- [ ] Server restarted
- [ ] "Firebase Admin initialized" in server logs
- [ ] Browser refreshed
- [ ] Enrollment works!

---

## 💡 Alternative: Use Environment Variable in Production

For Vercel deployment:
- Add `FIREBASE_SERVICE_ACCOUNT` in Vercel Dashboard
- Paste the entire JSON as single line
- No need for .env file in production

