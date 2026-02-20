"""
Playbooks API endpoints for Sales Playbook Builder feature.
Handles CRUD operations, scenario management, and AI-powered content generation.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from datetime import datetime
import logging

from app.models.playbook import (
    PlaybookCreate,
    PlaybookUpdate,
    PlaybookInDB,
    PlaybookResponse,
    PlaybookListResponse,
    PlaybookStatus,
    Scenario,
    ScenarioCreate,
    ScenarioUpdate,
    ContentSection,
    GeneratePlaybookRequest,
    GenerateScenarioContentRequest
)
from app.core.dependencies import get_current_user
from app.db.mongodb import get_database
from app.services.openai_service import openai_service
from app.services.rag_service import get_rag_service
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/playbooks", tags=["playbooks"])


async def verify_playbook_ownership(playbook_id: str, user_id: str, db) -> dict:
    """
    Verify that the playbook belongs to the current user.
    
    Args:
        playbook_id: Playbook identifier
        user_id: Current user's ID
        db: Database instance
        
    Returns:
        Playbook document if found and owned by user
        
    Raises:
        HTTPException: If playbook not found or user doesn't own it
    """
    playbook = await db.playbooks.find_one({"id": playbook_id})
    
    if not playbook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Playbook with id {playbook_id} not found"
        )
    
    if playbook["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this playbook"
        )
    
    return playbook


@router.post("", response_model=PlaybookResponse, status_code=status.HTTP_201_CREATED)
async def create_playbook(
    playbook_data: PlaybookCreate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Create a new playbook.
    
    Initializes a playbook with the specified metadata.
    The playbook starts in 'draft' status with no scenarios.
    
    Args:
        playbook_data: Playbook creation data
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        Created playbook object
    """
    try:
        # Create playbook document
        playbook = PlaybookInDB(
            user_id=current_user["user_id"],
            title=playbook_data.title,
            description=playbook_data.description,
            target_persona=playbook_data.target_persona,
            industry=playbook_data.industry,
            product_line=playbook_data.product_line,
            status=PlaybookStatus.DRAFT,
            is_template=False,
            scenarios=[]
        )
        
        # Convert to dict for MongoDB
        playbook_dict = playbook.model_dump()
        
        # Insert into database
        result = await db.playbooks.insert_one(playbook_dict)
        
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create playbook"
            )
        
        logger.info(f"Created playbook {playbook.id} for user {current_user['user_id']}")
        
        return PlaybookResponse(**playbook_dict)
        
    except Exception as e:
        logger.error(f"Error creating playbook: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create playbook: {str(e)}"
        )


