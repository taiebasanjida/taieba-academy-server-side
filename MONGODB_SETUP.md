# 🗄️ MongoDB Connection Setup Guide

## Option 1: MongoDB Atlas (Cloud - Recommended for Production)

### Step 1: Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a new organization (or use existing)

### Step 2: Create a Cluster
1. Click **"Build a Database"**
2. Choose **FREE (M0) Shared** tier
3. Select **Cloud Provider & Region** (choose closest to you)
4. Click **"Create"** (takes 3-5 minutes)

### Step 3: Create Database User
1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter username and password (save these!)
5. Set privileges: **"Atlas admin"** or **"Read and write to any database"**
6. Click **"Add User"**

### Step 4: Whitelist IP Address
1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. For development: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. For production: Add specific IPs
5. Click **"Confirm"**

### Step 5: Get Connection String
1. Go to **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** and version **"5.5 or later"**
5. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your database user credentials
7. Add database name at the end:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/taieba_academy?retryWrites=true&w=majority
   ```

### Step 6: Add to .env File
Create `server/.env` file:
```env
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/taieba_academy?retryWrites=true&w=majority
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

---

## Option 2: Local MongoDB (For Development)

### Step 1: Install MongoDB
**Windows:**
1. Download: https://www.mongodb.com/try/download/community
2. Run installer
3. Choose "Complete" installation
4. Install as Windows Service (recommended)

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
```

### Step 2: Start MongoDB
**Windows:**
- MongoDB should start automatically as a service
- Or: Open Services → Start "MongoDB"

**macOS/Linux:**
```bash
brew services start mongodb-community  # macOS
# or
sudo systemctl start mongod  # Linux
```

### Step 3: Verify MongoDB is Running
```bash
mongosh
# or
mongo
```

If connected, you'll see MongoDB shell.

### Step 4: Create .env File
Create `server/.env` file:
```env
MONGO_URI=mongodb://127.0.0.1:27017/taieba_academy
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

---

## Test Connection

### Step 1: Start Server
```bash
cd server
npm install
npm run dev
```

### Step 2: Check Console
You should see:
```
✅ MongoDB connected successfully
API listening on http://localhost:5000
```

If you see an error, check:
- MongoDB is running (for local)
- Connection string is correct
- IP is whitelisted (for Atlas)
- Username/password are correct

---

## Troubleshooting

### Connection Timeout (Atlas)
- Check IP whitelist includes your IP or 0.0.0.0/0
- Verify username/password
- Check cluster is running

### Connection Refused (Local)
- Verify MongoDB service is running
- Check MongoDB is listening on port 27017
- Try: `mongosh` to test local connection

### Authentication Failed
- Double-check username and password
- Ensure special characters are URL-encoded in connection string
- Verify database user has correct permissions

---

## Quick Setup Commands

### Create .env file:
```bash
cd server
# Copy example file
cp .env.example .env
# Edit .env and add your MONGO_URI
```

### Test connection:
```bash
npm run dev
```

---

## For Production (Vercel/Render)

When deploying, add `MONGO_URI` to environment variables:
- Vercel: Settings → Environment Variables
- Render: Environment tab

**Important:** Use MongoDB Atlas for production, not local MongoDB!

