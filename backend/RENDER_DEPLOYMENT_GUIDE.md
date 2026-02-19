# Render Deployment Guide - Sales Call Prep Platform

## Overview
This guide walks you through deploying the Sales Call Prep platform backend to Render.

## Prerequisites
- GitHub repository with latest code (✅ Already pushed)
- Render account (https://render.com)
- MongoDB Atlas database (or other MongoDB instance)
- OpenAI API key

---

## Deployment Options

### Option 1: Auto-Deploy (If Already Connected)

If your Render service is already connected to GitHub:

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Log in to your account

2. **Find Your Backend Service**
   - Look for your existing "prapp-backend" service
   - Click on it to open

3. **Trigger Manual Deploy**
   - Click "Manual Deploy" button
   - Select "Deploy latest commit"
   - Render will automatically pull from GitHub and deploy

4. **Monitor Deployment**
   - Watch the deployment logs
   - Wait for "Build successful" and "Deploy live"
   - Note your backend URL (e.g., `https://prapp-backend.onrender.com`)

---

### Option 2: Fresh Deployment

If you need to create a new service:

#### Step 1: Create New Web Service

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click "New +" → "Web Service"

2. **Connect GitHub Repository**
   - Select "Connect a repository"
   - Choose: `SSSsplendidsidesuccess/prapp`
   - Click "Connect"

#### Step 2: Configure Service

**Basic Settings:**
- **Name:** `prapp-backend`
- **Region:** Oregon (US West) or closest to you
- **Branch:** `main`
- **Root Directory:** `backend` (IMPORTANT!)
- **Runtime:** Python 3
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Instance Type:**
- Free tier (for testing)
- Or Starter ($7/month) for production

#### Step 3: Environment Variables

Click "Advanced" → "Add Environment Variable" and add:

| Key | Value | Notes |
|-----|-------|-------|
| `PYTHON_VERSION` | `3.11` | Python version |
| `APP_ENV` | `production` | Environment |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB connection string |
| `JWT_SECRET` | `your-secret-key` | Generate a secure random string |
| `JWT_EXPIRES_IN` | `604800` | 7 days in seconds |
| `CORS_ORIGINS` | `https://your-frontend.vercel.app` | Your frontend URL (update after deploying frontend) |
| `OPENAI_API_KEY` | `sk-...` | Your OpenAI API key |
| `OPENAI_MODEL` | `gpt-4` | Or `gpt-4-turbo` |

**To generate JWT_SECRET:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### Step 4: Deploy

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Monitor logs for any errors
4. Once deployed, note your backend URL

---

## Verification Steps

### 1. Check Health Endpoint

```bash
curl https://your-backend-url.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-19T14:52:00.000Z"
}
```

### 2. Check API Documentation

Visit: `https://your-backend-url.onrender.com/docs`

You should see the FastAPI Swagger UI with all 34 endpoints.

### 3. Test Authentication

```bash
curl -X POST https://your-backend-url.onrender.com/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "name": "Test User"
  }'
```

---

## Common Issues & Solutions

### Issue 1: Build Fails
**Error:** `Could not find requirements.txt`
**Solution:** Ensure "Root Directory" is set to `backend`

### Issue 2: MongoDB Connection Fails
**Error:** `Failed to connect to MongoDB`
**Solution:** 
- Check `MONGODB_URI` is correct
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Or add Render's IP addresses to whitelist

### Issue 3: CORS Errors
**Error:** `CORS policy blocked`
**Solution:** 
- Update `CORS_ORIGINS` environment variable
- Add your frontend URL
- Or use `*` for testing (not recommended for production)

### Issue 4: OpenAI API Errors
**Error:** `OpenAI API key invalid`
**Solution:**
- Verify `OPENAI_API_KEY` is correct
- Check OpenAI account has credits
- Ensure API key has proper permissions

---

## Post-Deployment Checklist

- [ ] Backend deployed successfully
- [ ] Health endpoint returns 200 OK
- [ ] API documentation accessible at `/docs`
- [ ] Can create user account (signup works)
- [ ] Can login and receive JWT token
- [ ] MongoDB connection working
- [ ] OpenAI API calls working
- [ ] Backend URL noted for frontend deployment

---

## Next Steps

After backend deployment:

1. **Deploy Frontend to Vercel**
   - Use the backend URL in `NEXT_PUBLIC_API_URL`
   - See `VERCEL_DEPLOYMENT_GUIDE.md` (to be created)

2. **Update CORS Settings**
   - Add frontend URL to `CORS_ORIGINS` in Render
   - Redeploy backend if needed

3. **Test End-to-End**
   - Create account on frontend
   - Upload documents
   - Start sales session
   - Verify all features work

---

## Monitoring & Maintenance

### View Logs
- Go to Render dashboard
- Click on your service
- Click "Logs" tab
- Monitor for errors

### Update Deployment
- Push changes to GitHub
- Render auto-deploys (if enabled)
- Or click "Manual Deploy"

### Scale Service
- Go to service settings
- Change instance type
- Add more instances if needed

---

## Support Resources

- **Render Docs:** https://render.com/docs
- **FastAPI Docs:** https://fastapi.tiangolo.com
- **MongoDB Atlas:** https://www.mongodb.com/docs/atlas

---

## Configuration Files Reference

Your backend includes these Render-ready files:

- [`render.yaml`](render.yaml) - Render configuration
- [`requirements.txt`](requirements.txt) - Python dependencies
- [`runtime.txt`](runtime.txt) - Python version specification
- [`.env.example`](.env.example) - Environment variables template

All configuration is production-ready and tested.
