# Pre-Deployment Checklist for Render.com Backend

## Current Issue
Backend at `https://prapp-backend-docker.onrender.com` returns 404 for all endpoints, preventing frontend from creating sessions.

---

## ✅ Environment Variables (Verified in Render Dashboard)
Based on your screenshot, these are already set:
- [x] `APP_ENV` = production
- [x] `CORS_ORIGINS` = * (allows all origins)
- [x] `JWT_SECRET` = (hidden, set)
- [x] `MONGODB_URI` = (hidden, set)
- [x] `OPENAI_API_KEY` = (hidden, set)
- [x] `OPENAI_MODEL` = (hidden, set)

---

## 🔍 Pre-Deployment Checks

### 1. Code Structure Verification
- [x] **Main app file exists**: `app/main.py` ✅
- [x] **Health endpoint registered**: Line 48 in `app/main.py` ✅
- [x] **Sessions router registered**: Line 69 in `app/main.py` ✅
- [x] **API v1 prefix configured**: Line 52 (`/api/v1`) ✅
- [x] **All required routers included**:
  - Health: `/health` (root level)
  - Auth: `/api/v1/auth`
  - Users: `/api/v1/users`
  - Sessions: `/api/v1/sessions` ✅
  - Documents: `/api/v1/documents`
  - Talk Points: `/api/v1/talk-points`
  - Analytics: `/api/v1/analytics`

### 2. Dependencies Check
- [x] **requirements.txt exists** ✅
- [x] **All critical packages listed**:
  - FastAPI ✅
  - Uvicorn ✅
  - Motor (MongoDB async driver) ✅
  - OpenAI ✅
  - LangChain (for RAG) ✅
  - ChromaDB (vector store) ✅
  - Document processors (pypdf, python-docx) ✅

### 3. Render Configuration
- [x] **render.yaml exists** ✅
- [x] **Build command**: `pip install -r requirements.txt` ✅
- [x] **Start command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT` ✅
- [x] **Python version**: 3.11 ✅
- [x] **Region**: Oregon ✅
- [x] **Plan**: Free tier ✅

### 4. Database Connection
- [ ] **MONGODB_URI format check**: Should be `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`
- [ ] **MongoDB Atlas cluster is running** (not paused)
- [ ] **Network access allows Render IPs** (or set to 0.0.0.0/0 for testing)
- [ ] **Database user has read/write permissions**

### 5. API Keys Validation
- [ ] **OPENAI_API_KEY is valid** (not expired, has credits)
- [ ] **JWT_SECRET is set** (any random string, but must be set)

---

## 🚨 Common Issues on Render Free Tier

### Issue 1: Service Spinning Down
**Symptom**: 404 on all endpoints after inactivity
**Cause**: Free tier services spin down after 15 minutes of inactivity
**Solution**: 
- First request after spin-down takes 30-60 seconds to wake up
- Consider upgrading to paid tier for always-on service
- Or use a service like UptimeRobot to ping every 14 minutes

### Issue 2: Build Failures
**Symptom**: Service shows "Deploy failed" in Render dashboard
**Check**: 
- View build logs in Render dashboard
- Look for Python package installation errors
- Check for missing system dependencies

### Issue 3: Runtime Errors
**Symptom**: Service deploys but crashes immediately
**Check**:
- View runtime logs in Render dashboard
- Look for MongoDB connection errors
- Check for missing environment variables
- Verify OpenAI API key is valid

### Issue 4: Port Binding Issues
**Symptom**: Service starts but doesn't respond
**Check**:
- Ensure start command uses `--host 0.0.0.0 --port $PORT`
- Render provides `$PORT` environment variable automatically
- Don't hardcode port numbers

---

## 📋 Step-by-Step Deployment Verification

### Before Redeploying:

1. **Check Render Dashboard Logs**
   - Go to: https://dashboard.render.com
   - Select: `prapp-backend-docker` service
   - Click: "Logs" tab
   - Look for:
     - Build errors
     - Runtime errors
     - MongoDB connection errors
     - "Application startup complete" message

2. **Verify MongoDB Connection**
   - Log into MongoDB Atlas
   - Check cluster is running (not paused)
   - Verify network access settings
   - Test connection string locally if possible

3. **Test OpenAI API Key**
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer YOUR_OPENAI_API_KEY"
   ```
   Should return list of models, not 401 error

