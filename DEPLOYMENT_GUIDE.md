# 🚀 Backend Deployment Guide - Render.com

## Step 1: Prepare for Deployment

### 1.1 Update package.json (if needed)
Make sure your `package.json` has a `start` script:
```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "node src/index.js"
  }
}
```

### 1.2 Environment Variables Needed
You'll need these in Render:
- `PORT` (auto-set by Render, but can override)
- `MONGO_URI` (your MongoDB connection string)
- `CLIENT_ORIGIN` (your Vercel frontend URL)
- `FIREBASE_SERVICE_ACCOUNT` (your Firebase service account JSON)

---

## Step 2: Deploy to Render.com

### 2.1 Create Account
1. Go to: https://render.com
2. Sign up with GitHub
3. Connect your GitHub account

### 2.2 Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect repository: `taiebasanjida/taieba-academy-server-side`
3. Configure:
   - **Name**: `taieba-academy-api` (or any name)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `./` (or `server` if repo has client folder)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 2.3 Add Environment Variables
Click **"Environment"** tab and add:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_ORIGIN=https://taieba-academy-client-side.vercel.app
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

**How to get MongoDB URI:**
- MongoDB Atlas: https://cloud.mongodb.com/
- Create cluster → Connect → Get connection string
- Replace `<password>` with your password

**How to get Firebase Service Account:**
1. Firebase Console → Project Settings
2. Service Accounts tab
3. Generate new private key
4. Copy entire JSON content
5. Paste in Render (as single line or use Render's JSON editor)

### 2.4 Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Get your backend URL: `https://taieba-academy-api.onrender.com`

---

## Step 3: Update Frontend API URL

### 3.1 Update Vercel Environment Variables
1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Update `VITE_API_BASE_URL`:
   ```
   VITE_API_BASE_URL=https://taieba-academy-api.onrender.com/api
   ```
4. Redeploy (or wait for auto-deploy)

---

## Step 4: Test

1. Visit your Vercel site
2. Go to Courses page
3. Courses should load now! ✅

---

## Alternative: Railway.app

### Steps:
1. Go to: https://railway.app
2. New Project → Deploy from GitHub
3. Select: `taiebasanjida/taieba-academy-server-side`
4. Add environment variables (same as above)
5. Deploy
6. Get URL and update frontend

---

## Troubleshooting

### Backend not responding:
- Check Render logs
- Verify environment variables
- Check MongoDB connection
- Verify CORS settings

### CORS Error:
- Make sure `CLIENT_ORIGIN` includes your Vercel URL
- Check server CORS configuration

### MongoDB Connection Error:
- Verify MongoDB URI is correct
- Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for Render)

