"""
Session management API endpoints for Interview OS.
Handles session creation, chat messages, evaluation, and history.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from datetime import datetime
from app.models.session import (
    SessionCreate,
    SessionInDB,
    SessionResponse,
    SessionListResponse,
    SessionStatus,
    SendMessageRequest,
    SendMessageResponse,
    SessionUpdate,
    ChatMessage
)
from app.models.session_evaluation import (
    SessionEvaluationResponse,
    EvaluateSessionRequest
)
from app.core.dependencies import get_current_user
from app.db.mongodb import get_database
from app.services.openai_service import openai_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sessions", tags=["sessions"])


async def verify_session_ownership(session_id: str, user_id: str, db) -> dict:
    """
    Verify that the session belongs to the current user.
    
    Args:
        session_id: Session identifier
        user_id: Current user's ID
        db: Database instance
        
    Returns:
        Session document if found and owned by user
        
    Raises:
        HTTPException: If session not found or user doesn't own it
    """
    session = await db.sessions.find_one({"session_id": session_id})
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session with id {session_id} not found"
        )
    
    if session["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this session"
        )
    
    return session


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    session_data: SessionCreate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Create a new preparation session.
    
    Initializes a session with the specified preparation type and context.
    The session starts in 'in_progress' status and is ready for chat messages.
    
    Args:
        session_data: Session creation data
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        Created session object
    """
    try:
        # Build context payload
        context_payload = {
            "agenda": session_data.agenda,
            "tone": session_data.tone,
            "role_context": session_data.role_context
        }
        
        # Create session document
        session = SessionInDB(
            user_id=current_user["user_id"],
            preparation_type=session_data.preparation_type,
            meeting_subtype=session_data.meeting_subtype,
            context_payload=context_payload,
            transcript=[],
            status=SessionStatus.IN_PROGRESS
        )
        
        # Convert to dict for MongoDB
        session_dict = session.model_dump()
        
        # Insert into database
        result = await db.sessions.insert_one(session_dict)
        
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create session"
            )
        
        logger.info(f"Created session {session.session_id} for user {current_user['user_id']}")
        
        return SessionResponse(**session_dict)
        
    except Exception as e:
        logger.error(f"Error creating session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create session: {str(e)}"
        )