4. **Check GitHub Repository**
   - Ensure latest code is pushed to `main` branch
   - Verify `app/main.py` exists in repo
   - Confirm `requirements.txt` is up to date

### After Redeploying:

1. **Wait for Build to Complete** (2-5 minutes)
   - Watch build logs in Render dashboard
   - Look for "Build succeeded" message

2. **Wait for Service to Start** (30-60 seconds)
   - Watch runtime logs
   - Look for "Application startup complete"
   - Look for "Uvicorn running on http://0.0.0.0:XXXX"

3. **Test Health Endpoint**
   ```bash
   curl https://prapp-backend-docker.onrender.com/health
   ```
   Expected: `{"status": "healthy", ...}`

4. **Test API v1 Health**
   ```bash
   curl https://prapp-backend-docker.onrender.com/api/v1/health
   ```
   Expected: `{"status": "healthy", ...}`

5. **Test Sessions Endpoint** (requires auth token)
   ```bash
   # First login to get token
   curl -X POST https://prapp-backend-docker.onrender.com/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "your@email.com", "password": "yourpassword"}'
   
   # Then test sessions endpoint
   curl https://prapp-backend-docker.onrender.com/api/v1/sessions \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

---

## 🔧 Quick Fixes

### If MongoDB Connection Fails:
1. Check MONGODB_URI format in Render dashboard
2. Verify MongoDB Atlas cluster is not paused
3. Add `0.0.0.0/0` to Network Access in MongoDB Atlas (for testing)
4. Ensure database user password doesn't contain special characters that need URL encoding

### If OpenAI API Fails:
1. Verify API key in Render dashboard
2. Check OpenAI account has available credits
3. Test API key with curl command above

### If Service Won't Start:
1. Check runtime logs for Python errors
2. Verify all environment variables are set
3. Try manual redeploy from Render dashboard
4. Check if free tier limits are exceeded

### If 404 Persists After Successful Deploy:
1. Verify the service URL is correct
2. Check if health endpoint works: `/health`
3. Try accessing with full path: `/api/v1/sessions`
4. Clear browser cache and try again
5. Check CORS settings allow your frontend domain

---

## 📊 Expected Behavior After Successful Deploy

1. **Health Check**: `GET /health` → 200 OK
2. **API Health**: `GET /api/v1/health` → 200 OK  
3. **Login**: `POST /api/v1/auth/login` → 200 OK with token
4. **Sessions List**: `GET /api/v1/sessions` (with auth) → 200 OK with empty array
5. **Create Session**: `POST /api/v1/sessions` (with auth) → 201 Created

---

## 🎯 Next Steps

1. **Check Render Dashboard Logs** - This is the most important step
2. **Verify MongoDB Connection** - Second most common issue
3. **Test OpenAI API Key** - Third most common issue
4. **Trigger Manual Redeploy** - If everything looks correct
5. **Monitor Logs During Deploy** - Watch for errors in real-time
6. **Test Endpoints** - Use curl commands above after deploy completes

---

## 📞 If Issues Persist

If the backend still returns 404 after following all steps:

1. **Share Render Logs**: Copy the last 50 lines of logs from Render dashboard
2. **Check Service Status**: Ensure service shows "Live" in Render dashboard
3. **Verify Build Success**: Confirm build completed without errors
4. **Test Locally**: Try running the backend locally to isolate the issue:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```
5. **Consider Alternative**: If Render free tier is problematic, consider Railway.app or Fly.io

---

## ✨ Success Indicators

You'll know the deployment is successful when:
- ✅ Render dashboard shows service as "Live"
- ✅ Build logs show "Build succeeded"
- ✅ Runtime logs show "Application startup complete"
- ✅ Health endpoint returns 200 OK
- ✅ Frontend can create sessions without 404 errors
- ✅ Profile page "Start practice session" button works
