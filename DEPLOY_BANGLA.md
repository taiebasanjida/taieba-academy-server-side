# 🚀 Server Deploy করার Step-by-Step Guide

## ✅ Server Ready!
- ✅ Code ready
- ✅ MongoDB connected
- ✅ Dependencies installed

---

## 📝 Step-by-Step Instructions

### Step 1: Vercel Dashboard খুলুন
1. Browser-এ যান: **https://vercel.com/dashboard**
2. GitHub account দিয়ে **Login** করুন
3. Dashboard-এ যান

### Step 2: New Project তৈরি করুন
1. Top right corner-এ **"Add New Project"** button-এ click করুন
2. **"Import Git Repository"** option select করুন
3. Search box-এ type করুন: `taieba-academy-server-side`
4. Repository select করুন: **`taiebasanjida/taieba-academy-server-side`**
5. **"Import"** button-এ click করুন

### Step 3: Project Configure করুন
এখানে settings set করুন:

- **Project Name**: `taieba-academy-server-side` (default রাখতে পারেন)
- **Framework Preset**: Dropdown থেকে **"Other"** select করুন (জরুরি!)
- **Root Directory**: `./` (default রাখুন)
- **Build Command**: **খালি রাখুন** (বা `npm install`)
- **Output Directory**: **খালি রাখুন**
- **Install Command**: `npm install` (default)

### Step 4: Environment Variables যোগ করুন (জরুরি!)

**"Environment Variables"** section-এ click করুন এবং এই 4টি variable add করুন:

#### Variable 1: MONGO_URI
```
Name: MONGO_URI
Value: mongodb+srv://taieba-academy:taieba-academy12345@cluster0.jb1ku.mongodb.net/taieba_academy?appName=Cluster0&retryWrites=true&w=majority
```
- **Key**: `MONGO_URI`
- **Value**: উপরের connection string copy করে paste করুন

#### Variable 2: CLIENT_ORIGIN
```
Name: CLIENT_ORIGIN
Value: https://taieba-academy-client-side.vercel.app
```
- **Key**: `CLIENT_ORIGIN`
- **Value**: Client deploy হওয়ার পর actual URL দিয়ে update করবেন

#### Variable 3: FIREBASE_SERVICE_ACCOUNT
```
Name: FIREBASE_SERVICE_ACCOUNT
Value: {"type":"service_account","project_id":"taieba-academy",...}
```
**কিভাবে পাবেন:**
1. Firebase Console-এ যান: https://console.firebase.google.com/
2. Project: `taieba-academy` select করুন
3. Settings (gear icon) → **"Service Accounts"** tab
4. **"Generate new private key"** button-এ click করুন
5. JSON file download হবে
6. File open করুন, সব content copy করুন
7. Vercel-এ paste করুন (single line-এ)

#### Variable 4: NODE_ENV
```
Name: NODE_ENV
Value: production
```
- **Key**: `NODE_ENV`
- **Value**: `production`

### Step 5: Deploy করুন!
1. সব variable add করার পর
2. Scroll down করুন
3. **"Deploy"** button-এ click করুন
4. 2-3 মিনিট অপেক্ষা করুন
5. Deployment complete হলে **API URL** পাবেন!

---

## ✅ Deployment Success হলে

আপনার server live হবে:
- **API URL**: `https://taieba-academy-server-side.vercel.app/api`
- **Test URL**: `https://taieba-academy-server-side.vercel.app/`

### Test করুন:
Browser-এ এই URL open করুন:
```
https://taieba-academy-server-side.vercel.app/
```

যদি দেখেন: `{"ok":true,"name":"Taieba Academy API"}` তাহলে **SUCCESS!** ✅

---

## 🔄 Client-এ API URL Update করুন

Server deploy হওয়ার পর:

1. Vercel Dashboard → **Client Project** → **Settings** → **Environment Variables**
2. `VITE_API_BASE_URL` খুঁজুন
3. Value update করুন: `https://taieba-academy-server-side.vercel.app/api`
4. **Save** করুন
5. Client **Redeploy** করুন

---

## 🆘 সমস্যা হলে

### Build Fail হলে:
- Environment variables সব add করেছেন কিনা check করুন
- MONGO_URI সঠিক আছে কিনা verify করুন
- FIREBASE_SERVICE_ACCOUNT JSON valid আছে কিনা check করুন

### API কাজ না করলে:
- Vercel Dashboard → Deployment → **Logs** check করুন
- MongoDB connection check করুন
- CORS settings verify করুন

### MongoDB Connection Error:
- MONGO_URI সঠিক আছে কিনা check করুন
- MongoDB Atlas → Network Access → IP whitelist check করুন (0.0.0.0/0 থাকতে হবে)
- Username/password verify করুন

---

## 📋 Checklist

Deploy করার আগে check করুন:
- [ ] Vercel Dashboard-এ login করেছেন
- [ ] Repository import করেছেন
- [ ] Framework "Other" set করেছেন
- [ ] MONGO_URI variable add করেছেন
- [ ] CLIENT_ORIGIN variable add করেছেন
- [ ] FIREBASE_SERVICE_ACCOUNT variable add করেছেন
- [ ] NODE_ENV = production add করেছেন
- [ ] Deploy button click করেছেন
- [ ] Deployment successful হয়েছে
- [ ] API URL test করেছেন

---

## 🎯 Final Result

Deployment successful হলে:
- ✅ Server live: `https://taieba-academy-server-side.vercel.app/api`
- ✅ MongoDB connected
- ✅ API endpoints working
- ✅ Ready for client to connect!

---

## 💡 Tips

1. **Environment Variables**: সব variable add করার পর double-check করুন
2. **FIREBASE_SERVICE_ACCOUNT**: JSON-এ কোনো line break থাকবে না, single line-এ paste করুন
3. **CLIENT_ORIGIN**: Client deploy হওয়ার পর exact URL দিয়ে update করুন
4. **Deployment Time**: সাধারণত 2-3 মিনিট লাগে

---

## 📞 Help

যদি কোনো step-এ সমস্যা হয়:
1. Vercel Dashboard → Deployment → Logs check করুন
2. Error message read করুন
3. Environment variables verify করুন

**Good Luck! 🚀**

