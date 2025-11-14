# 🔧 Server Deployment to Vercel - EXACT STEPS

## ✅ Server is Ready!
- ✅ Dependencies installed
- ✅ MongoDB connected
- ✅ Vercel config ready
- ✅ API entry point ready

---

## 🚀 Deploy to Vercel Dashboard

### Step 1: Go to Vercel
1. Open: **https://vercel.com/dashboard**
2. Login with GitHub

### Step 2: Import Project
1. Click **"Add New Project"** (top right)
2. Click **"Import Git Repository"**
3. Search/Select: **`taiebasanjida/taieba-academy-server-side`**
4. Click **"Import"**

### Step 3: Configure Project
- **Project Name**: `taieba-academy-server-side` (or keep default)
- **Framework Preset**: Select **"Other"** (important!)
- **Root Directory**: `./` (default - leave as is)
- **Build Command**: Leave **EMPTY** or `npm install`
- **Output Directory**: Leave **EMPTY**
- **Install Command**: `npm install` (default)

### Step 4: Add Environment Variables (CRITICAL!)

Click **"Environment Variables"** section and add these **4 variables**:

#### Variable 1: MONGO_URI
```
Name: MONGO_URI
Value: mongodb+srv://taieba-academy:taieba-academy12345@cluster0.jb1ku.mongodb.net/taieba_academy?appName=Cluster0&retryWrites=true&w=majority
```

#### Variable 2: CLIENT_ORIGIN
```
Name: CLIENT_ORIGIN
Value: https://taieba-academy-client-side.vercel.app
```
(Update this after client is deployed with actual URL)

#### Variable 3: FIREBASE_SERVICE_ACCOUNT
```
Name: FIREBASE_SERVICE_ACCOUNT
Value: {"type":"service_account","project_id":"taieba-academy",...}
```
**How to get:**
1. Firebase Console → Project Settings
2. Service Accounts tab
3. Generate new private key
4. Copy entire JSON (as single line)
5. Paste here

#### Variable 4: NODE_ENV
```
Name: NODE_ENV
Value: production
```

### Step 5: Deploy!
1. Click **"Deploy"** button
2. Wait 2-3 minutes
3. **Get your API URL!**

---

## ✅ After Deployment

Your server will be live at:
- **API Base**: `https://taieba-academy-server-side.vercel.app`
- **API Endpoint**: `https://taieba-academy-server-side.vercel.app/api`

### Test API:
```bash
curl https://taieba-academy-server-side.vercel.app/
# Should return: {"ok":true,"name":"Taieba Academy API","version":"1.0.0"}
```

---

## 🔄 Update Client After Server Deploy

1. Go to Vercel → **Client Project** → Settings → Environment Variables
2. Find `VITE_API_BASE_URL`
3. Update to: `https://taieba-academy-server-side.vercel.app/api`
4. Redeploy client

---

## 🆘 Troubleshooting

### Build Fails:
- Check all environment variables are set
- Verify MONGO_URI is correct
- Check FIREBASE_SERVICE_ACCOUNT JSON is valid

### API Not Responding:
- Check deployment logs in Vercel
- Verify MongoDB connection (check MONGO_URI)
- Check CORS settings (CLIENT_ORIGIN)

### MongoDB Connection Error:
- Verify MONGO_URI is correct
- Check MongoDB Atlas IP whitelist (should have 0.0.0.0/0)
- Verify username/password

---

## 📋 Quick Checklist

- [ ] Imported `taieba-academy-server-side` repository
- [ ] Framework set to "Other"
- [ ] Added MONGO_URI environment variable
- [ ] Added CLIENT_ORIGIN environment variable
- [ ] Added FIREBASE_SERVICE_ACCOUNT environment variable
- [ ] Added NODE_ENV = production
- [ ] Clicked Deploy
- [ ] Got API URL
- [ ] Tested API endpoint

---

## 🎯 Expected Result

After successful deployment:
- ✅ API responds at: `https://taieba-academy-server-side.vercel.app/api`
- ✅ MongoDB connected
- ✅ CORS configured
- ✅ Ready to serve requests!

