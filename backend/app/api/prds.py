"""
PRD (Product Requirements Document) API endpoints.
Handles CRUD operations for PRDs with ownership validation.
Includes AI-powered PRD generation, enhancement, and evaluation.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from datetime import datetime
from app.models.prd import (
    PRDCreate,
    PRDUpdate,
    PRDResponse,
    PRDListResponse,
    PRDInDB,
    PRDStatus
)
from app.models.ai_models import (
    PRDGenerateRequest,
    PRDEnhanceRequest,
    PRDGenerateResponse,
    PRDEnhanceResponse,
    AIGeneratedPRD
)
from app.models.evaluation import (
    EvaluationRequest,
    EvaluationResponse,
    EvaluationInDB,
    EvaluationScores,
    ImprovementRecommendation
)
from app.core.dependencies import get_current_user
from app.db.mongodb import get_database
from app.services.openai_service import openai_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/prds", tags=["prds"])


async def verify_prd_ownership(prd_id: str, user_id: str, db) -> dict:
    """
    Verify that the PRD belongs to the current user.
    
    Args:
        prd_id: PRD identifier
        user_id: Current user's ID
        db: Database instance
        
    Returns:
        PRD document if found and owned by user
        
    Raises:
        HTTPException: If PRD not found or user doesn't own it
    """
    prd = await db.prds.find_one({"prd_id": prd_id})
    
    if not prd:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"PRD with id {prd_id} not found"
        )
    
    if prd["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this PRD"
        )
    
    return prd
    
    if prd["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this PRD"
        )
    
    return prd

@router.post("/generate", response_model=PRDGenerateResponse, status_code=status.HTTP_200_OK)
async def generate_prd(
    request: PRDGenerateRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a PRD from an idea description using AI.
    
    This endpoint uses GPT-4 to transform a product idea into a comprehensive
    Product Requirements Document with title, description, target audience,
    success metrics, and timeline.
    
    Args:
        request: PRD generation request with idea description
        current_user: Current authenticated user
        
    Returns:
        Generated PRD content
        
    Raises:
        HTTPException: If generation fails or API key is invalid
    """
    try:
        logger.info(
            f"Generating PRD for user {current_user['user_id']} "
            f"(idea length: {len(request.idea_description)} chars)"
        )
        
        # Generate PRD using OpenAI service
        generated_data = await openai_service.generate_prd(request.idea_description)
        
        # Create response with generated data
        ai_prd = AIGeneratedPRD(
            title=generated_data["title"],
            description=generated_data["description"],
            target_audience=generated_data["target_audience"],
            success_metrics=generated_data["success_metrics"],
            timeline=generated_data["timeline"],
            tokens_used=generated_data.get("tokens_used")
        )
        
        logger.info(f"PRD generated successfully for user {current_user['user_id']}")
        
        return PRDGenerateResponse(
            message="PRD generated successfully",
            generated_prd=ai_prd
        )
        
    except ValueError as e:
        logger.error(f"Validation error in PRD generation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    except Exception as e:
        logger.error(f"Error generating PRD: {str(e)}")
        
        # Check for common OpenAI API errors
        error_message = str(e).lower()
        if "api key" in error_message or "authentication" in error_message:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="OpenAI API authentication failed. Please contact support."
            )
        elif "rate limit" in error_message:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again in a moment."
            )
        elif "timeout" in error_message or "connection" in error_message:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service temporarily unavailable. Please try again."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate PRD: {str(e)}"
            )


