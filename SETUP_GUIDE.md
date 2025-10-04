# West Coast Kutz Booking System Setup Guide

## Overview
This guide will help you set up a complete, cost-effective booking system that integrates seamlessly with your existing West Coast Kutz website. The system uses only free-tier services to minimize costs while eliminating third-party booking fees.

## Cost Breakdown
- **Hosting (Vercel):** $0/month (free tier)
- **Database (Supabase):** $0/month (free tier)
- **Email (SendGrid):** $0/month (100 emails/day free)
- **SMS (Twilio):** $0-15/month (after $15 free trial credit)
- **Total Monthly Cost:** $0-15/month maximum

## Prerequisites
- GitHub account (for Vercel deployment)
- Basic understanding of web development
- Access to your domain's DNS settings

## 🚨 Important: Authentication Configuration

The booking system includes customer authentication and admin dashboard features. **These require Supabase configuration to work properly.**

### Quick Test Setup (Before Full Deployment)

To test the authentication features locally:

1. **Create a Supabase project** (see Step 1 below)
2. **Add configuration script** to both `index.html` and `admin/index.html` in the `<head>` section:

```html
<script>
window.SUPABASE_CONFIG = {
    url: 'https://your-project-id.supabase.co',
    anonKey: 'your-anon-key-here'
};
</script>
```

3. **Run the database schema** from `database-schema.sql`
4. **Create an admin user** and set their role to 'admin' in the user_profiles table

### Without Supabase Configuration

If you haven't set up Supabase yet:
- ✅ **Booking system works** in demo mode with mock data
- ❌ **Customer authentication disabled** (Sign In/Sign Up buttons won't work)
- ❌ **Admin dashboard shows setup instructions** instead of login
- ❌ **No real appointment data** stored

**For full functionality, complete the Supabase setup below.**

## Step 1: Set Up Supabase (Database)

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/login with GitHub
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: "west-coast-kutz-booking"
   - Database Password: (generate strong password)
   - Region: Choose closest to your location
6. Click "Create new project"

### 1.2 Set Up Database Schema
1. In Supabase dashboard, go to "SQL Editor"
2. Copy and paste the contents of `database-schema.sql`
3. Click "Run" to execute the schema
4. Verify tables were created in "Table Editor"

### 1.3 Get API Keys
1. Go to "Settings" → "API"
2. Copy the following values:
   - Project URL
   - Anon (public) key
   - Service role key

## Step 2: Set Up Vercel (Hosting)

### 2.1 Install Vercel CLI
```bash
npm install -g vercel
```

### 2.2 Deploy to Vercel
1. In your project directory, run:
```bash
npm install
vercel login
vercel
```

2. Follow the prompts:
   - Link to existing project? No
   - Project name: west-coast-kutz-booking
   - Directory: ./
   - Override settings? No

### 2.3 Set Environment Variables
In Vercel dashboard:
1. Go to your project → "Settings" → "Environment Variables"
2. Add the following variables:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Step 3: Set Up Stripe (Payment Processing)

### 3.1 Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Sign up for account
3. Complete business verification

### 3.2 Get API Keys
1. In Stripe dashboard, go to "Developers" → "API keys"
2. Copy "Publishable key" and "Secret key" (test mode)
3. Add to Vercel environment variables:

```
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
```

## Step 4: Set Up SendGrid (Email)

### 4.1 Create SendGrid Account
1. Go to [sendgrid.com](https://sendgrid.com)
2. Sign up for free account (100 emails/day)
3. Verify your email address

### 4.2 Create API Key
1. Go to "Settings" → "API Keys"
2. Click "Create API Key"
3. Choose "Restricted Access"
4. Give permissions for "Mail Send"
5. Add to Vercel environment variables:

```
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

## Step 5: Set Up Twilio (SMS)

### 5.1 Create Twilio Account
1. Go to [twilio.com](https://twilio.com)
2. Sign up for free account ($15 trial credit)
3. Verify your phone number

### 5.2 Get Credentials
1. In Twilio Console, find:
   - Account SID
   - Auth Token
   - Phone Number (from "Phone Numbers" section)
2. Add to Vercel environment variables:

```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## Step 6: Update Your Existing Website

### 6.1 Update index.html
Your existing "Book Now" links already point to `/book` which will work perfectly with the new system. No changes needed!

### 6.2 Add Custom Domain (Optional)
1. In Vercel dashboard, go to "Settings" → "Domains"
2. Add your custom domain
3. Update DNS records as instructed

## Step 7: Test the System

### 7.1 Test Booking Flow
1. Visit your deployed site
2. Click any "Book Now" button
3. Complete the booking process
4. Verify appointment appears in Supabase

### 7.2 Test Notifications
1. Complete a test booking with your real phone/email
2. Verify you receive SMS and email confirmations

## Step 8: Go Live

### 8.1 Switch to Production
1. In Stripe, switch to live mode and get live API keys
2. Update Vercel environment variables with live keys
3. Test with a small real transaction

### 8.2 Monitor Usage
- Supabase: Monitor database usage in dashboard
- Vercel: Check function execution limits
- SendGrid: Monitor email sending limits
- Twilio: Monitor SMS usage and credits

## Maintenance

### Monthly Tasks
- Check Supabase storage usage (500MB limit)
- Monitor Vercel function executions
- Review Twilio SMS costs
- Backup appointment data

### Scaling Options
When you outgrow free tiers:
- Supabase Pro: $25/month (8GB database, 100GB bandwidth)
- Vercel Pro: $20/month (unlimited functions)
- SendGrid Essentials: $15/month (40,000 emails)

## Support

### Common Issues
1. **CORS Errors:** Check Vercel CORS headers in `vercel.json`
2. **Database Connection:** Verify Supabase URL and keys
3. **Payment Failures:** Check Stripe webhook configuration
4. **SMS Not Sending:** Verify Twilio phone number verification

### Getting Help
- Supabase: [docs.supabase.com](https://docs.supabase.com)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Stripe: [stripe.com/docs](https://stripe.com/docs)

## Security Notes
- Never commit `.env` files to version control
- Use environment variables for all API keys
- Enable Row Level Security in Supabase
- Regularly rotate API keys
- Monitor for unusual activity

## Next Steps
Once the basic system is running, consider adding:
- Appointment reminders (24 hours before)
- Customer loyalty program
- Online reviews integration
- Advanced scheduling features
- Mobile app (using same backend)


- QHHI2RVuSeQwgTYp (supabase password)
- https://mktvcfzlojebtuwnehej.supabase.co (supabase url)
- eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rdHZjZnpsb2plYnR1d25laGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NDkyMzIsImV4cCI6MjA3NTAyNTIzMn0.RPat9Gv4vxBVP-EBOuyAe6KuPXGMma1jI9RX3I8sYq0 (anon key)

- eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rdHZjZnpsb2plYnR1d25laGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQ0OTIzMiwiZXhwIjoyMDc1MDI1MjMyfQ.nwIwB02ZNkWKnoHqo0rHD540OqJODzwXCA11k2xTuGs (service role key) 