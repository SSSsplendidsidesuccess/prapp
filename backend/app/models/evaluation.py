"""
Evaluation models for PRD performance assessment.
Provides multi-dimensional scoring and improvement recommendations.
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import uuid4


class EvaluationScores(BaseModel):
    """Multi-dimensional evaluation scores (0-100 scale)."""
    clarity: int = Field(..., ge=0, le=100, description="Clarity and structure of the PRD")
    relevance: int = Field(..., ge=0, le=100, description="Relevance and focus of content")
    confidence: int = Field(..., ge=0, le=100, description="Confidence in deliverability")
    completeness: int = Field(..., ge=0, le=100, description="Completeness of requirements")
    feasibility: int = Field(..., ge=0, le=100, description="Technical feasibility")
    innovation: int = Field(..., ge=0, le=100, description="Innovation and uniqueness")
    
    class Config:
        json_schema_extra = {
            "example": {
                "clarity": 85,
                "relevance": 90,
                "confidence": 75,
                "completeness": 80,
                "feasibility": 85,
                "innovation": 70
            }
        }


class ImprovementRecommendation(BaseModel):
    """Single improvement recommendation with specific action."""
    area: str = Field(..., description="Area that needs improvement")
    suggestion: str = Field(..., description="Specific actionable suggestion")
    priority: str = Field(..., description="Priority level: high, medium, low")
    
    class Config:
        json_schema_extra = {
            "example": {
                "area": "Success Metrics",
                "suggestion": "Add quantifiable metrics with specific targets (e.g., '90% user satisfaction' instead of 'high user satisfaction')",
                "priority": "high"
            }
        }


class EvaluationInDB(BaseModel):
    """Schema for evaluation stored in database."""
    evaluation_id: str = Field(default_factory=lambda: str(uuid4()))
    prd_id: str = Field(..., description="ID of the evaluated PRD")
    user_id: str = Field(..., description="ID of the user who owns the PRD")
    scores: EvaluationScores
    overall_score: int = Field(..., ge=0, le=100, description="Weighted average of all scores")
    strengths: List[str] = Field(..., description="Key strengths identified (2-3 items)")
    improvements: List[ImprovementRecommendation] = Field(..., description="Improvement recommendations (3-5 items)")
    summary: str = Field(..., description="Overall evaluation summary")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "evaluation_id": "770e8400-e29b-41d4-a716-446655440002",
                "prd_id": "660e8400-e29b-41d4-a716-446655440001",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "scores": {
                    "clarity": 85,
                    "relevance": 90,
                    "confidence": 75,
                    "completeness": 80,
                    "feasibility": 85,
                    "innovation": 70
                },
                "overall_score": 81,
                "strengths": [
                    "Clear problem definition and user value proposition",
                    "Well-defined target audience",
                    "Realistic timeline with milestones"
                ],
                "improvements": [
                    {
                        "area": "Success Metrics",
                        "suggestion": "Add quantifiable metrics with specific targets",
                        "priority": "high"
                    }
                ],
                "summary": "Strong PRD with clear vision. Focus on adding more specific metrics.",
                "created_at": "2026-02-12T20:00:00Z"
            }
        }


class EvaluationResponse(BaseModel):
    """Schema for evaluation API response."""
    evaluation_id: str
    prd_id: str
    user_id: str
    scores: EvaluationScores
    overall_score: int
    strengths: List[str]
    improvements: List[ImprovementRecommendation]
    summary: str
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "evaluation_id": "770e8400-e29b-41d4-a716-446655440002",
                "prd_id": "660e8400-e29b-41d4-a716-446655440001",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "scores": {
                    "clarity": 85,
                    "relevance": 90,
                    "confidence": 75,
                    "completeness": 80,
                    "feasibility": 85,
                    "innovation": 70
                },
                "overall_score": 81,
                "strengths": [
                    "Clear problem definition",
                    "Well-defined target audience"
                ],
                "improvements": [
                    {
                        "area": "Success Metrics",
                        "suggestion": "Add quantifiable metrics",
                        "priority": "high"
                    }
                ],
                "summary": "Strong PRD with clear vision",
                "created_at": "2026-02-12T20:00:00Z"
            }
        }


class EvaluationRequest(BaseModel):
    """Schema for requesting PRD evaluation."""
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