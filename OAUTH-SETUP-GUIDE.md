# OAuth Social Authentication Setup Guide
## West Coast Kutz - Google, Apple, and Microsoft OAuth Integration

This guide will walk you through setting up social authentication with Google, Apple, and Microsoft OAuth providers.

## 🔧 **Step 1: Configure OAuth Providers in Supabase Dashboard**

### **1.1 Access Supabase Authentication Settings**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your West Coast Kutz project
3. Navigate to **Authentication** → **Providers** in the left sidebar
4. You'll see a list of available providers

### **1.2 Configure Site URL and Redirect URLs**
Before setting up providers, configure your site URLs:

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `https://your-vercel-domain.vercel.app` (your actual Vercel URL)
3. Add **Redirect URLs**:
   ```
   https://your-vercel-domain.vercel.app/auth/callback
   https://your-vercel-domain.vercel.app/admin/auth/callback
   http://localhost:3000/auth/callback (for local development)
   ```

---

## 🔵 **Step 2: Google OAuth Setup**

### **2.1 Create Google OAuth Application**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google+ API** and **Google Identity API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Choose **Web application**
6. Configure:
   - **Name**: West Coast Kutz
   - **Authorized JavaScript origins**: 
     ```
     https://your-vercel-domain.vercel.app
     https://your-supabase-project.supabase.co
     ```
   - **Authorized redirect URIs**:
     ```
     https://your-supabase-project.supabase.co/auth/v1/callback
     ```

### **2.2 Configure Google in Supabase**
1. In Supabase Dashboard → **Authentication** → **Providers**
2. Find **Google** and click **Configure**
3. Enable the provider
4. Enter your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
5. Click **Save**

---

## 🍎 **Step 3: Apple OAuth Setup**

### **3.1 Create Apple Developer Account Setup**
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Sign in with your Apple ID (requires Apple Developer Program membership - $99/year)
3. Go to **Certificates, Identifiers & Profiles**
4. Create a new **App ID**:
   - **Description**: West Coast Kutz
   - **Bundle ID**: `com.westcoastkutz.app` (or your domain)
   - Enable **Sign In with Apple**

### **3.2 Create Service ID**
1. In Apple Developer Portal, go to **Identifiers**
2. Click **+** → **Services IDs**
3. Configure:
   - **Description**: West Coast Kutz Web
   - **Identifier**: `com.westcoastkutz.web`
   - Enable **Sign In with Apple**
   - Configure **Web Authentication Configuration**:
     - **Primary App ID**: Select the App ID created above
     - **Domains**: `your-supabase-project.supabase.co`
     - **Return URLs**: `https://your-supabase-project.supabase.co/auth/v1/callback`

### **3.3 Create Private Key**
1. Go to **Keys** → **+**
2. **Key Name**: West Coast Kutz Sign In
3. Enable **Sign In with Apple**
4. Configure with your App ID
5. **Download the .p8 key file** (save it securely)
6. Note the **Key ID**

### **3.4 Configure Apple in Supabase**
1. In Supabase Dashboard → **Authentication** → **Providers**
2. Find **Apple** and click **Configure**
3. Enable the provider
4. Enter Apple OAuth credentials:
   - **Client ID**: Your Service ID (e.g., `com.westcoastkutz.web`)
   - **Client Secret**: Generate using Apple's requirements (complex process)
   - **Team ID**: From Apple Developer Account
   - **Key ID**: From the private key created above
   - **Private Key**: Content of the .p8 file
5. Click **Save**

**Note**: Apple OAuth setup is the most complex. Consider implementing Google and Microsoft first.

---

## 🔷 **Step 4: Microsoft OAuth Setup**

### **4.1 Create Microsoft Azure Application**
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Configure:
   - **Name**: West Coast Kutz
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**: 
     - Type: **Web**
     - URI: `https://your-supabase-project.supabase.co/auth/v1/callback`

### **4.2 Configure Application**
1. After creation, go to **Authentication**
2. Add additional redirect URIs if needed
3. Go to **Certificates & secrets**
4. Create a **New client secret**
5. Copy the **Value** (this is your Client Secret)
6. Note the **Application (client) ID** from the Overview page

### **4.3 Configure Microsoft in Supabase**
1. In Supabase Dashboard → **Authentication** → **Providers**
2. Find **Azure** (Microsoft) and click **Configure**
3. Enable the provider
4. Enter Microsoft OAuth credentials:
   - **Client ID**: Application (client) ID from Azure
   - **Client Secret**: Client secret value from Azure
5. Click **Save**

---

## 🎯 **Step 5: Frontend Implementation**

After configuring the providers in Supabase, you'll need to implement the frontend code to trigger social authentication. The next steps will involve:

1. Adding social login buttons to your booking page
2. Implementing OAuth sign-in functions
3. Handling OAuth callbacks
4. Creating user profiles for social sign-ins
5. Integrating with your existing booking flow

**Continue to the next section for frontend implementation details.**

---

## 🔍 **Troubleshooting Common Issues**

### **Google OAuth Issues**
- **Error**: `redirect_uri_mismatch` → Check that redirect URIs match exactly
- **Error**: `invalid_client` → Verify Client ID and Secret are correct

### **Apple OAuth Issues**
- **Error**: `invalid_client` → Apple setup is complex, double-check all IDs and keys
- **Error**: `invalid_grant` → Check that Service ID and App ID are properly linked

### **Microsoft OAuth Issues**
- **Error**: `AADSTS50011` → Check redirect URI configuration in Azure
- **Error**: `invalid_client` → Verify Application ID and Client Secret

### **General Supabase Issues**
- **Error**: `Provider not enabled` → Make sure provider is enabled in Supabase dashboard
- **Error**: `Invalid redirect URL` → Check Site URL and Redirect URL configuration

---

## 📞 **Need Help?**

If you encounter issues:
1. Check Supabase logs in Dashboard → **Logs**
2. Verify all URLs match exactly (no trailing slashes, correct protocols)
3. Test with one provider at a time
4. Start with Google (easiest) before moving to Apple (most complex)

**Next**: Implement the frontend social authentication code.
