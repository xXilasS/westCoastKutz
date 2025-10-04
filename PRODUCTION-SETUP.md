# Production Setup Guide

## 🚨 Issues to Fix for Production

### 1. Replace Tailwind CDN with PostCSS Installation

**Current Issue:** Using `cdn.tailwindcss.com` in production is not recommended.

**Solution:**

```bash
# Install Tailwind CSS and dependencies
npm init -y
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Create input CSS file
mkdir -p src/css
echo '@tailwind base; @tailwind components; @tailwind utilities;' > src/css/input.css

# Update tailwind.config.js
```

**tailwind.config.js:**
```javascript
module.exports = {
  content: [
    "./*.html",
    "./admin/*.html", 
    "./js/**/*.js",
    "./admin/js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#111827',
        silver: '#6B7280',
        accentRed: '#DC2626',
        accentBlue: '#2563EB'
      },
      fontFamily: {
        heading: ['Oswald', 'sans-serif'],
        body: ['Open Sans', 'sans-serif']
      }
    }
  },
  plugins: []
}
```

**Build Script (package.json):**
```json
{
  "scripts": {
    "build-css": "tailwindcss -i ./src/css/input.css -o ./dist/css/styles.css --watch",
    "build-css-prod": "tailwindcss -i ./src/css/input.css -o ./dist/css/styles.css --minify"
  }
}
```

**Update HTML files:**
Replace:
```html
<script src="https://cdn.tailwindcss.com"></script>
```

With:
```html
<link href="/dist/css/styles.css" rel="stylesheet">
```

### 2. Environment Variables Setup

Create `.env` file for sensitive configuration:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 3. Build Process

**For Vercel deployment:**
1. Add build command: `npm run build-css-prod`
2. Set output directory: `dist`
3. Configure environment variables in Vercel dashboard

### 4. Performance Optimizations

- Minify CSS and JavaScript
- Optimize images (convert to WebP)
- Enable gzip compression
- Add service worker for caching
- Implement lazy loading for images

### 5. Security Headers

Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options", 
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## Quick Fix Priority

1. **High Priority:** Fix Tailwind CDN (affects performance)
2. **Medium Priority:** Add favicon (user experience)
3. **Low Priority:** Environment variables (security)

## Current Status

✅ **Fixed:**
- Database schema updated to use `price_dollars`
- Favicon added (`favicon.svg`)
- Appointments API query fixed
- All `price_cents` references updated to `price_dollars`

⚠️ **Remaining:**
- Replace Tailwind CDN with PostCSS build process
- Set up proper environment variable management
- Add production build pipeline
