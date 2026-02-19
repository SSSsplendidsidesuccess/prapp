"""
Talk Points API endpoints for generating sales call preparation materials.
Uses RAG to create customer-specific, context-aware talk points.
"""
import logging
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.core.dependencies import get_current_user, get_database
from app.models.user import UserInDB
from app.models.document import (
    TalkPointCreate,
    TalkPointInDB,
    TalkPointResponse
)
from app.services.rag_service import get_rag_service
from app.services.openai_service import openai_service
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/talk-points", tags=["talk-points"])


async def generate_talk_points_with_rag(
    user_id: str,
    customer_name: str,
    customer_persona: str,
    deal_stage: str,
    context: str,
    db
) -> str:
    """
    Generate talk points using RAG and OpenAI.
    
    Args:
        user_id: User ID for RAG query
        customer_name: Target customer name
        customer_persona: Customer persona/role
        deal_stage: Current deal stage
        context: Additional context
        db: Database connection
        
    Returns:
        Generated talk points in Markdown format
    """
    try:
        # Get user's company profile for context
        user = await db.users.find_one({"user_id": user_id})
        company_profile = user.get("company_profile", {}) if user else {}
        
        # Build query for RAG
        query_parts = []
        if customer_persona:
            query_parts.append(f"information relevant for {customer_persona}")
        if deal_stage:
            query_parts.append(f"at {deal_stage} stage")
        if context:
            query_parts.append(context)
        
        query_text = " ".join(query_parts) if query_parts else "product information and key features"
        
        # Query RAG for relevant context
        rag_service = get_rag_service(settings.OPENAI_API_KEY)
        rag_results = await rag_service.query(
            user_id=user_id,
            query_text=query_text,
            top_k=10  # Get more context for talk points
        )
        
        # Build context from RAG results
        retrieved_context = ""
        if rag_results:
            retrieved_context = "\n\n=== PRODUCT/SERVICE INFORMATION ===\n"
            for i, chunk in enumerate(rag_results, 1):
                retrieved_context += f"\n[Source {i}]\n{chunk['text']}\n"
            retrieved_context += "\n=== END INFORMATION ===\n"
            logger.info(f"Retrieved {len(rag_results)} chunks for talk points generation")
        
        # Build prompt for talk points generation
        system_prompt = """You are an expert sales strategist helping a salesperson prepare for an important customer call. Your task is to generate comprehensive, actionable talk points that will help them succeed.

Your talk points should:
1. Be specific and actionable
2. Reference concrete features, benefits, and use cases from the provided information
3. Be tailored to the customer's persona and deal stage
4. Include potential objections and how to handle them
5. Suggest questions to ask the customer
6. Highlight key differentiators and value propositions
7. Be organized in a clear, easy-to-reference format

Format your response as a well-structured Markdown document with clear sections and bullet points."""

        user_prompt = f"""Generate comprehensive talk points for an upcoming sales call.

**Customer Information:**
- Company: {customer_name or 'Not specified'}
- Persona: {customer_persona or 'Not specified'}
- Deal Stage: {deal_stage or 'Not specified'}
- Additional Context: {context or 'None'}

**Your Company/Product:**
"""
        
        if company_profile:
            if company_profile.get('name'):
                user_prompt += f"- Name: {company_profile['name']}\n"
            if company_profile.get('description'):
                user_prompt += f"- Description: {company_profile['description']}\n"
            if company_profile.get('value_proposition'):
                user_prompt += f"- Value Proposition: {company_profile['value_proposition']}\n"
        
        user_prompt += f"\n{retrieved_context}\n"
        
        user_prompt += """
Please generate talk points that include:
1. **Opening Strategy** - How to start the conversation
2. **Key Messages** - Main points to communicate (with specific examples from the information)
3. **Value Propositions** - Why they should choose your solution
4. **Proof Points** - Specific features, capabilities, or benefits to highlight
5. **Questions to Ask** - Discovery questions appropriate for this stage
6. **Objection Handling** - Likely objections and how to address them
7. **Next Steps** - How to advance the deal

Make it specific, actionable, and reference concrete information from the provided context."""

        # Generate talk points using OpenAI
        response = await openai_service.client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        talk_points = response.choices[0].message.content
        
        # Log token usage
        usage = response.usage
        logger.info(
            f"Talk points generated. Tokens used: "
            f"{usage.total_tokens} (prompt: {usage.prompt_tokens}, "
            f"completion: {usage.completion_tokens})"
        )
        
        return talk_points
        
    except Exception as e:
        logger.error(f"Error generating talk points: {e}")
        raise


