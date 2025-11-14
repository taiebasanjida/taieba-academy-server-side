# 🔥 Firebase Service Account JSON Add করার 2টি উপায়

## Method 1: Automatic (JSON File দিয়ে)

যদি Firebase Console থেকে JSON file download করেছেন:

```bash
cd server
node add-firebase-json.js taieba-academy-firebase-adminsdk-xxxxx.json
```

(Replace `taieba-academy-firebase-adminsdk-xxxxx.json` with your actual file name)

---

## Method 2: Manual (Copy-Paste)

### Step 1: Firebase Console থেকে JSON পান

1. **Firebase Console**: https://console.firebase.google.com/
2. **Project**: `taieba-academy` select করুন
3. **Settings** (gear icon) → **Project Settings**
4. **Service Accounts** tab
5. **"Generate new private key"** button click করুন
6. JSON file download হবে

### Step 2: JSON Content Copy করুন

1. Downloaded JSON file open করুন
2. **Ctrl+A** (select all)
3. **Ctrl+C** (copy)

### Step 3: .env File-এ Add করুন

1. `server/.env` file open করুন
2. এই line খুঁজুন:
   ```
   FIREBASE_SERVICE_ACCOUNT=
   ```
3. `=` এর পরে paste করুন (entire JSON)
4. **Save** করুন

**Important**: 
- JSON-টি **single line**-এ থাকতে হবে
- Line breaks থাকবে না
- Example:
   ```
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"taieba-academy",...}
   ```

### Step 4: Server Restart করুন

```bash
cd server
npm run dev
```

Server logs-এ দেখবেন:
```
✅ Firebase Admin initialized
```

---

## ✅ Verification

Test script run করুন:
```bash
node test-firebase-admin.js
```

যদি দেখেন `✅ Firebase Admin initialized successfully!` তাহলে **SUCCESS!**

---

## 🆘 Troubleshooting

### JSON Parse Error:
- Make sure JSON is on single line
- No extra spaces before/after
- All quotes properly escaped

### Still Not Working:
1. Check server terminal logs
2. Verify .env file location (`server/.env`)
3. Make sure server restarted
4. Test with `node test-firebase-admin.js`

---

## 💡 Quick Tip

JSON file download করার পর, file path copy করুন এবং run করুন:
```bash
node add-firebase-json.js "C:\Users\hp\Downloads\taieba-academy-firebase-adminsdk-xxxxx.json"
```

