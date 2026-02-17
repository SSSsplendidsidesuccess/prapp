"""
User models for authentication and user management.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import uuid4


class UserCreate(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    name: Optional[str] = None


class UserInDB(BaseModel):
    """Schema for user stored in database."""
    user_id: str = Field(default_factory=lambda: str(uuid4()))
    email: EmailStr
    password_hash: str
    name: Optional[str] = None
    activation_state: str = Field(default="new", description="User activation state: new or activated")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_active_at: datetime = Field(default_factory=datetime.utcnow)
    reset_token: Optional[str] = Field(default=None, description="Password reset token")
    reset_token_expires_at: Optional[datetime] = Field(default=None, description="Reset token expiration time")
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "user@example.com",
                "password_hash": "$argon2id$...",
                "name": "John Doe",
                "activation_state": "new",
                "created_at": "2026-02-11T20:00:00Z",
                "last_active_at": "2026-02-11T20:30:00Z"
            }
        }


class UserResponse(BaseModel):
    """Schema for user API response."""
    user_id: str
    email: EmailStr
    name: Optional[str] = None
    activation_state: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "user@example.com",
                "name": "John Doe",
                "activation_state": "new"
            }
        }


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Schema for authentication token response."""
    user_id: str
    email: EmailStr
    name: Optional[str] = None
    token: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "user@example.com",
                "name": "John Doe",
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
        }


class UserProfileUpdate(BaseModel):
    """Schema for updating user profile."""
    name: Optional[str] = Field(None, description="User's display name")
    email: Optional[EmailStr] = Field(None, description="User's email address")
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Jane Doe",
                "email": "jane.doe@example.com"
            }
        }


class PasswordChange(BaseModel):
    """Schema for changing user password."""
    old_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, description="New password (min 8 characters)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "old_password": "currentpassword123",
                "new_password": "newpassword456"
            }
        }


class AccountDeletion(BaseModel):
    """Schema for account deletion confirmation."""
    password: str = Field(..., description="Password confirmation for account deletion")
    
    class Config:
        json_schema_extra = {
            "example": {
                "password": "mypassword123"
            }
        }


class ForgotPasswordRequest(BaseModel):
    """Schema for forgot password request."""
    email: EmailStr = Field(..., description="Email address to send reset link")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com"
            }
        }


class ForgotPasswordResponse(BaseModel):
    """Schema for forgot password response."""
    message: str
    reset_link: str = Field(..., description="Password reset link (for testing without email service)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "Password reset link generated",
                "reset_link": "https://prapp-frontend.vercel.app/reset-password?token=abc123..."
            }
        }


class ResetPasswordRequest(BaseModel):
    """Schema for reset password request."""
    token: str = Field(..., description="Password reset token from email link")
    new_password: str = Field(..., min_length=8, description="New password (min 8 characters)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "token": "abc123def456...",
                "new_password": "newSecurePassword123"
            }
        }


class ResetPasswordResponse(BaseModel):
    """Schema for reset password response."""
    message: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "Password successfully reset"
            }
        }