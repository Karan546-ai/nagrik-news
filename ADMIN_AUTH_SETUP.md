# Admin Panel OTP Authentication Setup

## 🔐 नई Admin Security System - OTP Verification

यह document आपकी Admin Panel के नए OTP-based authentication system को explain करता है।

---

## ✨ नई विशेषताएं (New Features)

✅ **Email और Phone Verification** - सिर्फ authorized email और phone से ही access  
✅ **OTP Authentication** - 6-digit OTP verification for extra security  
✅ **Email-based OTP** - OTP आपके email पर आता है  
✅ **10 मिनट Expiry** - OTP 10 मिनट के बाद expire हो जाता है  

---

## 📋 Setup Instructions

### 1️⃣ Backend Configuration (.env file)

अपने `backend/.env` file में ये credentials डालें:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nagrik_news

# Email Configuration (Gmail)
EMAIL_USER=karantiwari062@gmail.com
EMAIL_PASS=your_app_password_here
GMAIL_USER=karantiwari062@gmail.com
GMAIL_PASS=your_app_password_here

# Admin Credentials
ADMIN_PHONE=+916388966546

# JWT Secret
JWT_SECRET=your_secure_jwt_secret_key_here

# Server Port
PORT=5000
```

### 2️⃣ Gmail App Password Setup

Gmail से "App Password" बनाने के लिए:

1. Google Account खोलें: https://myaccount.google.com
2. Security settings में जाएं
3. "App passwords" option को search करें
4. Select "Mail" and "Windows Computer"
5. 16-character password मिलेगा - इसे `EMAIL_PASS` में डालें

**Example:**
```
APP_PASSWORD: abcd efgh ijkl mnop
```

---

## 🔑 Authorized Credentials (Admin Access Only)

### Email
```
karantiwari062@gmail.com
```

### Phone Number
```
+916388966546
```

> ⚠️ **Important:** ये दोनों credentials **exactly** match करने चाहिए, वरना access deny होगी!

---

## 🔄 Authentication Flow

### Step 1: Email और Phone दर्ज करें
```
CMS Dashboard → Admin Panel → Email and Phone fields
```

### Step 2: OTP Request भेजें
```
"Send OTP to Email" button click करें
→ 6-digit OTP आपके email पर आएगा
```

### Step 3: OTP Verify करें
```
OTP field में 6-digit code डालें
→ "Verify OTP" button click करें
→ Login successful! ✅
```

---

## ⚙️ API Endpoints

### Request OTP
```http
POST /api/auth/admin/request-otp
Content-Type: application/json

{
  "email": "karantiwari062@gmail.com",
  "phone": "+916388966546"
}

Response:
{
  "msg": "✅ OTP आपके Email पर भेज दिया गया है!"
}
```

### Verify OTP
```http
POST /api/auth/admin/verify-otp
Content-Type: application/json

{
  "email": "karantiwari062@gmail.com",
  "phone": "+916388966546",
  "otp": "123456"
}

Response:
{
  "msg": "✅ Login Successful! Welcome Admin",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "name": "Karan Tiwari",
    "email": "karantiwari062@gmail.com",
    "phone": "+916388966546"
  }
}
```

---

## 🛡️ Security Features

| Feature | Details |
|---------|---------|
| **Email Verification** | सिर्फ authorized email से ही OTP request हो सकता है |
| **Phone Verification** | सिर्फ matching phone नंबर से ही access मिलेगा |
| **OTP Expiry** | 10 मिनट के बाद OTP automatically expire हो जाता है |
| **One-time OTP** | हर OTP सिर्फ एक बार use हो सकता है |
| **JWT Token** | Token 24 घंटे valid रहता है |

---

## 📝 Database Schema

### AdminOTP Collection
```javascript
{
  _id: ObjectId,
  email: "karantiwari062@gmail.com",
  phone: "+916388966546",
  otp: "123456",
  createdAt: Date (TTL: 600 seconds)
}
```

---

## 🚀 Testing Locally

### 1. Backend Server शुरू करें
```bash
cd backend
npm install
npm start
# Server चलेगा: http://localhost:5000
```

### 2. Frontend Server शुरू करें
```bash
cd frontend
npm install
npm run dev
# Frontend चलेगा: http://localhost:5173 (या कोई अन्य port)
```

### 3. Admin Panel खोलें
```
Browser में जाएं: http://localhost:5173/cms
```

### 4. Test करें
- Email: `karantiwari062@gmail.com`
- Phone: `+916388966546`
- "Send OTP" पर click करें
- Email check करें और OTP note करें
- OTP field में डालें
- Login हो जाएंगे! ✅

---

## 🐛 Troubleshooting

### Problem: "OTP Email नहीं आ रहा है"
**Solution:**
1. Gmail का app password सही है? (16 characters)
2. .env file में EMAIL_PASS सही है?
3. Internet connection ठीक है?
4. Spam folder check करें

### Problem: "यह Email Authorized नहीं है"
**Solution:**
- Email को correctly type करें: `karantiwari062@gmail.com`
- Spaces या extra characters न डालें
- Case-sensitive नहीं है

### Problem: "यह Phone Number Authorized नहीं है"
**Solution:**
- Phone: `+916388966546` (exactly यही format)
- Country code `+91` जरूरी है
- Hyphens या spaces न डालें

### Problem: "गलत OTP! कृपया फिर से try करें"
**Solution:**
1. OTP सही from email में है?
2. 10 मिनट के अंदर enter किया?
3. Extra spaces तो नहीं?

---

## 📱 SMS OTP (Future Feature)

अगर आप SMS पर भी OTP भेजना चाहते हैं, तो:
1. Twilio service integrate कर सकते हैं
2. Backend में SMS sending code add करें
3. Phone number validation improve करें

---

## 💝 Features Summary

| Feature | Status | Details |
|---------|--------|---------|
| Email Verification | ✅ Active | karantiwari062@gmail.com only |
| Phone Verification | ✅ Active | +916388966546 only |
| Email OTP | ✅ Active | Nodemailer via Gmail |
| OTP Expiry | ✅ Active | 10 minutes TTL |
| JWT Token | ✅ Active | 24 hour validity |
| SMS OTP | ⏳ Coming | Twilio integration |

---

## 📞 Support

अगर कोई issue हो:
1. .env file check करें
2. Backend logs देखें
3. Browser console में errors check करें
4. Network tab में API calls check करें

---

**Last Updated:** 2024  
**Version:** 1.0  
**Status:** ✅ Production Ready
