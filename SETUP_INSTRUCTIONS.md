# 🔧 MongoDB Connection Setup - Quick Fix

## ✅ Step 1: Get/Reset Password for 'taieba-academy' User

### Option A: Reset Password (Recommended)
1. Go to MongoDB Atlas → Database Access
2. Find user: **taieba-academy**
3. Click **"EDIT"** button
4. Scroll to **"Password"** section
5. Click **"Edit Password"** or **"Change Password"**
6. Enter new password (save it!)
7. Click **"Update User"**

### Option B: Use Existing Password
- If you remember the password, use it directly

---

## ✅ Step 2: Update .env File

1. Open `server/.env` file
2. Find this line:
   ```
   MONGO_URI=mongodb+srv://taieba-academy:YOUR_PASSWORD@cluster0.jb1ku.mongodb.net/taieba_academy?appName=Cluster0&retryWrites=true&w=majority
   ```
3. Replace `YOUR_PASSWORD` with your actual password
4. Save the file

**Example:**
```
MONGO_URI=mongodb+srv://taieba-academy:MyPassword123@cluster0.jb1ku.mongodb.net/taieba_academy?appName=Cluster0&retryWrites=true&w=majority
```

---

## ✅ Step 3: Whitelist IP Address (Important!)

1. Go to MongoDB Atlas → **Network Access**
2. Click **"Add IP Address"**
3. For development: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

**Important:** Without this, connection will fail!

---

## ✅ Step 4: Test Connection

```bash
cd server
npm install
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
API listening on http://localhost:5000
```

If you see an error, check:
- Password is correct
- IP is whitelisted
- Connection string format is correct

---

## 🚨 Common Issues

### Error: "Authentication failed"
- **Fix:** Check username and password are correct
- **Fix:** Make sure password doesn't have special characters that need URL encoding

### Error: "Connection timeout"
- **Fix:** Check IP whitelist includes your IP or 0.0.0.0/0
- **Fix:** Check MongoDB cluster is running

### Error: "Network is unreachable"
- **Fix:** Check internet connection
- **Fix:** Verify cluster is not paused

---

## 📝 Password Special Characters

If your password has special characters, URL encode them:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`

---

## ✅ Quick Checklist

- [ ] Password reset/retrieved for 'taieba-academy' user
- [ ] .env file updated with correct password
- [ ] IP address whitelisted (0.0.0.0/0 for development)
- [ ] Server tested and connected successfully

---

## 🎯 Next Steps After Connection Works

1. Test API endpoints
2. Seed database with courses (if needed)
3. Deploy to Vercel with environment variables