@router.post("/{prd_id}/enhance", response_model=PRDEnhanceResponse, status_code=status.HTTP_200_OK)
async def enhance_prd(
    prd_id: str,
    request: PRDEnhanceRequest,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Enhance an existing PRD using AI based on user instructions.
    
    This endpoint uses GPT-4 to improve an existing PRD according to specific
    enhancement instructions provided by the user. The AI will refine and
    enhance the PRD while maintaining its core intent.
    
    Args:
        prd_id: ID of the PRD to enhance
        request: Enhancement request with instructions
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        Enhanced PRD content
        
    Raises:
        HTTPException: If PRD not found, user doesn't own it, or enhancement fails
    """
    try:
        # Verify ownership and get current PRD
        prd = await verify_prd_ownership(prd_id, current_user["user_id"], db)
        
        logger.info(
            f"Enhancing PRD {prd_id} for user {current_user['user_id']} "
            f"(instructions length: {len(request.enhancement_instructions)} chars)"
        )
        
        # Prepare current PRD data for enhancement
        current_prd_data = {
            "title": prd.get("title", ""),
            "description": prd.get("description", ""),
            "target_audience": prd.get("target_audience", ""),
            "success_metrics": prd.get("success_metrics", []),
            "timeline": prd.get("timeline", "")
        }
        
        # Enhance PRD using OpenAI service
        enhanced_data = await openai_service.enhance_prd(
            current_prd_data,
            request.enhancement_instructions
        )
        
        # Create response with enhanced data
        enhanced_prd = AIGeneratedPRD(
            title=enhanced_data["title"],
            description=enhanced_data["description"],
            target_audience=enhanced_data["target_audience"],
            success_metrics=enhanced_data["success_metrics"],
            timeline=enhanced_data["timeline"],
            tokens_used=enhanced_data.get("tokens_used")
        )
        
        logger.info(f"PRD {prd_id} enhanced successfully for user {current_user['user_id']}")
        
        return PRDEnhanceResponse(
            message="PRD enhanced successfully",
            enhanced_prd=enhanced_prd
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions (from verify_prd_ownership)
        raise
    
    except ValueError as e:
        logger.error(f"Validation error in PRD enhancement: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    except Exception as e:
        logger.error(f"Error enhancing PRD {prd_id}: {str(e)}")
        
        # Check for common OpenAI API errors
        error_message = str(e).lower()
        if "api key" in error_message or "authentication" in error_message:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="OpenAI API authentication failed. Please contact support."
            )
        elif "rate limit" in error_message:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again in a moment."
            )
        elif "timeout" in error_message or "connection" in error_message:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service temporarily unavailable. Please try again."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to enhance PRD: {str(e)}"
            )

    


@router.post("", response_model=PRDResponse, status_code=status.HTTP_201_CREATED)
async def create_prd(
    prd_data: PRDCreate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Create a new PRD for the authenticated user.
    
    Args:
        prd_data: PRD creation data
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        Created PRD object
    """
    # Create PRD document
    prd = PRDInDB(
        user_id=current_user["user_id"],
        title=prd_data.title,
        description=prd_data.description,
        status=prd_data.status,
        priority=prd_data.priority,
        target_audience=prd_data.target_audience,
        success_metrics=prd_data.success_metrics,
        timeline=prd_data.timeline
    )
    
    # Convert to dict for MongoDB
    prd_dict = prd.model_dump()
    
    # Insert into database
    result = await db.prds.insert_one(prd_dict)
    
    if not result.inserted_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create PRD"
        )
    
    logger.info(f"Created PRD {prd.prd_id} for user {current_user['user_id']}")
    
    return PRDResponse(**prd_dict)


