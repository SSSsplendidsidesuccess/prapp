"""
Health check endpoint for monitoring application and database status.
"""
from fastapi import APIRouter
from datetime import datetime
from app.db.mongodb import ping_db

router = APIRouter()


@router.get("/healthz")
async def health_check():
    """
    Health check endpoint that tests database connectivity.
    
    Returns:
        dict: Status information including database connection status and timestamp
    """
    db_connected = await ping_db()
    
    return {
        "status": "ok",
        "db_connected": db_connected,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }