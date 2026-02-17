"""
Authentication endpoints for user signup, login, logout, and user info.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from app.models.user import (
    UserCreate, UserLogin, TokenResponse, UserResponse,
    ForgotPasswordRequest, ForgotPasswordResponse,
    ResetPasswordRequest, ResetPasswordResponse
)
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.db.mongodb import get_database
from datetime import datetime, timedelta
from uuid import uuid4
import logging
import os

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    """
    Create a new user account.
    
    - Validates email format and password length (min 8 chars)
    - Checks if email already exists
    - Hashes password with Argon2
    - Generates UUID for user_id
    - Stores user in MongoDB users collection
    - Generates JWT token
    - Returns user info with token
    """
    db = get_database()
    
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    # Check if email already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user document
    user_id = str(uuid4())
    hashed_password = hash_password(user_data.password)
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "password_hash": hashed_password,
        "name": user_data.name,
        "activation_state": "new",
        "created_at": datetime.utcnow(),
        "last_active_at": datetime.utcnow()
    }
    
    # Insert user into database
    try:
        await db.users.insert_one(user_doc)
        
        # Create unique index on user_id and email if not exists
        await db.users.create_index("user_id", unique=True)
        await db.users.create_index("email", unique=True)
        
        logger.info(f"New user created: {user_id}")
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user account"
        )
    
    # Generate JWT token
    token_data = {
        "user_id": user_id,
        "email": user_data.email
    }
    access_token = create_access_token(token_data)
    
    return TokenResponse(
        user_id=user_id,
        email=user_data.email,
        name=user_data.name,
        token=access_token
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """
    Authenticate existing user and return JWT token.
    
    - Finds user by email in MongoDB
    - Verifies password using verify_password()
    - Returns 401 if invalid credentials
    - Generates new JWT token if valid
    - Updates last_active_at timestamp
    - Returns user info with token
    """
    db = get_database()
    
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    # Find user by email
    user = await db.users.find_one({"email": credentials.email})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Update last_active_at
    try:
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$set": {"last_active_at": datetime.utcnow()}}
        )
    except Exception as e:
        logger.error(f"Error updating last_active_at: {e}")
    
    # Generate JWT token
    token_data = {
        "user_id": user["user_id"],
        "email": user["email"]
    }
    access_token = create_access_token(token_data)
    
    logger.info(f"User logged in: {user['user_id']}")
    
    return TokenResponse(
        user_id=user["user_id"],
        email=user["email"],
        name=user.get("name"),
        token=access_token
    )


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Log out the current user.
    
    - Validates JWT token from Authorization header
    - Returns success message
    - Note: Actual token invalidation happens client-side
    """
    logger.info(f"User logged out: {current_user['user_id']}")
    
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user information.
    
    - Extracts and validates JWT token from Authorization header
    - Decodes token to get user_id
    - Fetches user from MongoDB
    - Returns user info (user_id, email, activation_state)
    """
    db = get_database()
    
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    # Fetch user from database
    user = await db.users.find_one({"user_id": current_user["user_id"]})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        user_id=user["user_id"],
        email=user["email"],
        name=user.get("name"),
        activation_state=user["activation_state"]
    )


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(request: ForgotPasswordRequest):
    """
    Generate password reset token for user.
    
    - Finds user by email
    - Generates unique reset token (UUID)
    - Sets token expiration (1 hour from now)
    - Saves token to user document
    - Returns reset link (for testing without email service)
    
    Note: In production, this would send an email instead of returning the link.
    """
    db = get_database()
    
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    # Find user by email
    user = await db.users.find_one({"email": request.email})
    
    if not user:
        # For security, don't reveal if email exists or not
        # Return success message anyway
        logger.warning(f"Password reset requested for non-existent email: {request.email}")
        # Return a fake link to prevent email enumeration
        return ForgotPasswordResponse(
            message="If an account exists with this email, a password reset link has been sent",
            reset_link="https://prapp-frontend.vercel.app/reset-password?token=invalid"
        )
    
    # Generate reset token
    reset_token = str(uuid4())
    expires_at = datetime.utcnow() + timedelta(hours=1)
    
    # Save token to user document
    try:
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {
                "$set": {
                    "reset_token": reset_token,
                    "reset_token_expires_at": expires_at
                }
            }
        )
        logger.info(f"Password reset token generated for user: {user['user_id']}")
    except Exception as e:
        logger.error(f"Error saving reset token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate reset token"
        )
    
    # Get frontend URL from environment or use default
    frontend_url = os.getenv("FRONTEND_URL", "https://prapp-frontend.vercel.app")
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"
    
    # In production, send email here instead of returning link
    # For now, return the link for testing
    
    return ForgotPasswordResponse(
        message="Password reset link generated successfully",
        reset_link=reset_link
    )


@router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_password(request: ResetPasswordRequest):
    """
    Reset user password using reset token.
    
    - Finds user by reset token
    - Validates token hasn't expired
    - Hashes new password
    - Updates user's password
    - Clears reset token fields
    - Returns success message
    """
    db = get_database()
    
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    # Find user by reset token
    user = await db.users.find_one({"reset_token": request.token})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Check if token has expired
    if not user.get("reset_token_expires_at") or user["reset_token_expires_at"] < datetime.utcnow():
        # Clear expired token
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {
                "$unset": {
                    "reset_token": "",
                    "reset_token_expires_at": ""
                }
            }
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired. Please request a new one"
        )
    
    # Hash new password
    new_password_hash = hash_password(request.new_password)
    
    # Update password and clear reset token
    try:
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {
                "$set": {
                    "password_hash": new_password_hash,
                    "last_active_at": datetime.utcnow()
                },
                "$unset": {
                    "reset_token": "",
                    "reset_token_expires_at": ""
                }
            }
        )
        logger.info(f"Password reset successful for user: {user['user_id']}")
    except Exception as e:
        logger.error(f"Error resetting password: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reset password"
        )
    
    return ResetPasswordResponse(
        message="Password successfully reset. You can now log in with your new password"
    )