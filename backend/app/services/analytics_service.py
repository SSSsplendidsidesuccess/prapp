"""
Analytics service for calculating performance trends and metrics.
Provides insights into user progress over time based on session evaluations.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from app.db.mongodb import get_database
import logging

logger = logging.getLogger(__name__)


class AnalyticsService:
    """Service for calculating user analytics and performance trends."""
    
    @staticmethod
    async def calculate_user_analytics(user_id: str) -> Dict[str, Any]:
        """
        Calculate comprehensive analytics for a user based on session evaluations.
        
        Args:
            user_id: The user's ID
            
        Returns:
            Dictionary containing analytics data including:
            - average_scores: Average scores across all dimensions
            - improvement_velocity: Rate of improvement over time
            - recurring_weaknesses: Areas that consistently need improvement
            - score_progression: Time-series data of overall scores
            - total_evaluations: Total number of evaluations
            - recent_trend: Trend direction (improving, stable, declining)
        """
        db = get_database()
        if db is None:
            logger.error("Database not available")
            return {}
        
        # Fetch all evaluations for the user, sorted by creation date
        evaluations = await db.session_evaluations.find(
            {"user_id": user_id}
        ).sort("created_at", 1).to_list(length=None)
        
        if not evaluations:
            return {
                "average_scores": {},
                "improvement_velocity": 0.0,
                "recurring_weaknesses": [],
                "score_progression": [],
                "total_evaluations": 0,
                "recent_trend": "no_data"
            }
        
        # Calculate average scores across all dimensions
        average_scores = AnalyticsService._calculate_average_scores(evaluations)
        
        # Calculate improvement velocity
        improvement_velocity = AnalyticsService._calculate_improvement_velocity(evaluations)
        
        # Identify recurring weaknesses
        recurring_weaknesses = AnalyticsService._identify_recurring_weaknesses(evaluations)
        
        # Build score progression time series
        score_progression = AnalyticsService._build_score_progression(evaluations)
        
        # Determine recent trend
        recent_trend = AnalyticsService._determine_recent_trend(evaluations)
        
        return {
            "average_scores": average_scores,
            "improvement_velocity": improvement_velocity,
            "recurring_weaknesses": recurring_weaknesses,
            "score_progression": score_progression,
            "total_evaluations": len(evaluations),
            "recent_trend": recent_trend
        }
    
    @staticmethod
    def _calculate_average_scores(evaluations: List[Dict]) -> Dict[str, float]:
        """Calculate average scores for each dimension."""
        if not evaluations:
            return {}
        
        # Initialize score accumulators
        score_sums = {
            "clarity_structure": 0,
            "relevance_focus": 0,
            "confidence_delivery": 0,
            "language_quality": 0,
            "tone_alignment": 0,
            "engagement": 0,
            "overall": 0
        }
        
        # Sum up all scores
        for eval_doc in evaluations:
            scores = eval_doc.get("universal_scores", {})
            score_sums["clarity_structure"] += scores.get("clarity_structure", 0)
            score_sums["relevance_focus"] += scores.get("relevance_focus", 0)
            score_sums["confidence_delivery"] += scores.get("confidence_delivery", 0)
            score_sums["language_quality"] += scores.get("language_quality", 0)
            score_sums["tone_alignment"] += scores.get("tone_alignment", 0)
            score_sums["engagement"] += scores.get("engagement", 0)
            score_sums["overall"] += eval_doc.get("overall_score", 0)
        
        # Calculate averages
        count = len(evaluations)
        return {
            dimension: round(total / count, 1)
            for dimension, total in score_sums.items()
        }
    
    @staticmethod
    def _calculate_improvement_velocity(evaluations: List[Dict]) -> float:
        """
        Calculate the rate of improvement over time.
        Returns a value between -1.0 and 1.0 indicating the trend.
        Positive values indicate improvement, negative indicate decline.
        """
        if len(evaluations) < 2:
            return 0.0
        
        # Get overall scores
        scores = [eval_doc.get("overall_score", 0) for eval_doc in evaluations]
        
        # Calculate simple linear regression slope
        n = len(scores)
        x_values = list(range(n))
        
        # Calculate means
        x_mean = sum(x_values) / n
        y_mean = sum(scores) / n
        
        # Calculate slope
        numerator = sum((x - x_mean) * (y - y_mean) for x, y in zip(x_values, scores))
        denominator = sum((x - x_mean) ** 2 for x in x_values)
        
        if denominator == 0:
            return 0.0
        
        slope = numerator / denominator
        
        # Normalize to -1.0 to 1.0 range (assuming max change of 10 points per evaluation)
        normalized_velocity = max(-1.0, min(1.0, slope / 10.0))
        
        return round(normalized_velocity, 3)
    
    @staticmethod
    def _identify_recurring_weaknesses(evaluations: List[Dict], threshold: int = 2) -> List[str]:
        """
        Identify areas that appear frequently in improvement recommendations.
        
        Args:
            evaluations: List of evaluation documents
            threshold: Minimum number of occurrences to be considered recurring
            
        Returns:
            List of recurring weakness dimensions
        """
        if not evaluations:
            return []
        
        # Count occurrences of each improvement dimension
        dimension_counts: Dict[str, int] = {}
        
        for eval_doc in evaluations:
            improvement_areas = eval_doc.get("improvement_areas", [])
            for improvement in improvement_areas:
                dimension = improvement.get("dimension", "")
                if dimension:
                    dimension_counts[dimension] = dimension_counts.get(dimension, 0) + 1
        
        # Filter dimensions that appear at least 'threshold' times
        recurring = [
            dimension for dimension, count in dimension_counts.items()
            if count >= threshold
        ]
        
        # Sort by frequency (most common first)
        recurring.sort(key=lambda dim: dimension_counts[dim], reverse=True)
        
        return recurring[:5]  # Return top 5 recurring weaknesses
    
    @staticmethod
    def _build_score_progression(evaluations: List[Dict]) -> List[Dict[str, Any]]:
        """
        Build time-series data of score progression.
        
        Returns:
            List of data points with timestamp and scores
        """
        progression = []
        
        for eval_doc in evaluations:
            data_point = {
                "date": eval_doc.get("created_at").isoformat() if isinstance(eval_doc.get("created_at"), datetime) else eval_doc.get("created_at"),
                "overall_score": eval_doc.get("overall_score", 0),
                "scores": eval_doc.get("universal_scores", {}),
                "session_id": eval_doc.get("session_id", ""),
                "evaluation_id": eval_doc.get("evaluation_id", "")
            }
            progression.append(data_point)
        
        return progression
    
    @staticmethod
    def _determine_recent_trend(evaluations: List[Dict], recent_count: int = 3) -> str:
        """
        Determine the recent trend based on the last few evaluations.
        
        Args:
            evaluations: List of evaluation documents (sorted by date)
            recent_count: Number of recent evaluations to consider
            
        Returns:
            Trend direction: "improving", "stable", "declining", or "no_data"
        """
        if len(evaluations) < 2:
            return "no_data"
        
        # Get recent evaluations
        recent = evaluations[-recent_count:] if len(evaluations) >= recent_count else evaluations
        
        if len(recent) < 2:
            return "stable"
        
        # Calculate average of first half vs second half
        mid_point = len(recent) // 2
        first_half_avg = sum(e.get("overall_score", 0) for e in recent[:mid_point]) / mid_point
        second_half_avg = sum(e.get("overall_score", 0) for e in recent[mid_point:]) / (len(recent) - mid_point)
        
        difference = second_half_avg - first_half_avg
        
        # Determine trend with threshold of 5 points
        if difference > 5:
            return "improving"
        elif difference < -5:
            return "declining"
        else:
            return "stable"
    
    @staticmethod
    async def get_session_history(
        user_id: str,
        status: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        search: Optional[str] = None,
        limit: int = 10,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Get paginated session history with filtering and search.
        
        Args:
            user_id: The user's ID
            status: Filter by session status (optional)
            date_from: Filter by start date (optional)
            date_to: Filter by end date (optional)
            search: Search in session context (optional)
            limit: Number of results per page
            offset: Pagination offset
            
        Returns:
            Dictionary with sessions list and pagination info
        """
        db = get_database()
        if db is None:
            logger.error("Database not available")
            return {"sessions": [], "total": 0, "limit": limit, "offset": offset}
        
        # Build query filter
        query = {"user_id": user_id}
        
        if status:
            query["status"] = status
        
        if date_from or date_to:
            query["created_at"] = {}
            if date_from:
                query["created_at"]["$gte"] = date_from
            if date_to:
                query["created_at"]["$lte"] = date_to
        
        if search:
            # Search in context payload
            query["$or"] = [
                {"context_payload.agenda": {"$regex": search, "$options": "i"}},
                {"context_payload.role_context": {"$regex": search, "$options": "i"}},
                {"preparation_type": {"$regex": search, "$options": "i"}}
            ]
        
        # Get total count
        total = await db.sessions.count_documents(query)
        
        # Fetch sessions with pagination
        sessions = await db.sessions.find(query).sort("created_at", -1).skip(offset).limit(limit).to_list(length=limit)
        
        # Enrich with evaluation data
        enriched_sessions = []
        for session in sessions:
            # Fetch evaluation for this session
            evaluation = await db.session_evaluations.find_one({"session_id": session.get("session_id")})
            
            session_data = {
                "session_id": session.get("session_id"),
                "user_id": session.get("user_id"),
                "preparation_type": session.get("preparation_type"),
                "meeting_subtype": session.get("meeting_subtype"),
                "status": session.get("status"),
                "created_at": session.get("created_at"),
                "completed_at": session.get("completed_at"),
                "context_payload": session.get("context_payload", {}),
                "evaluation": None
            }
            
            if evaluation:
                session_data["evaluation"] = {
                    "evaluation_id": evaluation.get("evaluation_id"),
                    "overall_score": evaluation.get("overall_score"),
                    "scores": evaluation.get("universal_scores"),
                    "created_at": evaluation.get("created_at")
                }
            
            enriched_sessions.append(session_data)
        
        return {
            "sessions": enriched_sessions,
            "total": total,
            "limit": limit,
            "offset": offset
        }