@router.get("", response_model=SessionListResponse)
async def list_sessions(
    status_filter: Optional[SessionStatus] = Query(None, description="Filter by status"),
    limit: int = Query(10, ge=1, le=100, description="Number of sessions to return"),
    offset: int = Query(0, ge=0, description="Number of sessions to skip"),
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    List all sessions for the authenticated user with filtering and pagination.
    
    Args:
        status_filter: Optional status filter
        limit: Maximum number of sessions to return
        offset: Number of sessions to skip
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        Paginated list of sessions
    """
    try:
        # Build query filter
        query = {"user_id": current_user["user_id"]}
        
        if status_filter:
            query["status"] = status_filter.value
        
        # Get total count
        total = await db.sessions.count_documents(query)
        
        # Fetch sessions with pagination
        cursor = db.sessions.find(query).sort("created_at", -1).skip(offset).limit(limit)
        sessions = await cursor.to_list(length=limit)
        
        # Convert to response models
        session_responses = [SessionResponse(**session) for session in sessions]
        
        logger.info(f"Listed {len(session_responses)} sessions for user {current_user['user_id']}")
        
        return SessionListResponse(
            sessions=session_responses,
            total=total,
            limit=limit,
            offset=offset
        )
        
    except Exception as e:
        logger.error(f"Error listing sessions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list sessions"
        )


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Get a specific session by ID.
    
    Args:
        session_id: Session identifier
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        Session object with full transcript
        
    Raises:
        HTTPException: If session not found or user doesn't own it
    """
    session = await verify_session_ownership(session_id, current_user["user_id"], db)
    
    logger.info(f"Retrieved session {session_id} for user {current_user['user_id']}")
    
    return SessionResponse(**session)


@router.patch("/{session_id}", response_model=SessionResponse)
async def update_session(
    session_id: str,
    session_update: SessionUpdate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Update a session's status.
    
    Args:
        session_id: Session identifier
        session_update: Fields to update
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        Updated session object
        
    Raises:
        HTTPException: If session not found or user doesn't own it
    """
    # Verify ownership
    await verify_session_ownership(session_id, current_user["user_id"], db)
    
    # Build update document
    update_data = session_update.model_dump(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Update in database
    result = await db.sessions.update_one(
        {"session_id": session_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        logger.warning(f"No changes made to session {session_id}")
    
    # Fetch and return updated session
    updated_session = await db.sessions.find_one({"session_id": session_id})
    
    logger.info(f"Updated session {session_id} for user {current_user['user_id']}")
    
    return SessionResponse(**updated_session)


@router.delete("/{session_id}", status_code=status.HTTP_200_OK)
async def delete_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Delete a session (soft delete by setting status to archived).
    
    Args:
        session_id: Session identifier
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If session not found or user doesn't own it
    """
    # Verify ownership
    await verify_session_ownership(session_id, current_user["user_id"], db)
    
    # Soft delete by setting status to archived
    result = await db.sessions.update_one(
        {"session_id": session_id},
        {"$set": {"status": SessionStatus.ARCHIVED.value}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete session"
        )
    
    logger.info(f"Deleted (archived) session {session_id} for user {current_user['user_id']}")
    
    return {"message": "Session deleted successfully", "session_id": session_id}


@router.post("/{session_id}/messages", response_model=SendMessageResponse, status_code=status.HTTP_200_OK)
async def send_message(
    session_id: str,
    request: SendMessageRequest,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Send a message in a session and receive AI response.
    
    This endpoint adds the user's message to the session transcript,
    generates an AI response based on the conversation context,
    and adds the AI response to the transcript.
    
    Args:
        session_id: Session identifier
        request: Message request with user's message
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        AI response and current turn number
        
    Raises:
        HTTPException: If session not found, not in progress, or AI generation fails
    """
    try:
        # Verify ownership and get session
        session = await verify_session_ownership(session_id, current_user["user_id"], db)
        
        # Validate session is in progress
        if session["status"] != SessionStatus.IN_PROGRESS.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Session is {session['status']}, not in_progress. Cannot send messages."
            )
        
        logger.info(f"Processing message for session {session_id}")
        
        # Create user message
        user_message = ChatMessage(
            role="user",
            message=request.message,
            timestamp=datetime.utcnow()
        )
        
        # Add user message to transcript
        transcript = session.get("transcript", [])
        transcript.append(user_message.model_dump())
        
        # Generate AI response using OpenAI service
        ai_response_text = await openai_service.generate_session_response(
            preparation_type=session["preparation_type"],
            meeting_subtype=session.get("meeting_subtype"),
            context_payload=session.get("context_payload", {}),
            transcript=transcript
        )
        
        # Create AI message
        ai_message = ChatMessage(
            role="ai",
            message=ai_response_text,
            timestamp=datetime.utcnow()
        )
        
        # Add AI message to transcript
        transcript.append(ai_message.model_dump())
        
        # Update session in database
        await db.sessions.update_one(
            {"session_id": session_id},
            {"$set": {"transcript": transcript}}
        )
        
        turn_number = len(transcript) // 2  # Each turn has user + AI message
        
        logger.info(f"Message processed for session {session_id}, turn {turn_number}")
        
        return SendMessageResponse(
            ai_response=ai_response_text,
            turn_number=turn_number
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing message for session {session_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process message: {str(e)}"
        )


@router.post("/{session_id}/complete", response_model=SessionResponse, status_code=status.HTTP_200_OK)
async def complete_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Complete a session and trigger evaluation.
    
    Marks the session as completed and generates a performance evaluation.
    If this is the user's first completed session, their activation_state
    will be updated to "activated".
    
    Args:
        session_id: Session identifier
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        Updated session object
        
    Raises:
        HTTPException: If session not found, already completed, or has insufficient turns
    """
    try:
        # Verify ownership and get session
        session = await verify_session_ownership(session_id, current_user["user_id"], db)
        
        # Validate session is in progress
        if session["status"] != SessionStatus.IN_PROGRESS.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Session is already {session['status']}"
            )
        
        # Validate minimum turns (at least 3 exchanges)
        transcript = session.get("transcript", [])
        if len(transcript) < 6:  # 3 turns = 6 messages (3 user + 3 AI)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Session must have at least 3 conversation turns before completion"
            )
        
        logger.info(f"Completing session {session_id}")
        
        # Update session status
        completed_at = datetime.utcnow()
        await db.sessions.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "status": SessionStatus.COMPLETED.value,
                    "completed_at": completed_at
                }
            }
        )
        
        # Note: Evaluation will be generated separately via the evaluate endpoint
        # This allows the frontend to show completion immediately and fetch evaluation async
        
        # Check if this is user's first completed session - update activation state
        user = await db.users.find_one({"user_id": current_user["user_id"]})
        
        if user and user.get("activation_state") == "new":
            # Check if this is their first completed session
            completed_count = await db.sessions.count_documents({
                "user_id": current_user["user_id"],
                "status": SessionStatus.COMPLETED.value
            })
            
            if completed_count == 1:  # This is their first completed session
                await db.users.update_one(
                    {"user_id": current_user["user_id"]},
                    {
                        "$set": {
                            "activation_state": "activated",
                            "last_active_at": datetime.utcnow()
                        }
                    }
                )
                logger.info(f"User {current_user['user_id']} activated after first session completion")
        
        # Fetch and return updated session
        updated_session = await db.sessions.find_one({"session_id": session_id})
        
        logger.info(f"Session {session_id} completed successfully")
        
        return SessionResponse(**updated_session)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error completing session {session_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete session: {str(e)}"
        )


