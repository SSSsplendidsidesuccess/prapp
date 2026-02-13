"""
Session models for Interview OS preparation sessions.
Handles session setup, chat messages, and session state management.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import uuid4
from enum import Enum


class PreparationType(str, Enum):
    """Enum for preparation types."""
    INTERVIEW = "Interview"
    CORPORATE = "Corporate"
    PITCH = "Pitch"
    SALES = "Sales"
    PRESENTATION = "Presentation"
    OTHER = "Other"


class SessionStatus(str, Enum):
    """Enum for session status values."""
    SETUP = "setup"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class ChatMessage(BaseModel):
    """Single chat message in a session."""
    role: str = Field(..., description="Message role: 'ai' or 'user'")
    message: str = Field(..., description="Message content")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "role": "ai",
                "message": "Tell me about a time you led a project...",
                "timestamp": "2026-02-13T03:00:00Z"
            }
        }


class SessionSetup(BaseModel):
    """Session setup configuration."""
    preparation_type: PreparationType = Field(..., description="Type of preparation session")
    meeting_subtype: Optional[str] = Field(None, description="Specific subtype (e.g., 'Behavioral', 'Technical')")
    agenda: Optional[str] = Field(None, description="Session agenda or focus")
    tone: str = Field(default="Professional & Confident", description="Desired conversation tone")
    role_context: Optional[str] = Field(None, description="User's background/role context")
    
    class Config:
        json_schema_extra = {
            "example": {
                "preparation_type": "Interview",
                "meeting_subtype": "Behavioral",
                "agenda": "Practice STAR method responses",
                "tone": "Professional & Confident",
                "role_context": "Senior Product Manager with 5 years experience"
            }
        }


class SessionCreate(BaseModel):
    """Schema for creating a new session."""
    preparation_type: PreparationType
    meeting_subtype: Optional[str] = None
    agenda: Optional[str] = None
    tone: str = "Professional & Confident"
    role_context: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "preparation_type": "Interview",
                "meeting_subtype": "Behavioral",
                "agenda": "Practice STAR method responses",
                "tone": "Professional & Confident",
                "role_context": "Senior Product Manager"
            }
        }


class SessionInDB(BaseModel):
    """Schema for session stored in database."""
    session_id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str = Field(..., description="ID of the user who owns this session")
    preparation_type: PreparationType
    meeting_subtype: Optional[str] = None
    context_payload: dict = Field(default_factory=dict, description="Session context (agenda, tone, role)")
    transcript: List[ChatMessage] = Field(default_factory=list, description="Conversation history")
    status: SessionStatus = Field(default=SessionStatus.IN_PROGRESS)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "660e8400-e29b-41d4-a716-446655440001",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "preparation_type": "Interview",
                "meeting_subtype": "Behavioral",
                "context_payload": {
                    "agenda": "Practice STAR method",
                    "tone": "Professional & Confident",
                    "role_context": "Senior PM"
                },
                "transcript": [],
                "status": "in_progress",
                "created_at": "2026-02-13T03:00:00Z",
                "completed_at": None
            }
        }


class SessionResponse(BaseModel):
    """Schema for session API response."""
    session_id: str
    user_id: str
    preparation_type: PreparationType
    meeting_subtype: Optional[str] = None
    context_payload: dict
    transcript: List[ChatMessage]
    status: SessionStatus
    created_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "660e8400-e29b-41d4-a716-446655440001",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "preparation_type": "Interview",
                "meeting_subtype": "Behavioral",
                "context_payload": {
                    "agenda": "Practice STAR method",
                    "tone": "Professional & Confident"
                },
                "transcript": [
                    {
                        "role": "ai",
                        "message": "Tell me about a time...",
                        "timestamp": "2026-02-13T03:00:00Z"
                    }
                ],
                "status": "in_progress",
                "created_at": "2026-02-13T03:00:00Z",
                "completed_at": None
            }
        }


class SessionListResponse(BaseModel):
    """Schema for paginated session list response."""
    sessions: List[SessionResponse]
    total: int
    limit: int
    offset: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "sessions": [],
                "total": 0,
                "limit": 10,
                "offset": 0
            }
        }


class SendMessageRequest(BaseModel):
    """Schema for sending a message in a session."""
    message: str = Field(..., min_length=1, description="User's message")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "In my previous role as a PM, I led a cross-functional team..."
            }
        }


class SendMessageResponse(BaseModel):
    """Schema for message response."""
    ai_response: str = Field(..., description="AI's response message")
    turn_number: int = Field(..., description="Current turn number in conversation")
    
    class Config:
        json_schema_extra = {
            "example": {
                "ai_response": "That's a great start. Can you tell me more about the specific challenges you faced?",
                "turn_number": 3
            }
        }


class SessionUpdate(BaseModel):
    """Schema for updating session status."""
    status: Optional[SessionStatus] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "completed"
            }
        }