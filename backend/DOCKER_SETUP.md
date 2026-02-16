# Docker Setup Instructions for Interview OS Backend

## Step 1: Install Docker Desktop

1. **Download Docker Desktop for Mac**:
   - Visit: https://www.docker.com/products/docker-desktop/
   - Click "Download Docker Desktop"
   - Choose "Mac with Apple Silicon" or "Mac with Intel Chip" based on your Mac

2. **Install Docker Desktop**:
   - Open the downloaded `.dmg` file
   - Drag Docker to Applications folder
   - Launch Docker Desktop from Applications
   - Follow the setup wizard
   - Accept the terms and conditions
   - Docker will start and show a whale icon in your menu bar

3. **Verify Installation**:
   ```bash
   docker --version
   docker compose version
   ```

## Step 2: Build Docker Image

Once Docker is installed, build the backend image:

```bash
cd /Users/roc/Documents/PM\ Trainings/Maven\ AI\ PM\ Bootcamp/Capstone\ Project/Prapp/backend
docker build -t prapp-backend:latest .
```

This will:
- Use Python 3.11 slim base image
- Install system dependencies (gcc, g++)
- Install all Python packages from requirements.txt
- Copy application code
- Create a non-root user for security
- Set up health checks

## Step 3: Test Docker Container Locally

Run the container with environment variables:

```bash
docker run -d \
  --name prapp-backend-test \
  -p 8000:8000 \
  -e APP_ENV=production \
  -e MONGODB_URI="<your-mongodb-uri>" \
  -e JWT_SECRET="<your-jwt-secret>" \
  -e OPENAI_API_KEY="<your-openai-api-key>" \
  -e OPENAI_MODEL=gpt-4o-mini \
  -e CORS_ORIGINS="*" \
  prapp-backend:latest
```

**Note**: Replace the placeholder values with your actual credentials from your `.env` file.

## Step 4: Verify Container is Running

Check container status:
```bash
docker ps
```

View logs:
```bash
docker logs prapp-backend-test
```

Test health endpoint:
```bash
curl http://localhost:8000/healthz
```

Test API docs:
```bash
open http://localhost:8000/docs
```

## Step 5: Stop and Remove Test Container

When done testing:
```bash
docker stop prapp-backend-test
docker rm prapp-backend-test
```

## Step 6: Deploy to Render

Once local Docker testing is successful:

1. **Commit Docker files to Git**:
   ```bash
   git add Dockerfile .dockerignore
   git commit -m "Add Docker configuration for deployment"
   git push origin main
   ```

2. **Configure Render**:
   - Go to Render dashboard: https://dashboard.render.com/
   - Select your backend service
   - Change "Build Command" to: (leave empty - Docker handles it)
   - Change "Start Command" to: (leave empty - Docker handles it)
   - In "Environment" section, set:
     - **Docker Command**: (leave empty - uses CMD from Dockerfile)
     - **Dockerfile Path**: `./Dockerfile`
   - Add all environment variables (same as above)

3. **Deploy**:
   - Click "Manual Deploy" → "Clear build cache & deploy"
   - Render will build the Docker image and deploy it
   - Monitor logs for successful deployment

## Troubleshooting

### Docker not found after installation
- Restart your terminal
- Make sure Docker Desktop is running (whale icon in menu bar)

### Build fails with permission errors
- Make sure Docker Desktop has proper permissions
- Try running with sudo (not recommended for production)

### Container exits immediately
- Check logs: `docker logs prapp-backend-test`
- Verify environment variables are set correctly
- Ensure MongoDB URI is accessible

### Port already in use
- Stop your local uvicorn server first
- Or use a different port: `-p 8001:8000`

## Next Steps After Successful Deployment

1. Update frontend environment variable:
   - `NEXT_PUBLIC_API_URL=https://your-render-url.onrender.com`

2. Update CORS in backend:
   - Change `CORS_ORIGINS` from `*` to your actual frontend URL

3. Test end-to-end functionality

4. Monitor application logs and performance