@router.get("", response_model=PlaybookListResponse)
async def list_playbooks(
    status_filter: Optional[PlaybookStatus] = Query(None, description="Filter by status"),
    is_template: Optional[bool] = Query(None, description="Filter by template status"),
    limit: int = Query(20, ge=1, le=100, description="Number of playbooks to return"),
    offset: int = Query(0, ge=0, description="Number of playbooks to skip"),
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    List all playbooks for the authenticated user with filtering and pagination.
    
    Args:
        status_filter: Optional status filter
        is_template: Optional template filter
        limit: Maximum number of playbooks to return
        offset: Number of playbooks to skip
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        Paginated list of playbooks
    """
    try:
        # Build query filter
        query = {"user_id": current_user["user_id"]}
        
        if status_filter:
            query["status"] = status_filter.value
        
        if is_template is not None:
            query["is_template"] = is_template
        
        # Get total count
        total = await db.playbooks.count_documents(query)
        
        # Fetch playbooks with pagination
        cursor = db.playbooks.find(query).sort("updated_at", -1).skip(offset).limit(limit)
        playbooks = await cursor.to_list(length=limit)
        
        # Convert to response models
        playbook_responses = [PlaybookResponse(**playbook) for playbook in playbooks]
        
        logger.info(f"Listed {len(playbook_responses)} playbooks for user {current_user['user_id']}")
        
        return PlaybookListResponse(
            playbooks=playbook_responses,
            total=total,
            limit=limit,
            offset=offset
        )
        
    except Exception as e:
        logger.error(f"Error listing playbooks: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list playbooks"
        )


@router.get("/{playbook_id}", response_model=PlaybookResponse)
async def get_playbook(
    playbook_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Get a specific playbook by ID.
    
    Args:
        playbook_id: Playbook identifier
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        Playbook object with all scenarios
        
    Raises:
        HTTPException: If playbook not found or user doesn't own it
    """
    playbook = await verify_playbook_ownership(playbook_id, current_user["user_id"], db)
    
    logger.info(f"Retrieved playbook {playbook_id} for user {current_user['user_id']}")
    
    return PlaybookResponse(**playbook)


@router.put("/{playbook_id}", response_model=PlaybookResponse)
async def update_playbook(
    playbook_id: str,
    playbook_update: PlaybookUpdate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Update a playbook's metadata.
    
    Args:
        playbook_id: Playbook identifier
        playbook_update: Fields to update
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        Updated playbook object
        
    Raises:
        HTTPException: If playbook not found or user doesn't own it
    """
    # Verify ownership
    await verify_playbook_ownership(playbook_id, current_user["user_id"], db)
    
    # Build update document
    update_data = playbook_update.model_dump(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Add updated timestamp
    update_data["updated_at"] = datetime.utcnow()
    
    # Update in database
    result = await db.playbooks.update_one(
        {"id": playbook_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        logger.warning(f"No changes made to playbook {playbook_id}")
    
    # Fetch and return updated playbook
    updated_playbook = await db.playbooks.find_one({"id": playbook_id})
    
    logger.info(f"Updated playbook {playbook_id} for user {current_user['user_id']}")
    
    return PlaybookResponse(**updated_playbook)


@router.delete("/{playbook_id}", status_code=status.HTTP_200_OK)
async def delete_playbook(
    playbook_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Delete a playbook (soft delete by setting status to archived).
    
    Args:
        playbook_id: Playbook identifier
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If playbook not found or user doesn't own it
    """
    # Verify ownership
    await verify_playbook_ownership(playbook_id, current_user["user_id"], db)
    
    # Soft delete by setting status to archived
    result = await db.playbooks.update_one(
        {"id": playbook_id},
        {"$set": {
            "status": PlaybookStatus.ARCHIVED.value,
            "updated_at": datetime.utcnow()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete playbook"
        )
    
    logger.info(f"Deleted (archived) playbook {playbook_id} for user {current_user['user_id']}")
    
    return {"message": "Playbook deleted successfully", "playbook_id": playbook_id}


@router.post("/{playbook_id}/scenarios", response_model=Scenario, status_code=status.HTTP_201_CREATED)
async def add_scenario(
    playbook_id: str,
    scenario_data: ScenarioCreate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Add a new scenario to a playbook.
    
    Args:
        playbook_id: Playbook identifier
        scenario_data: Scenario creation data
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        Created scenario object
        
    Raises:
        HTTPException: If playbook not found or user doesn't own it
    """
    try:
        # Verify ownership
        await verify_playbook_ownership(playbook_id, current_user["user_id"], db)
        
        # Create scenario
        scenario = Scenario(
            title=scenario_data.title,
            deal_stage=scenario_data.deal_stage,
            meeting_context=scenario_data.meeting_context,
            customer_pain_points=scenario_data.customer_pain_points,
            competitors=scenario_data.competitors,
            content=ContentSection()
        )
        
        # Add scenario to playbook
        result = await db.playbooks.update_one(
            {"id": playbook_id},
            {
                "$push": {"scenarios": scenario.model_dump()},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to add scenario"
            )
        
        logger.info(f"Added scenario {scenario.id} to playbook {playbook_id}")
        
        return scenario
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding scenario: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add scenario: {str(e)}"
        )


@router.put("/{playbook_id}/scenarios/{scenario_id}", response_model=Scenario)
async def update_scenario(
    playbook_id: str,
    scenario_id: str,
    scenario_update: ScenarioUpdate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Update a scenario within a playbook.
    
    Args:
        playbook_id: Playbook identifier
        scenario_id: Scenario identifier
        scenario_update: Fields to update
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        Updated scenario object
        
    Raises:
        HTTPException: If playbook/scenario not found or user doesn't own it
    """
    try:
        # Verify ownership
        playbook = await verify_playbook_ownership(playbook_id, current_user["user_id"], db)
        
        # Find scenario index
        scenario_index = None
        for i, scenario in enumerate(playbook.get("scenarios", [])):
            if scenario["id"] == scenario_id:
                scenario_index = i
                break
        
        if scenario_index is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Scenario with id {scenario_id} not found in playbook"
            )
        
        # Build update data
        update_data = scenario_update.model_dump(exclude_unset=True)
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # Build update query for nested scenario fields
        update_query = {}
        for key, value in update_data.items():
            if value is not None:
                if isinstance(value, BaseModel):
                    update_query[f"scenarios.{scenario_index}.{key}"] = value.model_dump()
                else:
                    update_query[f"scenarios.{scenario_index}.{key}"] = value
        
        update_query["updated_at"] = datetime.utcnow()
        
        # Update scenario in database
        result = await db.playbooks.update_one(
            {"id": playbook_id},
            {"$set": update_query}
        )
        
        if result.modified_count == 0:
            logger.warning(f"No changes made to scenario {scenario_id}")
        
        # Fetch updated playbook and return scenario
        updated_playbook = await db.playbooks.find_one({"id": playbook_id})
        updated_scenario = updated_playbook["scenarios"][scenario_index]
        
        logger.info(f"Updated scenario {scenario_id} in playbook {playbook_id}")
        
        return Scenario(**updated_scenario)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating scenario: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update scenario: {str(e)}"
        )


@router.delete("/{playbook_id}/scenarios/{scenario_id}", status_code=status.HTTP_200_OK)
async def delete_scenario(
    playbook_id: str,
    scenario_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Delete a scenario from a playbook.
    
    Args:
        playbook_id: Playbook identifier
        scenario_id: Scenario identifier
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If playbook/scenario not found or user doesn't own it
    """
    try:
        # Verify ownership
        await verify_playbook_ownership(playbook_id, current_user["user_id"], db)
        
        # Remove scenario from playbook
        result = await db.playbooks.update_one(
            {"id": playbook_id},
            {
                "$pull": {"scenarios": {"id": scenario_id}},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Scenario with id {scenario_id} not found in playbook"
            )
        
        logger.info(f"Deleted scenario {scenario_id} from playbook {playbook_id}")
        
        return {"message": "Scenario deleted successfully", "scenario_id": scenario_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting scenario: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete scenario: {str(e)}"
        )


@router.post("/generate", response_model=PlaybookResponse, status_code=status.HTTP_201_CREATED)
async def generate_playbook(
    request: GeneratePlaybookRequest,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Generate a playbook with AI-suggested scenarios based on high-level input.
    
    Uses AI to suggest relevant scenarios based on persona, industry, and goals.
    Creates a new playbook with suggested scenarios (empty content).
    
    Args:
        request: Generation request with persona, industry, goals
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        Created playbook with suggested scenarios
    """
    try:
        logger.info(f"Generating playbook for user {current_user['user_id']}")
        
        # Generate playbook structure using OpenAI service
        playbook_data = await openai_service.generate_playbook_structure(
            target_persona=request.target_persona,
            industry=request.industry,
            product_line=request.product_line,
            goals=request.goals
        )
        
        # Create playbook with generated data
        playbook = PlaybookInDB(
            user_id=current_user["user_id"],
            title=playbook_data["title"],
            description=playbook_data.get("description"),
            target_persona=request.target_persona,
            industry=request.industry,
            product_line=request.product_line,
            status=PlaybookStatus.DRAFT,
            is_template=False,
            scenarios=playbook_data.get("scenarios", [])
        )
        
        # Save to database
        playbook_dict = playbook.model_dump()
        result = await db.playbooks.insert_one(playbook_dict)
        
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create generated playbook"
            )
        
        logger.info(f"Generated playbook {playbook.id} with {len(playbook.scenarios)} scenarios")
        
        return PlaybookResponse(**playbook_dict)
        
    except Exception as e:
        logger.error(f"Error generating playbook: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate playbook: {str(e)}"
        )


@router.post("/{playbook_id}/scenarios/{scenario_id}/generate", response_model=ContentSection)
async def generate_scenario_content(
    playbook_id: str,
    scenario_id: str,
    request: GenerateScenarioContentRequest,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Generate detailed content for a specific scenario using RAG.
    
    Uses RAG to retrieve relevant context from knowledge base and generates
    comprehensive scenario content including talk points, objections, etc.
    
    Args:
        playbook_id: Playbook identifier
        scenario_id: Scenario identifier
        request: Generation request with focus areas and context
        current_user: Current authenticated user
        db: Database instance
        
    Returns:
        Generated content section
        
    Raises:
        HTTPException: If playbook/scenario not found or generation fails
    """
    try:
        # Verify ownership and get playbook
        playbook = await verify_playbook_ownership(playbook_id, current_user["user_id"], db)
        
        # Find scenario
        scenario = None
        scenario_index = None
        for i, s in enumerate(playbook.get("scenarios", [])):
            if s["id"] == scenario_id:
                scenario = s
                scenario_index = i
                break
        
        if not scenario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Scenario with id {scenario_id} not found in playbook"
            )
        
        logger.info(f"Generating content for scenario {scenario_id} in playbook {playbook_id}")
        
        # Generate scenario content using OpenAI service with RAG
        content = await openai_service.generate_scenario_content(
            user_id=current_user["user_id"],
            playbook=playbook,
            scenario=scenario,
            focus_areas=request.focus_areas,
            additional_context=request.additional_context,
            db=db
        )
        
        # Update scenario content in database
        update_query = {
            f"scenarios.{scenario_index}.content": content.model_dump(),
            "updated_at": datetime.utcnow()
        }
        
        await db.playbooks.update_one(
            {"id": playbook_id},
            {"$set": update_query}
        )
        
        logger.info(f"Generated and saved content for scenario {scenario_id}")
        
        return content
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating scenario content: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate scenario content: {str(e)}"
        )
