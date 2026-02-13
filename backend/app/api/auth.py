"""
Authentication endpoints for user signup, login, logout, and user info.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from app.models.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.db.mongodb import get_database
from datetime import datetime
from uuid import uuid4
import logging

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