@router.get("", response_model=PRDListResponse)
async def list_prds(
    status_filter: Optional[PRDStatus] = Query(None, description="Filter by status"),
    limit: int = Query(10, ge=1, le=100, description="Number of PRDs to return"),
    offset: int = Query(0, ge=0, description="Number of PRDs to skip"),
    sort_by: str = Query("created_at", description="Field to sort by (created_at, updated_at, title, priority)"),
    sort_order: str = Query("desc", description="Sort order (asc or desc)"),
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    List all PRDs for the authenticated user with filtering, sorting, and pagination.
    
    Args:
        status_filter: Optional status filter
        limit: Maximum number of PRDs to return
        offset: Number of PRDs to skip
        sort_by: Field to sort by
        sort_order: Sort order (asc or desc)
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        Paginated list of PRDs
    """
    # Build query filter
    query = {"user_id": current_user["user_id"]}
    
    if status_filter:
        query["status"] = status_filter.value
    
    # Determine sort direction
    sort_direction = -1 if sort_order == "desc" else 1
    
    # Validate sort_by field
    valid_sort_fields = ["created_at", "updated_at", "title", "priority", "status"]
    if sort_by not in valid_sort_fields:
        sort_by = "created_at"
    
    # Get total count
    total = await db.prds.count_documents(query)
    
    # Fetch PRDs with pagination and sorting
    cursor = db.prds.find(query).sort(sort_by, sort_direction).skip(offset).limit(limit)
    prds = await cursor.to_list(length=limit)
    
    # Convert to response models
    prd_responses = [PRDResponse(**prd) for prd in prds]
    
    logger.info(f"Listed {len(prd_responses)} PRDs for user {current_user['user_id']}")
    
    return PRDListResponse(
        prds=prd_responses,
        total=total,
        limit=limit,
        offset=offset
    )


@router.get("/{prd_id}", response_model=PRDResponse)
async def get_prd(
    prd_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Get a specific PRD by ID.
    
    Args:
        prd_id: PRD identifier
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        PRD object
        
    Raises:
        HTTPException: If PRD not found or user doesn't own it
    """
    prd = await verify_prd_ownership(prd_id, current_user["user_id"], db)
    
    logger.info(f"Retrieved PRD {prd_id} for user {current_user['user_id']}")
    
    return PRDResponse(**prd)


@router.patch("/{prd_id}", response_model=PRDResponse)
async def update_prd(
    prd_id: str,
    prd_update: PRDUpdate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Update a PRD. Only updates fields that are provided.
    
    Args:
        prd_id: PRD identifier
        prd_update: Fields to update
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        Updated PRD object
        
    Raises:
        HTTPException: If PRD not found or user doesn't own it
    """
    # Verify ownership
    await verify_prd_ownership(prd_id, current_user["user_id"], db)
    
    # Build update document (only include provided fields)
    update_data = prd_update.model_dump(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Add updated_at timestamp
    update_data["updated_at"] = datetime.utcnow()
    
    # Update in database
    result = await db.prds.update_one(
        {"prd_id": prd_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        logger.warning(f"No changes made to PRD {prd_id}")
    
    # Fetch and return updated PRD
    updated_prd = await db.prds.find_one({"prd_id": prd_id})
    
    logger.info(f"Updated PRD {prd_id} for user {current_user['user_id']}")
    
    return PRDResponse(**updated_prd)


@router.delete("/{prd_id}", status_code=status.HTTP_200_OK)
async def delete_prd(
    prd_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Delete a PRD (soft delete by setting status to archived).
    
    Args:
        prd_id: PRD identifier
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If PRD not found or user doesn't own it
    """
    # Verify ownership
    await verify_prd_ownership(prd_id, current_user["user_id"], db)
    
    # Soft delete by setting status to archived
    result = await db.prds.update_one(
        {"prd_id": prd_id},
        {
            "$set": {
                "status": PRDStatus.ARCHIVED.value,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete PRD"
        )
    
    logger.info(f"Deleted (archived) PRD {prd_id} for user {current_user['user_id']}")
    
    return {"message": "PRD deleted successfully", "prd_id": prd_id}


@router.post("/{prd_id}/evaluate", response_model=EvaluationResponse, status_code=status.HTTP_200_OK)
async def evaluate_prd(
    prd_id: str,
    request: EvaluationRequest = EvaluationRequest(),
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Evaluate a PRD using AI to generate multi-dimensional scores and improvement recommendations.
    
    This endpoint analyzes the PRD across six dimensions (Clarity, Relevance, Confidence,
    Completeness, Feasibility, Innovation) and provides actionable improvement suggestions.
    
    If this is the user's first evaluation, their activation_state will be updated to "activated".
    
    Args:
        prd_id: ID of the PRD to evaluate
        request: Evaluation request (optional force_reevaluate flag)
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        Comprehensive evaluation with scores, strengths, and improvement recommendations
        
    Raises:
        HTTPException: If PRD not found, user doesn't own it, or evaluation fails
    """
    try:
        # Verify ownership and get PRD
        prd = await verify_prd_ownership(prd_id, current_user["user_id"], db)
        
        logger.info(f"Evaluating PRD {prd_id} for user {current_user['user_id']}")
        
        # Check if evaluation already exists
        existing_evaluation = await db.evaluations.find_one({"prd_id": prd_id})
        
        if existing_evaluation and not request.force_reevaluate:
            logger.info(f"Returning existing evaluation for PRD {prd_id}")
            return EvaluationResponse(**existing_evaluation)
        
        # Prepare PRD data for evaluation
        prd_data = {
            "title": prd.get("title", ""),
            "description": prd.get("description", ""),
            "target_audience": prd.get("target_audience", ""),
            "success_metrics": prd.get("success_metrics", []),
            "timeline": prd.get("timeline", ""),
            "priority": prd.get("priority", ""),
            "status": prd.get("status", "")
        }
        
        # Generate evaluation using OpenAI service
        evaluation_result = await openai_service.evaluate_prd(prd_data)
        
        # Create evaluation document
        evaluation = EvaluationInDB(
            prd_id=prd_id,
            user_id=current_user["user_id"],
            scores=EvaluationScores(**evaluation_result["scores"]),
            overall_score=evaluation_result["overall_score"],
            strengths=evaluation_result["strengths"],
            improvements=[
                ImprovementRecommendation(**imp) 
                for imp in evaluation_result["improvements"]
            ],
            summary=evaluation_result["summary"]
        )
        
        # Convert to dict for MongoDB
        evaluation_dict = evaluation.model_dump()
        
        # Store or update evaluation in database
        if existing_evaluation:
            # Update existing evaluation
            await db.evaluations.update_one(
                {"prd_id": prd_id},
                {"$set": evaluation_dict}
            )
            logger.info(f"Updated existing evaluation for PRD {prd_id}")
        else:
            # Insert new evaluation
            await db.evaluations.insert_one(evaluation_dict)
            logger.info(f"Created new evaluation for PRD {prd_id}")
        
        # Check if this is user's first evaluation - update activation state
        user = await db.users.find_one({"user_id": current_user["user_id"]})
        
        if user and user.get("activation_state") == "new":
            # Check if this is their first evaluation
            evaluation_count = await db.evaluations.count_documents(
                {"user_id": current_user["user_id"]}
            )
            
            if evaluation_count == 1:  # This is their first evaluation
                await db.users.update_one(
                    {"user_id": current_user["user_id"]},
                    {
                        "$set": {
                            "activation_state": "activated",
                            "last_active_at": datetime.utcnow()
                        }
                    }
                )
                logger.info(
                    f"User {current_user['user_id']} activated after first evaluation"
                )
        
        return EvaluationResponse(**evaluation_dict)
        
    except HTTPException:
        # Re-raise HTTP exceptions (from verify_prd_ownership)
        raise
    
    except ValueError as e:
        logger.error(f"Validation error in PRD evaluation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    except Exception as e:
        logger.error(f"Error evaluating PRD {prd_id}: {str(e)}")
        
        # Check for common OpenAI API errors
        error_message = str(e).lower()
        if "api key" in error_message or "authentication" in error_message:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="OpenAI API authentication failed. Please contact support."
            )
        elif "rate limit" in error_message:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again in a moment."
            )
        elif "timeout" in error_message or "connection" in error_message:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service temporarily unavailable. Please try again."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to evaluate PRD: {str(e)}"
            )


@router.get("/{prd_id}/evaluation", response_model=EvaluationResponse)
async def get_prd_evaluation(
    prd_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Get the evaluation results for a specific PRD.
    
    Args:
        prd_id: ID of the PRD
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        Evaluation results with scores and recommendations
        
    Raises:
        HTTPException: If PRD not found, user doesn't own it, or no evaluation exists
    """
    # Verify ownership
    await verify_prd_ownership(prd_id, current_user["user_id"], db)
    
    # Fetch evaluation
    evaluation = await db.evaluations.find_one({"prd_id": prd_id})
    
    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No evaluation found for PRD {prd_id}. Please evaluate the PRD first."
        )
    
    logger.info(f"Retrieved evaluation for PRD {prd_id}")
    
    return EvaluationResponse(**evaluation)