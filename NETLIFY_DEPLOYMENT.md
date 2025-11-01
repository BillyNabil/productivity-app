# 🚀 Netlify Deployment Guide

A complete guide to deploying the Productivity App to Netlify.

---

## 📋 Prerequisites

1. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
2. **GitHub Repository** - Repository already pushed to GitHub
3. **Environment Variables** - Supabase and Gemini API keys

---

## ✨ Step-by-Step Deployment

### 1. Connect GitHub to Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **GitHub** as your Git provider
4. Authorize Netlify to access your GitHub account
5. Search for and select **`productivity-app`** repository

### 2. Configure Build Settings

The build settings should auto-detect from `netlify.toml`:

- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Node version:** 18.18.0

✅ These are already configured in `netlify.toml`

### 3. Set Environment Variables

**Important:** Netlify won't have access to your `.env.local` file.

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Click **"Edit variables"**
3. Add the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

4. Click **"Save"** to apply

### 4. Deploy

After connecting your repository:

1. Netlify will automatically trigger a build
2. You'll see build progress in the **Deploys** tab
3. Once complete, you'll get a live URL like: `https://your-site.netlify.app`

---

## 🔧 Build Configuration Details

### `netlify.toml` Settings

```toml
[build]
command = "npm run build"        # Run Next.js build
publish = ".next"               # Publish the .next directory
node_version = "18.18.0"        # Node.js version
```

### Build Process

1. **Install Dependencies:** `npm install` (automatic)
2. **Build:** `npm run build` (runs next.config.ts optimizations)
3. **Publish:** Deploys `.next` directory to Netlify CDN

### Build Time

- First build: ~3-5 minutes
- Subsequent builds: ~1-2 minutes (with caching)

---

## 🌐 Custom Domain Setup

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `productivity.app`)
4. Follow DNS configuration instructions
5. Netlify will auto-provision SSL certificate

---

## 📊 Monitoring & Analytics

### Deploy Preview

- Every PR creates an automatic preview deployment
- Preview URL: `https://deploy-preview-{number}--your-site.netlify.app`

### Netlify Analytics

1. Go to **Site settings** → **Analytics**
2. Enable Netlify Analytics for performance metrics

### Build Logs

1. Go to **Deploys** tab
2. Click on a build to see detailed logs
3. Useful for debugging build failures

---

## 🆘 Troubleshooting

### Build Failure: "npm: command not found"

**Solution:** Node.js version mismatch
1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Set `NODE_VERSION=18.18.0`

### Build Failure: "NEXT_PUBLIC_SUPABASE_URL is not defined"

**Solution:** Missing environment variables
1. Check **Site settings** → **Build & deploy** → **Environment**
2. Verify all required variables are set
3. Redeploy after adding missing variables

### Build Failure: API Keys Invalid

**Solution:** Verify API keys
1. Check Supabase dashboard for correct URL and keys
2. Check Google AI Studio for valid Gemini API key
3. Update environment variables in Netlify

### Slow Build Time

**Solution:** 
1. Check for large dependencies (node_modules)
2. Consider using `pnpm` instead of `npm` (faster lockfile)
3. Review and optimize build scripts

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore` ✅
2. **Use Netlify UI for secrets** - Don't hardcode in files
3. **Rotate API keys regularly** - Especially after deployment
4. **Enable CORS properly** - For Supabase integration
5. **Use HTTPS everywhere** - Netlify auto-enables SSL

---

## 📱 Testing Deployment

After deployment, verify:

```bash
# 1. Visit your Netlify URL
https://your-site.netlify.app

# 2. Check all features work:
- ✅ Authentication (sign up/login)
- ✅ Dashboard loads
- ✅ Create a task
- ✅ AI chat works
- ✅ Analytics display
- ✅ Dark mode toggle

# 3. Check Console (F12)
- No errors or warnings
- Network requests successful
```

---

## 🔄 Continuous Deployment

Netlify auto-deploys on:

- **Push to master:** Triggers production deployment
- **Pull Requests:** Creates automatic preview
- **Rollback:** Available in Deploys tab

To manually trigger a rebuild:
1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**

---

## 📈 Performance Optimization

### Before Deployment

1. Run build locally: `npm run build`
2. Check build size: `npm run analyze` (if available)
3. Test all features work

### After Deployment

1. Use Netlify Analytics
2. Check Core Web Vitals
3. Monitor real-time traffic
4. Review error logs

---

## 🚀 Advanced Features

### Netlify Functions

To add serverless functions:

1. Create `functions/` directory in root
2. Add `.js` or `.ts` files
3. Netlify automatically deploys them
4. Access at `https://your-site.netlify.app/.netlify/functions/function-name`

### Webhooks

Set up post-deploy notifications:

1. Go to **Site settings** → **Build & deploy** → **Deploy notifications**
2. Add Slack, email, or custom webhook
3. Get notified on successful/failed deploys

### A/B Testing

Use Netlify Analytics Engine for:
- Split testing
- Feature flags
- Usage analytics

---

## 📞 Support

- **Netlify Support:** [support.netlify.com](https://support.netlify.com)
- **Next.js on Netlify:** [netlify.com/blog/next-js](https://www.netlify.com/blog/next-js/)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)

---

## ✅ Deployment Checklist

- [ ] GitHub repository created and synced
- [ ] Netlify account created
- [ ] Repository connected to Netlify
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] First deployment successful
- [ ] Custom domain configured (optional)
- [ ] All features tested on live site
- [ ] SSL certificate active
- [ ] Analytics enabled

---

## 🎉 You're Live!

Your Productivity App is now deployed and accessible to the world!

**Your Netlify URL:** `https://your-site.netlify.app`

**GitHub Repository:** `https://github.com/BillyNabil/productivity-app`

Enjoy! 🚀