@router.post("/{session_id}/evaluate", response_model=SessionEvaluationResponse, status_code=status.HTTP_200_OK)
async def evaluate_session(
    session_id: str,
    request: EvaluateSessionRequest = EvaluateSessionRequest(),
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Evaluate a completed session using AI.
    
    Generates multi-dimensional performance scores and improvement recommendations
    based on the session transcript and context.
    
    Args:
        session_id: Session identifier
        request: Evaluation request (optional force_reevaluate flag)
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        Comprehensive evaluation with scores and recommendations
        
    Raises:
        HTTPException: If session not found, not completed, or evaluation fails
    """
    try:
        # Verify ownership and get session
        session = await verify_session_ownership(session_id, current_user["user_id"], db)
        
        # Validate session is completed
        if session["status"] != SessionStatus.COMPLETED.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Session must be completed before evaluation"
            )
        
        logger.info(f"Evaluating session {session_id}")
        
        # Check if evaluation already exists
        existing_evaluation = await db.session_evaluations.find_one({"session_id": session_id})
        
        if existing_evaluation and not request.force_reevaluate:
            logger.info(f"Returning existing evaluation for session {session_id}")
            return SessionEvaluationResponse(**existing_evaluation)
        
        # Generate evaluation using OpenAI service
        evaluation_data = await openai_service.evaluate_session(
            preparation_type=session["preparation_type"],
            meeting_subtype=session.get("meeting_subtype"),
            context_payload=session.get("context_payload", {}),
            transcript=session.get("transcript", [])
        )
        
        # Add metadata
        evaluation_data["session_id"] = session_id
        evaluation_data["user_id"] = current_user["user_id"]
        evaluation_data["created_at"] = datetime.utcnow()
        
        # Store or update evaluation in database
        if existing_evaluation:
            await db.session_evaluations.update_one(
                {"session_id": session_id},
                {"$set": evaluation_data}
            )
            logger.info(f"Updated existing evaluation for session {session_id}")
        else:
            await db.session_evaluations.insert_one(evaluation_data)
            logger.info(f"Created new evaluation for session {session_id}")
        
        return SessionEvaluationResponse(**evaluation_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error evaluating session {session_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to evaluate session: {str(e)}"
        )


@router.get("/{session_id}/evaluation", response_model=SessionEvaluationResponse)
async def get_session_evaluation(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Get the evaluation results for a specific session.
    
    Args:
        session_id: Session identifier
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        Evaluation results with scores and recommendations
        
    Raises:
        HTTPException: If session not found, user doesn't own it, or no evaluation exists
    """
    # Verify ownership
    await verify_session_ownership(session_id, current_user["user_id"], db)
    
    # Fetch evaluation
    evaluation = await db.session_evaluations.find_one({"session_id": session_id})
    
    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No evaluation found for session {session_id}. Please evaluate the session first."
        )
    
    logger.info(f"Retrieved evaluation for session {session_id}")
    
    return SessionEvaluationResponse(**evaluation)