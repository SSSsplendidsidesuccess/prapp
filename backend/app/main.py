"""
FastAPI application entry point for Interview OS (prapp) backend.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.db.mongodb import connect_to_mongo, close_mongo_connection
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    logger.info("Starting up application...")
    await connect_to_mongo()
    yield
    # Shutdown
    logger.info("Shutting down application...")
    await close_mongo_connection()


app = FastAPI(
    title="Interview OS API",
    description="Backend API for Interview OS preparation platform",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS middleware
from app.core.config import settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include health check router at root level
from app.api.health import router as health_router
app.include_router(health_router, tags=["health"])

# Create API v1 router
from fastapi import APIRouter
api_v1_router = APIRouter(prefix="/api/v1")

# Include auth router
from app.api.auth import router as auth_router
api_v1_router.include_router(auth_router)

# Include users router
from app.api.users import router as users_router
api_v1_router.include_router(users_router)

# Include PRDs router (kept for reference - PRD Management system)
# Uncomment if you want to use the PRD Management features alongside Interview OS
# from app.api.prds import router as prds_router
# api_v1_router.include_router(prds_router)

# Include sessions router (Interview OS - Session Management)
from app.api.sessions import router as sessions_router
api_v1_router.include_router(sessions_router)

# Include analytics router
from app.api.analytics import router as analytics_router
api_v1_router.include_router(analytics_router)

# Mount API v1 router
app.include_router(api_v1_router)