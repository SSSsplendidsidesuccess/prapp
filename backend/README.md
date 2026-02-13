# Interview OS Backend

FastAPI backend for Interview OS (prapp) - An AI-powered interview preparation platform.

## Tech Stack

- **Framework**: FastAPI 0.115.0
- **Database**: MongoDB Atlas (Motor async driver)
- **Authentication**: JWT (python-jose)
- **AI Integration**: OpenAI API
- **Python Version**: 3.13+ (tested with 3.9+)

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── api/                 # API routes
│   │   ├── __init__.py
│   │   └── health.py        # Health check endpoint
│   ├── core/                # Core utilities
│   │   ├── __init__.py
│   │   └── config.py        # Configuration management
│   ├── db/                  # Database connection
│   │   ├── __init__.py
│   │   └── mongodb.py       # MongoDB connection setup
│   └── models/              # Pydantic models
│       └── __init__.py
├── requirements.txt         # Python dependencies
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## Setup Instructions

### 1. Install Dependencies

```bash
python3 -m pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` and add your actual values:

```env
APP_ENV=development
PORT=8000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/prapp?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=604800
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
OPENAI_API_KEY=sk-your-actual-openai-key
OPENAI_MODEL=gpt-4
```

**Important**: Replace the placeholder values with your actual:
- MongoDB Atlas connection string
- OpenAI API key
- JWT secret (use a strong random string in production)

### 3. Run the Backend

```bash
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The server will start on `http://localhost:8000`

### 4. Verify Installation

Visit the following endpoints:

- **Health Check**: http://localhost:8000/healthz
- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## API Endpoints

### Health & Status

- `GET /healthz` - Health check with database connectivity test
  - Returns: `{ "status": "ok", "db_connected": true, "timestamp": "ISO8601" }`

### API v1 (Coming in future sprints)

- `/api/v1/auth/*` - Authentication endpoints (Sprint S1)
- `/api/v1/profile` - User profile management (Sprint S2)
- `/api/v1/sessions` - Session management (Sprint S3)
- `/api/v1/evaluations` - Performance evaluations (Sprint S5)
- `/api/v1/history` - Session history (Sprint S6)

## Development

### Sprint Progress

- ✅ **S0**: Environment Setup & Frontend Connection
  - FastAPI project structure
  - MongoDB connection
  - Health check endpoint
  - CORS configuration
  - Git initialization

- ⏳ **S1**: Basic Auth (Signup/Login/Logout)
- ⏳ **S2**: User Profile Management
- ⏳ **S3**: Session Creation and Management
- ⏳ **S4**: AI Conversation Integration
- ⏳ **S5**: Performance Evaluation System
- ⏳ **S6**: Session History and Analytics

### Testing

Manual testing is performed through the frontend UI after each task implementation.

## Troubleshooting

### MongoDB Connection Issues

If you see `Failed to connect to MongoDB` errors:

1. Verify your MongoDB Atlas connection string in `.env`
2. Ensure your IP address is whitelisted in MongoDB Atlas
3. Check that your database user has proper permissions
4. Verify network connectivity to MongoDB Atlas

### CORS Issues

If the frontend cannot connect:

1. Verify `CORS_ORIGINS` in `.env` includes your frontend URL
2. Restart the backend server after changing `.env`

## License

Proprietary - Maven AI PM Bootcamp Capstone Project