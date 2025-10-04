# Google OAuth Quick Start Guide
## Get Google Login Working in 20 Minutes

## 🎯 **Goal**
Add "Sign in with Google" to your West Coast Kutz booking page.

---

## 📋 **Prerequisites**
- [ ] Your Supabase credentials updated in your code
- [ ] Your website deployed on Vercel
- [ ] Google account (any Gmail account works)

---

## 🔧 **Step 1: Create Google OAuth Application (10 minutes)**

### **1.1 Go to Google Cloud Console**
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account
3. Click **"Select a project"** → **"New Project"**
4. **Project name**: `West Coast Kutz`
5. Click **"Create"**

### **1.2 Enable Required APIs**
1. In the left sidebar: **APIs & Services** → **Library**
2. Search for **"Google+ API"** → Click it → **"Enable"**
3. Search for **"Google Identity"** → Click it → **"Enable"**

### **1.3 Create OAuth Credentials**
1. Left sidebar: **APIs & Services** → **Credentials**
2. Click **"+ Create Credentials"** → **"OAuth 2.0 Client IDs"**
3. If prompted, configure OAuth consent screen:
   - **User Type**: External
   - **App name**: West Coast Kutz
   - **User support email**: Your email
   - **Developer contact**: Your email
   - Click **"Save and Continue"** through all steps

4. **Create OAuth Client ID:**
   - **Application type**: Web application
   - **Name**: West Coast Kutz Web
   - **Authorized JavaScript origins**: 
     ```
     https://your-vercel-domain.vercel.app
     https://your-supabase-project.supabase.co
     ```
   - **Authorized redirect URIs**:
     ```
     https://your-supabase-project.supabase.co/auth/v1/callback
     ```
   - Click **"Create"**

5. **Copy your credentials:**
   - **Client ID**: `123456789-abc123.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-abc123def456...`
   - **Save these!** You'll need them in the next step.

---

## 🔧 **Step 2: Configure Google in Supabase (5 minutes)**

### **2.1 Open Supabase Dashboard**
1. Go to: https://supabase.com/dashboard
2. Select your **West Coast Kutz** project
3. Left sidebar: **Authentication** → **Providers**

### **2.2 Configure Google Provider**
1. Find **Google** in the list
2. Click the **toggle** to enable it
3. Enter your credentials:
   - **Client ID**: Paste from Google Cloud Console
   - **Client Secret**: Paste from Google Cloud Console
4. Click **"Save"**

### **2.3 Configure Site URL**
1. Go to **Authentication** → **URL Configuration**
2. **Site URL**: `https://your-vercel-domain.vercel.app`
3. **Redirect URLs**: Add these:
   ```
   https://your-vercel-domain.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```
4. Click **"Save"**

---

## 🔧 **Step 3: Update Your Code (5 minutes)**

### **3.1 Update Supabase Credentials**

**In `book.html` (lines 300-301):**
```javascript
const supabaseUrl = 'https://your-project.supabase.co'; // Your actual URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Your actual anon key
```

**In `auth/callback.html` (lines 15-16):**
```javascript
const supabaseUrl = 'https://your-project.supabase.co'; // Your actual URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Your actual anon key
```

**In `js/booking.js` (lines 15-16):**
```javascript
this.supabaseUrl = 'https://your-project.supabase.co';
this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### **3.2 Deploy to Vercel**
```bash
git add .
git commit -m "Add Google OAuth authentication"
git push origin main
```

---

## 🧪 **Step 4: Test Google Login**

### **4.1 Test the Flow**
1. **Go to your booking page**: `https://your-vercel-domain.vercel.app/book.html`
2. **Navigate to Step 4** (Customer Information)
3. **Click "Google" button**
4. **Sign in with your Google account**
5. **You should be redirected back** with your info pre-filled

### **4.2 Verify in Supabase**
1. **Supabase Dashboard** → **Authentication** → **Users**
2. **You should see your Google account** listed
3. **Database** → **user_profiles** → **Should have a new record**

---

## 🚨 **Troubleshooting**

### **Common Issues:**

**❌ "redirect_uri_mismatch"**
- Check that redirect URIs in Google Cloud Console match exactly
- Make sure you're using the correct Vercel domain

**❌ "Configuration error"**
- Verify Supabase credentials are correct in your code
- Check that Google provider is enabled in Supabase

**❌ "Provider not enabled"**
- Make sure you clicked "Save" in Supabase after enabling Google
- Check that Client ID and Secret are entered correctly

**❌ Button doesn't work**
- Check browser console for JavaScript errors
- Verify Supabase JavaScript library is loaded

### **Debug Steps:**
1. **Check browser console** for errors
2. **Verify Supabase credentials** are not placeholder values
3. **Test redirect URLs** match exactly
4. **Check Supabase logs** in Dashboard → Logs

---

## ✅ **Success Checklist**

- [ ] Google Cloud Console project created
- [ ] OAuth credentials generated
- [ ] Google provider enabled in Supabase
- [ ] Supabase credentials updated in code
- [ ] Code deployed to Vercel
- [ ] Google login button works
- [ ] User profile created in database
- [ ] Form pre-fills after login

---

## 🎉 **Next Steps After Google Works**

1. **Test thoroughly** with different Google accounts
2. **Get user feedback** on the experience
3. **Consider adding Microsoft** (follow similar process)
4. **Apple is optional** (requires $99/year developer account)

**Estimated total time: 20 minutes**  
**Cost: FREE** ✅

---

## 📞 **Need Help?**

If you get stuck:
1. **Check the troubleshooting section** above
2. **Look at browser console** for specific error messages
3. **Verify all URLs match exactly** (no trailing slashes)
4. **Test one step at a time** to isolate issues

**The most common issue is mismatched redirect URLs - double-check those first!**