@router.post("/generate", response_model=TalkPointResponse, status_code=status.HTTP_201_CREATED)
async def generate_talk_points(
    request: TalkPointCreate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Generate AI-powered talk points for a sales call.
    
    Uses RAG to retrieve relevant product/service information and generates
    customized talk points based on customer persona and deal stage.
    """
    try:
        logger.info(f"Generating talk points for user {current_user.user_id}")
        
        # Generate talk points
        generated_content = await generate_talk_points_with_rag(
            user_id=current_user.user_id,
            customer_name=request.customer_name or "",
            customer_persona=request.customer_persona or "",
            deal_stage=request.deal_stage or "",
            context=request.context or "",
            db=db
        )
        
        # Create talk point record
        from uuid import uuid4
        talk_point = TalkPointInDB(
            talk_point_id=str(uuid4()),
            user_id=current_user.user_id,
            customer_name=request.customer_name,
            customer_persona=request.customer_persona,
            deal_stage=request.deal_stage,
            context=request.context,
            generated_content=generated_content
        )
        
        # Save to database
        await db.talk_points.insert_one(talk_point.model_dump())
        
        logger.info(f"Talk points saved with ID {talk_point.talk_point_id}")
        
        return TalkPointResponse(
            talk_point_id=talk_point.talk_point_id,
            customer_name=talk_point.customer_name,
            customer_persona=talk_point.customer_persona,
            deal_stage=talk_point.deal_stage,
            generated_content=talk_point.generated_content,
            created_at=talk_point.created_at
        )
        
    except Exception as e:
        logger.error(f"Error in generate_talk_points endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate talk points: {str(e)}"
        )


@router.get("", response_model=List[TalkPointResponse])
async def list_talk_points(
    limit: int = Query(20, ge=1, le=100, description="Number of talk points to return"),
    offset: int = Query(0, ge=0, description="Number of talk points to skip"),
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    List all talk points generated by the current user.
    
    Returns talk points in reverse chronological order (newest first).
    """
    try:
        # Get talk points for user
        cursor = db.talk_points.find(
            {"user_id": current_user.user_id}
        ).sort("created_at", -1).skip(offset).limit(limit)
        
        talk_points = []
        async for tp in cursor:
            talk_points.append(TalkPointResponse(
                talk_point_id=tp["talk_point_id"],
                customer_name=tp.get("customer_name"),
                customer_persona=tp.get("customer_persona"),
                deal_stage=tp.get("deal_stage"),
                generated_content=tp["generated_content"],
                created_at=tp["created_at"]
            ))
        
        logger.info(f"Retrieved {len(talk_points)} talk points for user {current_user.user_id}")
        
        return talk_points
        
    except Exception as e:
        logger.error(f"Error listing talk points: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list talk points"
        )


@router.get("/{talk_point_id}", response_model=TalkPointResponse)
async def get_talk_point(
    talk_point_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Get a specific talk point by ID.
    """
    try:
        talk_point = await db.talk_points.find_one({
            "talk_point_id": talk_point_id,
            "user_id": current_user.user_id
        })
        
        if not talk_point:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Talk point not found"
            )
        
        return TalkPointResponse(
            talk_point_id=talk_point["talk_point_id"],
            customer_name=talk_point.get("customer_name"),
            customer_persona=talk_point.get("customer_persona"),
            deal_stage=talk_point.get("deal_stage"),
            generated_content=talk_point["generated_content"],
            created_at=talk_point["created_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting talk point: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get talk point"
        )


@router.delete("/{talk_point_id}", status_code=status.HTTP_200_OK)
async def delete_talk_point(
    talk_point_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Delete a talk point.
    """
    try:
        result = await db.talk_points.delete_one({
            "talk_point_id": talk_point_id,
            "user_id": current_user.user_id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Talk point not found"
            )
        
        logger.info(f"Deleted talk point {talk_point_id}")
        
        return {"message": "Talk point deleted successfully", "talk_point_id": talk_point_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting talk point: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete talk point"
        )
