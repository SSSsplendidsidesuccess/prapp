"""
User profile management endpoints.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from app.models.user import UserProfileUpdate, PasswordChange, AccountDeletion, UserResponse
from app.core.security import hash_password, verify_password
from app.core.dependencies import get_current_user
from app.db.mongodb import get_database
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/profile", response_model=UserResponse)
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """
    Get current user's profile information.
    
    - Requires valid JWT token
    - Returns user profile data (user_id, email, name, activation_state)
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


@router.patch("/profile", response_model=UserResponse)
async def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update current user's profile information.
    
    - Requires valid JWT token
    - Accepts partial updates (name and/or email)
    - Validates email format if provided
    - Checks for duplicate email if email is being changed
    - Returns updated user profile
    """
    db = get_database()
    
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    # Build update document with only provided fields
    update_data = {}
    
    if profile_data.name is not None:
        update_data["name"] = profile_data.name
    
    if profile_data.email is not None:
        # Check if email is being changed
        current_user_doc = await db.users.find_one({"user_id": current_user["user_id"]})
        
        if current_user_doc and current_user_doc["email"] != profile_data.email:
            # Check if new email already exists
            existing_user = await db.users.find_one({"email": profile_data.email})
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already in use by another account"
                )
            update_data["email"] = profile_data.email
    
    # If no fields to update, return current profile
    if not update_data:
        return await get_user_profile(current_user)
    
    # Update last_active_at timestamp
    update_data["last_active_at"] = datetime.utcnow()
    
    # Update user in database
    try:
        result = await db.users.update_one(
            {"user_id": current_user["user_id"]},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        logger.info(f"User profile updated: {current_user['user_id']}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )
    
    # Fetch and return updated user
    updated_user = await db.users.find_one({"user_id": current_user["user_id"]})
    
    return UserResponse(
        user_id=updated_user["user_id"],
        email=updated_user["email"],
        name=updated_user.get("name"),
        activation_state=updated_user["activation_state"]
    )


@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: dict = Depends(get_current_user)
):
    """
    Change current user's password.
    
    - Requires valid JWT token
    - Verifies old password before allowing change
    - Validates new password meets minimum requirements (8 chars)
    - Hashes new password with Argon2
    - Returns success message
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
    
    # Verify old password
    if not verify_password(password_data.old_password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Hash new password
    new_password_hash = hash_password(password_data.new_password)
    
    # Update password in database
    try:
        await db.users.update_one(
            {"user_id": current_user["user_id"]},
            {
                "$set": {
                    "password_hash": new_password_hash,
                    "last_active_at": datetime.utcnow()
                }
            }
        )
        
        logger.info(f"Password changed for user: {current_user['user_id']}")
    except Exception as e:
        logger.error(f"Error changing password: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to change password"
        )
    
    return {"message": "Password changed successfully"}


@router.delete("/account")
async def delete_account(
    deletion_data: AccountDeletion,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete current user's account.
    
    - Requires valid JWT token
    - Requires password confirmation for security
    - Performs hard delete (removes user document from database)
    - Returns success message
    
    Note: This is a destructive operation and cannot be undone.
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
    
    # Verify password
    if not verify_password(deletion_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is incorrect"
        )
    
    # Delete user from database (hard delete)
    try:
        result = await db.users.delete_one({"user_id": current_user["user_id"]})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        logger.info(f"Account deleted for user: {current_user['user_id']}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting account: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account"
        )
    
    return {"message": "Account deleted successfully"}