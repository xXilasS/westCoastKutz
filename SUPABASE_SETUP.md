# West Coast Kutz - Supabase Setup Guide

This guide will help you configure Supabase for your West Coast Kutz booking system, enabling customer authentication and admin dashboard functionality.

## 🚀 Quick Start

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project" and fill in the details:
   - **Name**: West Coast Kutz
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest to your location
3. Wait for the project to be created (2-3 minutes)

### Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **anon public** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role** key (also starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### Step 3: Configure Your Application

Choose one of these configuration methods:

## 🔧 Configuration Options

### Option 1: Quick Setup (Recommended for Testing)

Add this script tag to the `<head>` section of both `index.html` and `admin/index.html`:

```html
<script>
window.SUPABASE_CONFIG = {
    url: 'https://your-project-id.supabase.co',
    anonKey: 'your-anon-key-here'
};
</script>
```

**Example:**
```html
<head>
    <!-- Other head content -->
    <script>
    window.SUPABASE_CONFIG = {
        url: 'https://abcdefghijklmnop.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODc2ODAwMCwiZXhwIjoyMDE0MzQ0MDAwfQ.example-signature'
    };
    </script>
    <!-- Rest of head content -->
</head>
```

### Option 2: Environment Variables (Production)

Create a `.env.local` file in your project root:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Option 3: Vercel Deployment

If deploying to Vercel, add these environment variables in your Vercel dashboard:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add these variables:
   - `SUPABASE_URL`: Your project URL
   - `SUPABASE_ANON_KEY`: Your anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key

## 🗄️ Database Setup

### Step 4: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `database-schema.sql` from your project
3. Paste it into the SQL editor and click **Run**
4. This will create all necessary tables and security policies

### Step 5: Create Your First Admin User

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click **Add User** and create an account with your email
3. Go to **Table Editor** → **user_profiles**
4. Find your user record and change the `role` from `customer` to `admin`

## ✅ Testing Your Setup

### Test Customer Authentication

1. Open your main site (`index.html`)
2. Click "Sign Up" in the navigation
3. Create a test customer account
4. Verify you can log in and access the account dashboard

### Test Admin Dashboard

1. Open the admin dashboard (`admin/index.html`)
2. You should see the login form (not a setup message)
3. Log in with your admin account
4. Verify you can access the dashboard and manage services

## 🔒 Security Notes

### Important Security Considerations

1. **Never expose your service role key** in client-side code
2. **Use environment variables** for production deployments
3. **Enable Row Level Security** (RLS) on all tables (included in schema)
4. **Regularly rotate your keys** if they're compromised

### Row Level Security Policies

The database schema includes these security policies:

- **Public access**: Services, barbers, gallery images (read-only)
- **User profiles**: Users can only view/edit their own profile
- **Appointments**: Users can only see their own appointments
- **Admin access**: Only admin users can manage services, barbers, etc.

## 🚨 Troubleshooting

### Common Issues

**Error: "Invalid supabaseUrl"**
- Check that your URL starts with `https://` and ends with `.supabase.co`
- Verify there are no extra spaces or characters

**Error: "Invalid API key"**
- Make sure you're using the `anon` key for client-side code
- Verify the key is copied completely (they're very long)

**Admin dashboard shows "Access denied"**
- Check that your user's role is set to `admin` in the `user_profiles` table
- Verify you're logged in with the correct account

**Authentication not working**
- Clear your browser cache and cookies
- Check the browser console for error messages
- Verify your Supabase project is active and not paused

### Getting Help

If you encounter issues:

1. Check the browser console for error messages
2. Verify your Supabase project is active in the dashboard
3. Test your credentials using the Supabase JavaScript client directly
4. Check the Supabase logs in your dashboard for API errors

## 📚 Next Steps

Once Supabase is configured:

1. **Test the complete booking flow** with real data
2. **Set up email templates** in Supabase for user verification
3. **Configure storage buckets** for image uploads (gallery/hero images)
4. **Set up webhooks** for real-time notifications (optional)
5. **Deploy to production** with environment variables

## 💰 Cost Management

### Free Tier Limits

Supabase free tier includes:
- **Database**: 500MB storage
- **Auth**: 50,000 monthly active users
- **Storage**: 1GB
- **Edge Functions**: 500,000 invocations/month

### Monitoring Usage

Monitor your usage in the Supabase dashboard:
- Go to **Settings** → **Usage**
- Set up billing alerts before hitting limits
- Upgrade to Pro plan ($25/month) when needed

---

**Need help?** Check the [Supabase documentation](https://supabase.com/docs) or contact support.
