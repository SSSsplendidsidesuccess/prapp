"""
Session evaluation models for Interview OS.
Provides multi-dimensional scoring for interview preparation sessions.
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import uuid4


class SessionEvaluationScores(BaseModel):
    """Multi-dimensional evaluation scores for interview sessions (0-100 scale)."""
    clarity_structure: int = Field(..., ge=0, le=100, description="Clarity and structure of responses")
    relevance_focus: int = Field(..., ge=0, le=100, description="Relevance and focus on the question")
    confidence_delivery: int = Field(..., ge=0, le=100, description="Confidence in delivery")
    language_quality: int = Field(..., ge=0, le=100, description="Language quality and professionalism")
    tone_alignment: int = Field(..., ge=0, le=100, description="Alignment with desired tone")
    engagement: int = Field(..., ge=0, le=100, description="Engagement and enthusiasm")
    
    class Config:
        json_schema_extra = {
            "example": {
                "clarity_structure": 85,
                "relevance_focus": 90,
                "confidence_delivery": 75,
                "language_quality": 88,
                "tone_alignment": 82,
                "engagement": 80
            }
        }


class ImprovementArea(BaseModel):
    """Single improvement area with specific recommendation."""
    dimension: str = Field(..., description="Dimension that needs improvement")
    current_level: str = Field(..., description="Current performance level (weak, solid, strong)")
    suggestion: str = Field(..., description="Specific actionable suggestion")
    priority: str = Field(..., description="Priority level: high, medium, low")
    
    class Config:
        json_schema_extra = {
            "example": {
                "dimension": "Clarity & Structure",
                "current_level": "solid",
                "suggestion": "Use more specific metrics when describing achievements. Instead of 'improved performance', say 'increased conversion rate by 25%'",
                "priority": "high"
            }
        }


class SessionEvaluationInDB(BaseModel):
    """Schema for session evaluation stored in database."""
    evaluation_id: str = Field(default_factory=lambda: str(uuid4()))
    session_id: str = Field(..., description="ID of the evaluated session")
    user_id: str = Field(..., description="ID of the user who owns the session")
    universal_scores: SessionEvaluationScores = Field(..., description="Universal dimension scores")
    context_scores: Optional[dict] = Field(None, description="Context-specific scores (varies by prep type)")
    improvement_areas: List[ImprovementArea] = Field(..., description="Top 2-3 improvement areas")
    practice_suggestions: List[str] = Field(..., description="Specific practice suggestions")
    strengths: List[str] = Field(..., description="Key strengths identified (2-3 items)")
    overall_score: int = Field(..., ge=0, le=100, description="Weighted average of all scores")
    summary: str = Field(..., description="Overall evaluation summary")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "evaluation_id": "770e8400-e29b-41d4-a716-446655440002",
                "session_id": "660e8400-e29b-41d4-a716-446655440001",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "universal_scores": {
                    "clarity_structure": 85,
                    "relevance_focus": 90,
                    "confidence_delivery": 75,
                    "language_quality": 88,
                    "tone_alignment": 82,
                    "engagement": 80
                },
                "context_scores": {
                    "star_method_usage": 80,
                    "example_specificity": 75
                },
                "improvement_areas": [
                    {
                        "dimension": "Confidence & Delivery",
                        "current_level": "solid",
                        "suggestion": "Pause briefly before answering complex questions to organize your thoughts",
                        "priority": "high"
                    }
                ],
                "practice_suggestions": [
                    "Practice quantifying your impact with numbers",
                    "Take 2-3 seconds to organize thoughts before responding"
                ],
                "strengths": [
                    "Clear problem definition and context setting",
                    "Good use of STAR method structure",
                    "Professional and confident tone"
                ],
                "overall_score": 83,
                "summary": "Strong performance with clear communication. Focus on adding more specific metrics and taking brief pauses before complex answers.",
                "created_at": "2026-02-13T03:30:00Z"
            }
        }


class SessionEvaluationResponse(BaseModel):
    """Schema for session evaluation API response."""
    evaluation_id: str
    session_id: str
    user_id: str
    universal_scores: SessionEvaluationScores
    context_scores: Optional[dict] = None
    improvement_areas: List[ImprovementArea]
    practice_suggestions: List[str]
    strengths: List[str]
    overall_score: int
    summary: str
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "evaluation_id": "770e8400-e29b-41d4-a716-446655440002",
                "session_id": "660e8400-e29b-41d4-a716-446655440001",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "universal_scores": {
                    "clarity_structure": 85,
                    "relevance_focus": 90,
                    "confidence_delivery": 75,
                    "language_quality": 88,
                    "tone_alignment": 82,
                    "engagement": 80
                },
                "context_scores": None,
                "improvement_areas": [
                    {
                        "dimension": "Confidence & Delivery",
                        "current_level": "solid",
                        "suggestion": "Pause briefly before answering",
                        "priority": "high"
                    }
                ],
                "practice_suggestions": [
                    "Practice quantifying your impact"
                ],
                "strengths": [
                    "Clear communication",
                    "Good structure"
                ],
                "overall_score": 83,
                "summary": "Strong performance overall",
                "created_at": "2026-02-13T03:30:00Z"
            }
        }


class EvaluateSessionRequest(BaseModel):
    """Schema for requesting session evaluation."""
    force_reevaluate: bool = Field(
        default=False,
        description="Force re-evaluation even if one exists"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "force_reevaluate": False
            }
        }