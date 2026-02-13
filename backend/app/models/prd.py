"""
PRD (Product Requirements Document) models for the application.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import uuid4
from enum import Enum


class PRDStatus(str, Enum):
    """Enum for PRD status values."""
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    IN_DEVELOPMENT = "in_development"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class PRDPriority(str, Enum):
    """Enum for PRD priority values."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class PRDCreate(BaseModel):
    """Schema for creating a new PRD."""
    title: str = Field(..., min_length=1, max_length=200, description="PRD title")
    description: Optional[str] = Field(None, description="Detailed description of the PRD")
    status: PRDStatus = Field(default=PRDStatus.DRAFT, description="Current status of the PRD")
    priority: PRDPriority = Field(default=PRDPriority.MEDIUM, description="Priority level")
    target_audience: Optional[str] = Field(None, description="Target audience for the product")
    success_metrics: Optional[List[str]] = Field(default=None, description="Success metrics for the PRD")
    timeline: Optional[str] = Field(None, description="Expected timeline for completion")
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "User Authentication System",
                "description": "Implement JWT-based authentication with signup, login, and logout",
                "status": "draft",
                "priority": "high",
                "target_audience": "All users",
                "success_metrics": ["100% of users can sign up", "Login success rate > 99%"],
                "timeline": "2 weeks"
            }
        }


class PRDUpdate(BaseModel):
    """Schema for updating an existing PRD."""
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="PRD title")
    description: Optional[str] = Field(None, description="Detailed description of the PRD")
    status: Optional[PRDStatus] = Field(None, description="Current status of the PRD")
    priority: Optional[PRDPriority] = Field(None, description="Priority level")
    target_audience: Optional[str] = Field(None, description="Target audience for the product")
    success_metrics: Optional[List[str]] = Field(None, description="Success metrics for the PRD")
    timeline: Optional[str] = Field(None, description="Expected timeline for completion")
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "in_review",
                "priority": "critical"
            }
        }


class PRDInDB(BaseModel):
    """Schema for PRD stored in database."""
    prd_id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str = Field(..., description="ID of the user who owns this PRD")
    title: str
    description: Optional[str] = None
    status: PRDStatus = PRDStatus.DRAFT
    priority: PRDPriority = PRDPriority.MEDIUM
    target_audience: Optional[str] = None
    success_metrics: Optional[List[str]] = None
    timeline: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "prd_id": "660e8400-e29b-41d4-a716-446655440001",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "User Authentication System",
                "description": "Implement JWT-based authentication",
                "status": "draft",
                "priority": "high",
                "target_audience": "All users",
                "success_metrics": ["100% of users can sign up"],
                "timeline": "2 weeks",
                "created_at": "2026-02-12T17:00:00Z",
                "updated_at": "2026-02-12T17:00:00Z"
            }
        }


class PRDResponse(BaseModel):
    """Schema for PRD API response."""
    prd_id: str
    user_id: str
    title: str
    description: Optional[str] = None
    status: PRDStatus
    priority: PRDPriority
    target_audience: Optional[str] = None
    success_metrics: Optional[List[str]] = None
    timeline: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "prd_id": "660e8400-e29b-41d4-a716-446655440001",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "User Authentication System",
                "description": "Implement JWT-based authentication",
                "status": "draft",
                "priority": "high",
                "target_audience": "All users",
                "success_metrics": ["100% of users can sign up"],
                "timeline": "2 weeks",
                "created_at": "2026-02-12T17:00:00Z",
                "updated_at": "2026-02-12T17:00:00Z"
            }
        }


class PRDListResponse(BaseModel):
    """Schema for paginated PRD list response."""
    prds: List[PRDResponse]
    total: int
    limit: int
    offset: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "prds": [],
                "total": 0,
                "limit": 10,
                "offset": 0
            }
        }