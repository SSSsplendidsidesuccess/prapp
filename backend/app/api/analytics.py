"""
Analytics API endpoints for Interview OS.
Provides performance trends and insights based on session evaluations.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from app.core.dependencies import get_current_user
from app.services.analytics_service import AnalyticsService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/trends", response_model=Dict[str, Any])
async def get_performance_trends(
    current_user: dict = Depends(get_current_user)
):
    """
    Get performance trends over time for the authenticated user.
    
    Returns comprehensive analytics including:
    - Average scores across all dimensions
    - Improvement velocity (rate of progress)
    - Recurring weaknesses
    - Score progression over time
    - Recent trend direction
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Analytics data with trends and insights
    """
    try:
        user_id = current_user["user_id"]
        
        logger.info(f"Calculating performance trends for user {user_id}")
        
        # Calculate analytics using the service
        analytics = await AnalyticsService.calculate_user_analytics(user_id)
        
        logger.info(f"Performance trends calculated for user {user_id}")
        
        return analytics
        
    except Exception as e:
        logger.error(f"Error calculating performance trends: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate performance trends"
        )


@router.get("/improvements", response_model=Dict[str, Any])
async def get_improvement_recommendations(
    current_user: dict = Depends(get_current_user)
):
    """
    Get current improvement recommendations for the authenticated user.
    
    Returns the most recent evaluation's improvement areas and practice suggestions,
    along with recurring weaknesses identified across multiple sessions.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Improvement recommendations and focus areas
    """
    try:
        user_id = current_user["user_id"]
        
        logger.info(f"Fetching improvement recommendations for user {user_id}")
        
        # Get analytics to identify recurring weaknesses
        analytics = await AnalyticsService.calculate_user_analytics(user_id)
        
        # Get the most recent evaluation for current recommendations
        from app.db.mongodb import get_database
        db = get_database()
        
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database not available"
            )
        
        # Fetch most recent evaluation
        latest_evaluation = await db.session_evaluations.find_one(
            {"user_id": user_id},
            sort=[("created_at", -1)]
        )
        
        if not latest_evaluation:
            return {
                "current_focus_areas": [],
                "practice_suggestions": [],
                "recurring_weaknesses": analytics.get("recurring_weaknesses", []),
                "message": "Complete a session to receive personalized improvement recommendations"
            }
        
        # Extract improvement areas and suggestions
        improvement_areas = latest_evaluation.get("improvement_areas", [])
        practice_suggestions = latest_evaluation.get("practice_suggestions", [])
        
        logger.info(f"Improvement recommendations fetched for user {user_id}")
        
        return {
            "current_focus_areas": improvement_areas,
            "practice_suggestions": practice_suggestions,
            "recurring_weaknesses": analytics.get("recurring_weaknesses", []),
            "last_evaluation_date": latest_evaluation.get("created_at")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching improvement recommendations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch improvement recommendations"
        )