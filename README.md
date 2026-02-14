# Interview OS - AI-Powered Interview Preparation Platform

An intelligent interview preparation platform that helps users practice and improve their interview skills through AI-powered conversations, real-time feedback, and comprehensive analytics.

## 🚀 Quick Links

- **[Quick Deploy Guide](./QUICK_DEPLOY.md)** - Deploy in 20 minutes
- **[Full Deployment Guide](./DEPLOYMENT.md)** - Detailed deployment instructions
- **[Environment Variables](./ENV_VARIABLES.md)** - Complete environment configuration reference
- **[Backend README](./backend/README.md)** - Backend documentation
- **[Frontend README](./frontend/README.md)** - Frontend documentation

## 📋 Project Structure

```
Prapp/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Core utilities & config
│   │   ├── db/             # Database connections
│   │   ├── models/         # Pydantic models
│   │   └── services/       # Business logic
│   ├── requirements.txt    # Python dependencies
│   ├── railway.json        # Railway deployment config
│   ├── render.yaml         # Render deployment config
│   └── Procfile           # Process file for deployment
│
├── frontend/               # Next.js frontend
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── vercel.json        # Vercel deployment config
│   └── package.json       # Node dependencies
│
├── DEPLOYMENT.md          # Full deployment guide
├── QUICK_DEPLOY.md        # Quick deployment guide
├── ENV_VARIABLES.md       # Environment variables reference
└── README.md              # This file
```

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI 0.115.0
- **Database**: MongoDB Atlas (Motor async driver)
- **Authentication**: JWT (python-jose)
- **AI Integration**: OpenAI API (GPT-4)
- **Python**: 3.11+

### Frontend
- **Framework**: Next.js 15.5.2
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Components**: Radix UI + shadcn/ui
- **State Management**: React Context
- **Forms**: React Hook Form + Zod

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB Atlas account
- OpenAI API key

### Local Development

#### 1. Clone the Repository

```bash
git clone https://github.com/SSSsplendidsidesuccess/prapp.git
cd prapp
```

#### 2. Set Up Backend

```bash
cd backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and OpenAI API key

# Run backend
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`

#### 3. Set Up Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your backend URL

# Run frontend
npm run dev
```

Frontend will be available at `http://localhost:3000`

## 🌐 Deployment

### Option 1: Quick Deploy (Recommended)

Follow the [Quick Deploy Guide](./QUICK_DEPLOY.md) for a streamlined deployment process:

1. **Backend to Railway** (10 minutes)
2. **Frontend to Vercel** (10 minutes)
3. **Final Configuration** (5 minutes)

### Option 2: Detailed Deployment

See the [Full Deployment Guide](./DEPLOYMENT.md) for comprehensive instructions including:
- Step-by-step deployment process
- Environment configuration
- Troubleshooting tips
- Security best practices
- Monitoring and maintenance

### Alternative Platforms

The application can also be deployed to:
- **Backend**: Render, Heroku, AWS, Google Cloud
- **Frontend**: Netlify, AWS Amplify, Cloudflare Pages

Configuration files are provided for Railway and Render.

## 📚 Features

### Core Features
- ✅ User authentication (signup, login, logout)
- ✅ User profile management
- ✅ Interview session creation and management
- ✅ AI-powered interview conversations
- ✅ Real-time performance evaluation
- ✅ Session history and analytics
- ✅ Comprehensive analytics dashboard

### AI Capabilities
- Intelligent question generation
- Context-aware follow-up questions
- Real-time feedback and scoring
- Performance trend analysis
- Personalized improvement suggestions

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Environment variable management
- Secure API key handling

See [ENV_VARIABLES.md](./ENV_VARIABLES.md) for security best practices.

## 📊 API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

In production:
- **Swagger UI**: `https://your-backend-url/docs`
- **ReDoc**: `https://your-backend-url/redoc`

## 🧪 Testing

### Backend
```bash
cd backend
# Health check
curl http://localhost:8000/healthz
```

### Frontend
```bash
cd frontend
npm run build  # Test production build
```

## 📝 Environment Variables

### Backend Required Variables
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `OPENAI_API_KEY` - OpenAI API key

### Frontend Required Variables
- `NEXT_PUBLIC_API_URL` - Backend API URL

See [ENV_VARIABLES.md](./ENV_VARIABLES.md) for complete reference.

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check MongoDB connection string
- Verify all environment variables are set
- Ensure Python version is 3.11+

**Frontend can't connect to backend:**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is running

**Database connection fails:**
- Verify MongoDB Atlas IP whitelist
- Check database user permissions
- Test connection string

See [DEPLOYMENT.md](./DEPLOYMENT.md#-troubleshooting) for detailed troubleshooting.

## 📈 Monitoring

### Production Monitoring

**Railway (Backend):**
- View logs in Railway dashboard
- Monitor resource usage
- Set up alerts

**Vercel (Frontend):**
- View deployment logs
- Monitor function performance
- Track analytics

**MongoDB Atlas:**
- Monitor database metrics
- Set up performance alerts
- Review query performance

## 🤝 Contributing

This is a capstone project for the Maven AI PM Bootcamp. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

Proprietary - Maven AI PM Bootcamp Capstone Project

## 👥 Team

- **Developer**: [Your Name]
- **Program**: Maven AI PM Bootcamp
- **Project**: Interview OS (Prapp)

## 🔗 Links

- **GitHub Repository**: https://github.com/SSSsplendidsidesuccess/prapp
- **Railway**: https://railway.app
- **Vercel**: https://vercel.com
- **MongoDB Atlas**: https://cloud.mongodb.com
- **OpenAI**: https://platform.openai.com

## 📞 Support

For issues or questions:
1. Check the [Troubleshooting Guide](./DEPLOYMENT.md#-troubleshooting)
2. Review [Environment Variables](./ENV_VARIABLES.md)
3. Check platform documentation (Railway, Vercel, MongoDB)
4. Open an issue on GitHub

---

**Ready to deploy?** Start with the [Quick Deploy Guide](./QUICK_DEPLOY.md)!