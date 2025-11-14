# 🔧 Server Repository Import করার Steps

## ✅ Repository Info
- **Repository**: `taieba-academy-server-side`
- **Account**: `taieba.sanjida@gmail.com`
- **GitHub**: `taiebasanjida/taieba-academy-server-side`

---

## 🔐 Step 1: GitHub Account Connect করুন

যদি repository Vercel-এ দেখা না যায়:

1. **Vercel Dashboard** → **Settings** (top right profile icon)
2. **GitHub** section-এ যান
3. **"Connect GitHub"** বা **"Configure"** button-এ click করুন
4. GitHub-এ login করুন (`taieba.sanjida@gmail.com` account দিয়ে)
5. **Authorize Vercel** করুন
6. **All repositories** access দিন (বা specific repository select করুন)

---

## 🔍 Step 2: Repository খুঁজুন

1. **Vercel Dashboard** → **"Add New Project"**
2. **"Import Git Repository"** section-এ যান
3. **Search box**-এ type করুন: `taieba-academy-server-side`
4. Repository দেখতে পাবেন: `taiebasanjida/taieba-academy-server-side`
5. **"Import"** button-এ click করুন

---

## ⚙️ Step 3: Configure Project

### Basic Settings:
- **Project Name**: `taieba-academy-server-side`
- **Framework Preset**: **"Other"** (জরুরি!)
- **Root Directory**: `./`
- **Build Command**: খালি রাখুন
- **Output Directory**: খালি রাখুন
- **Install Command**: `npm install`

---

## 🔑 Step 4: Environment Variables (4টি)

**"Environment Variables"** section-এ click করুন:

### 1. MONGO_URI
```
Key: MONGO_URI
Value: mongodb+srv://taieba-academy:taieba-academy12345@cluster0.jb1ku.mongodb.net/taieba_academy?appName=Cluster0&retryWrites=true&w=majority
```

### 2. CLIENT_ORIGIN
```
Key: CLIENT_ORIGIN
Value: https://taieba-academy-client-side.vercel.app
```
(Client deploy হওয়ার পর exact URL দিয়ে update করবেন)

### 3. FIREBASE_SERVICE_ACCOUNT
```
Key: FIREBASE_SERVICE_ACCOUNT
Value: {"type":"service_account","project_id":"taieba-academy",...}
```

**কিভাবে পাবেন:**
1. Firebase Console: https://console.firebase.google.com/
2. Project: `taieba-academy` select করুন
3. Settings (gear icon) → **Service Accounts** tab
4. **"Generate new private key"** button
5. JSON file download হবে
6. File open করুন, সব content copy করুন
7. Vercel-এ paste করুন (single line-এ, line break ছাড়া)

### 4. NODE_ENV
```
Key: NODE_ENV
Value: production
```

---

## 🚀 Step 5: Deploy করুন

1. সব variable add করার পর
2. Scroll down করুন
3. **"Deploy"** button-এ click করুন
4. 2-3 মিনিট অপেক্ষা করুন
5. **Deployment successful** হলে API URL পাবেন!

---

## ✅ Success হলে

আপনার server live হবে:
- **API Base**: `https://taieba-academy-server-side.vercel.app`
- **API Endpoint**: `https://taieba-academy-server-side.vercel.app/api`

### Test করুন:
Browser-এ open করুন:
```
https://taieba-academy-server-side.vercel.app/
```

যদি দেখেন: `{"ok":true,"name":"Taieba Academy API","version":"1.0.0"}` 
তাহলে **SUCCESS!** ✅

---

## 🆘 যদি Repository না দেখা যায়

### Option 1: GitHub Permissions Check
1. Vercel Dashboard → **Settings** → **GitHub**
2. **"Configure"** বা **"Reconnect"** করুন
3. **All repositories** access দিন
4. আবার search করুন

### Option 2: Direct URL দিয়ে Import
1. Vercel Dashboard → **"Add New Project"**
2. Top-এ **"Enter a Git repository URL"** box-এ paste করুন:
   ```
   https://github.com/taiebasanjida/taieba-academy-server-side
   ```
3. **"Continue"** button-এ click করুন

### Option 3: GitHub-এ Repository Check
1. GitHub-এ যান: https://github.com/taiebasanjida/taieba-academy-server-side
2. Repository public আছে কিনা check করুন
3. যদি private হয়, Vercel-এ access দিতে হবে

---

## 📋 Checklist

- [ ] GitHub account Vercel-এ connected
- [ ] Repository Vercel-এ দেখা যাচ্ছে
- [ ] Project import করেছেন
- [ ] Framework "Other" set করেছেন
- [ ] MONGO_URI variable add করেছেন
- [ ] CLIENT_ORIGIN variable add করেছেন
- [ ] FIREBASE_SERVICE_ACCOUNT variable add করেছেন
- [ ] NODE_ENV = production add করেছেন
- [ ] Deploy button click করেছেন
- [ ] Deployment successful হয়েছে
- [ ] API URL test করেছেন

---

## 🎯 Next Steps After Server Deploy

1. **Client-এ API URL Update** করুন:
   - Vercel → Client Project → Settings → Environment Variables
   - `VITE_API_BASE_URL` update করুন: `https://taieba-academy-server-side.vercel.app/api`

2. **Server-এ CORS Update** করুন:
   - Vercel → Server Project → Settings → Environment Variables
   - `CLIENT_ORIGIN` update করুন: exact client URL

---

## 💡 Tips

1. **GitHub Connection**: যদি repository না দেখা যায়, GitHub permissions check করুন
2. **Direct URL**: Search না হলে, direct GitHub URL paste করুন
3. **Environment Variables**: সব variable add করার পর double-check করুন
4. **FIREBASE_SERVICE_ACCOUNT**: JSON single line-এ paste করুন (no line breaks)

**Good Luck! 🚀**

