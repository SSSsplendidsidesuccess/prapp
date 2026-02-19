# Vercel Deployment Guide - Sales Call Prep Platform Frontend

## Overview
This guide walks you through deploying the Sales Call Prep platform frontend to Vercel.

## Prerequisites
- GitHub repository with latest code (✅ Already pushed)
- Vercel account (https://vercel.com)
- Backend deployed to Render (see `RENDER_DEPLOYMENT_GUIDE.md`)
- Backend URL from Render deployment

---

## Deployment Steps

### Step 1: Prepare for Deployment

1. **Ensure Backend is Deployed First**
   - Backend must be live on Render
   - Note your backend URL (e.g., `https://prapp-backend.onrender.com`)
   - Verify backend health endpoint works

2. **Check Frontend Build**
   ```bash
   cd ../frontend
   npm run build
   ```
   - Should complete with exit code 0
   - No TypeScript errors

### Step 2: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Log in to your account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Click "Import Git Repository"
   - Select: `SSSsplendidsidesuccess/prapp`
   - Click "Import"

3. **Configure Project**

   **Framework Preset:** Next.js (auto-detected)
   
   **Root Directory:** `frontend` (IMPORTANT!)
   - Click "Edit" next to Root Directory
   - Enter: `frontend`
   - Click "Continue"

   **Build Settings:**
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

4. **Environment Variables**

   Click "Environment Variables" and add:

   | Key | Value | Notes |
   |-----|-------|-------|
   | `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com` | Your Render backend URL (NO trailing slash) |

   **Example:**
   ```
   NEXT_PUBLIC_API_URL=https://prapp-backend.onrender.com
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-5 minutes for deployment
   - Vercel will build and deploy automatically

6. **Get Frontend URL**
   - After deployment, note your frontend URL
   - Example: `https://prapp-frontend.vercel.app`

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd ../frontend

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? prapp-frontend
# - Directory? ./
# - Override settings? No

# Add environment variable
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-backend.onrender.com
```

---

### Step 3: Update Backend CORS

After frontend deployment, update backend CORS settings:

1. **Go to Render Dashboard**
   - Open your backend service
   - Click "Environment"

2. **Update CORS_ORIGINS**
   - Find `CORS_ORIGINS` variable
   - Change from `*` to your frontend URL
   - Example: `https://prapp-frontend.vercel.app`
   - Click "Save Changes"

3. **Redeploy Backend**
   - Click "Manual Deploy" → "Deploy latest commit"
   - Wait for deployment to complete

---

## Verification Steps

### 1. Check Frontend Loads

Visit your Vercel URL: `https://your-frontend.vercel.app`

Expected:
- Landing page loads
- No console errors
- Styling appears correctly

### 2. Test Authentication

1. Click "Sign Up"
2. Create a test account
3. Verify you can log in
4. Check you're redirected to profile page

### 3. Test API Connection

Open browser console and check:
- No CORS errors
- API requests going to correct backend URL
- Responses returning successfully

### 4. Test Core Features

- [ ] User signup/login works
- [ ] Profile page loads
- [ ] Can navigate between pages
- [ ] Knowledge Base page accessible
- [ ] Talk Points page accessible
- [ ] Sales Setup page accessible
- [ ] Can start a session
- [ ] Session chat works
- [ ] Evaluation displays correctly

---

## Common Issues & Solutions

### Issue 1: API Requests Fail
**Error:** `Failed to fetch` or `Network error`
**Solution:**
- Check `NEXT_PUBLIC_API_URL` is correct
- Ensure no trailing slash in URL
- Verify backend is running on Render

### Issue 2: CORS Errors
**Error:** `CORS policy blocked`
**Solution:**
- Update `CORS_ORIGINS` on Render backend
- Add your Vercel frontend URL
- Redeploy backend

### Issue 3: Environment Variable Not Working
**Error:** API calls going to wrong URL
**Solution:**
- Verify environment variable name: `NEXT_PUBLIC_API_URL`
- Must start with `NEXT_PUBLIC_` to be accessible in browser
- Redeploy frontend after adding variable

### Issue 4: Build Fails
**Error:** TypeScript errors or build errors
**Solution:**
- Check build logs in Vercel dashboard
- Ensure all dependencies in `package.json`
- Verify Node.js version compatibility

### Issue 5: 404 on Routes
**Error:** Page not found on refresh
**Solution:**
- Vercel should auto-configure Next.js routing
- Check `next.config.js` is present
- Ensure using Next.js App Router correctly

---

## Post-Deployment Checklist

- [ ] Frontend deployed successfully
- [ ] Environment variables set correctly
- [ ] Backend CORS updated with frontend URL
- [ ] Can access all pages
- [ ] Authentication works (signup/login)
- [ ] API calls successful
- [ ] No console errors
- [ ] Mobile responsive
- [ ] All features functional

---

## Custom Domain (Optional)

### Add Custom Domain to Vercel

1. **Go to Project Settings**
   - Open your project in Vercel
   - Click "Settings" → "Domains"

2. **Add Domain**
   - Click "Add"
   - Enter your domain (e.g., `prapp.com`)
   - Follow DNS configuration instructions

3. **Update Backend CORS**
   - Add custom domain to `CORS_ORIGINS`
   - Example: `https://prapp.com`

### Add Custom Domain to Render (Backend)

1. **Go to Service Settings**
   - Open backend service in Render
   - Click "Settings" → "Custom Domain"

2. **Add Domain**
   - Enter subdomain (e.g., `api.prapp.com`)
   - Follow DNS configuration instructions

3. **Update Frontend Environment**
   - Update `NEXT_PUBLIC_API_URL` in Vercel
   - Change to: `https://api.prapp.com`
   - Redeploy frontend

---

## Monitoring & Maintenance

### View Deployment Logs
- Go to Vercel dashboard
- Click on your project
- Click "Deployments"
- Click on specific deployment to view logs

### View Analytics
- Go to project in Vercel
- Click "Analytics" tab
- View page views, performance, etc.

### Redeploy
- Push changes to GitHub
- Vercel auto-deploys from `main` branch
- Or click "Redeploy" in dashboard

### Rollback
- Go to "Deployments"
- Find previous successful deployment
- Click "..." → "Promote to Production"

---

## Environment Variables Reference

### Required Variables

```env
# Backend API URL (NO trailing slash)
NEXT_PUBLIC_API_URL=https://prapp-backend.onrender.com
```

### Optional Variables (for future)

```env
# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_TALK_POINTS=true

# API Timeouts
NEXT_PUBLIC_API_TIMEOUT=30000
```

---

## Performance Optimization

### Enable Vercel Speed Insights

1. Go to project settings
2. Click "Speed Insights"
3. Enable feature
4. Add to your app:

```bash
npm install @vercel/speed-insights
```

### Enable Vercel Analytics

1. Go to project settings
2. Click "Analytics"
3. Enable feature
4. Add to your app:

```bash
npm install @vercel/analytics
```

---

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Support:** https://vercel.com/support

---

## Deployment Architecture

```
┌─────────────────────────────────────────────┐
│                                             │
│  User Browser                               │
│                                             │
└────────────────┬────────────────────────────┘
                 │
                 │ HTTPS
                 │
┌────────────────▼────────────────────────────┐
│                                             │
│  Vercel (Frontend)                          │
│  - Next.js App                              │
│  - Static Assets                            │
│  - Edge Functions                           │
│  URL: https://prapp-frontend.vercel.app     │
│                                             │
└────────────────┬────────────────────────────┘
                 │
                 │ API Calls
                 │ NEXT_PUBLIC_API_URL
                 │
┌────────────────▼────────────────────────────┐
│                                             │
│  Render (Backend)                           │
│  - FastAPI Server                           │
│  - Python 3.11                              │
│  - 34 API Endpoints                         │
│  URL: https://prapp-backend.onrender.com    │
│                                             │
└────────────────┬────────────────────────────┘
                 │
                 ├──────────────┬─────────────┐
                 │              │             │
        ┌────────▼─────┐  ┌────▼─────┐  ┌───▼────┐
        │              │  │          │  │        │
        │  MongoDB     │  │  OpenAI  │  │  File  │
        │  Atlas       │  │  API     │  │  Store │
        │              │  │          │  │        │
        └──────────────┘  └──────────┘  └────────┘
```

---

## Next Steps After Deployment

1. **Test All Features End-to-End**
   - Create account
   - Upload documents
   - Generate talk points
   - Start sales session
   - Complete session
   - View evaluation

2. **Share with Beta Users**
   - Get feedback
   - Monitor for errors
   - Track usage

3. **Monitor Performance**
   - Check Vercel Analytics
   - Monitor Render logs
   - Track API response times

4. **Plan Post-MVP Features**
   - See `SPRINT_F3_SUMMARY.md` for recommendations
   - Prioritize based on user feedback

---

## Congratulations! 🎉

Your Sales Call Prep platform is now live in production!

- **Frontend:** https://your-frontend.vercel.app
- **Backend:** https://your-backend.onrender.com
- **API Docs:** https://your-backend.onrender.com/docs
