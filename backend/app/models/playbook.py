"""
Playbook models for Sales Playbook Builder feature.
Handles playbook structure, scenarios, and content sections.
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import uuid4
from enum import Enum


class PlaybookStatus(str, Enum):
    """Enum for playbook status values."""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class DealStage(str, Enum):
    """Enum for B2B sales lifecycle stages."""
    PROSPECTING = "Prospecting"
    DISCOVERY = "Discovery"
    QUALIFICATION = "Qualification"
    PROPOSAL = "Proposal"
    NEGOTIATION = "Negotiation"
    CLOSING = "Closing"
    FOLLOW_UP = "Follow-up"


class ObjectionResponse(BaseModel):
    """Model for objection handling responses."""
    objection: str = Field(..., description="The potential objection from the customer")
    response: str = Field(..., description="Suggested response or handling strategy")
    
    class Config:
        json_schema_extra = {
            "example": {
                "objection": "Your solution is too expensive",
                "response": "Let's discuss the ROI and total cost of ownership over time..."
            }
        }


class CompetitiveBattleCard(BaseModel):
    """Model for competitive battle cards."""
    competitor_name: str = Field(..., description="Name of the competitor")
    our_advantage: str = Field(..., description="Our key advantage over this competitor")
    their_weakness: str = Field(..., description="Their weakness or limitation")
    key_differentiator: str = Field(..., description="Key differentiator to emphasize")
    
    class Config:
        json_schema_extra = {
            "example": {
                "competitor_name": "Competitor X",
                "our_advantage": "Better integration capabilities",
                "their_weakness": "Limited API support",
                "key_differentiator": "Native integrations with 100+ platforms"
            }
        }


class ContentSection(BaseModel):
    """Model for scenario content sections."""
    opening_strategy: Optional[str] = Field(None, description="How to start the conversation")
    key_messages: List[str] = Field(default_factory=list, description="Main points to communicate")
    value_propositions: List[str] = Field(default_factory=list, description="Why choose us")
    proof_points: List[str] = Field(default_factory=list, description="Evidence/Case studies")
    discovery_questions: List[str] = Field(default_factory=list, description="Questions to ask")
    objection_handling: List[ObjectionResponse] = Field(default_factory=list, description="Objection responses")
    competitive_battle_cards: List[CompetitiveBattleCard] = Field(default_factory=list, description="Competitive positioning")
    next_steps: List[str] = Field(default_factory=list, description="How to advance the deal")
    
    class Config:
        json_schema_extra = {
            "example": {
                "opening_strategy": "Start with a warm introduction and reference previous conversation",
                "key_messages": ["We reduce costs by 40%", "Implementation takes 2 weeks"],
                "value_propositions": ["Fastest time to value", "Best-in-class support"],
                "proof_points": ["Case study: Acme Corp saved $500K", "99.9% uptime SLA"],
                "discovery_questions": ["What are your current pain points?", "What's your timeline?"],
                "objection_handling": [],
                "competitive_battle_cards": [],
                "next_steps": ["Schedule technical demo", "Share pricing proposal"]
            }
        }


class Scenario(BaseModel):
    """Model for a scenario within a playbook."""
    id: str = Field(default_factory=lambda: str(uuid4()), description="Unique scenario identifier")
    title: str = Field(..., description="Scenario name (e.g., 'Discovery Call')")
    deal_stage: DealStage = Field(..., description="Deal stage this scenario applies to")
    meeting_context: Optional[str] = Field(None, description="Context of the meeting")
    customer_pain_points: List[str] = Field(default_factory=list, description="Customer pain points to address")
    competitors: List[str] = Field(default_factory=list, description="Competitors to address")
    content: ContentSection = Field(default_factory=ContentSection, description="Scenario content")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "Discovery Call",
                "deal_stage": "Discovery",
                "meeting_context": "Initial call to understand customer needs",
                "customer_pain_points": ["Manual processes", "High costs"],
                "competitors": ["Competitor A", "Competitor B"],
                "content": {}
            }
        }


class ScenarioCreate(BaseModel):
    """Schema for creating a new scenario."""
    title: str = Field(..., min_length=1, max_length=200, description="Scenario name")
    deal_stage: DealStage = Field(..., description="Deal stage")
    meeting_context: Optional[str] = Field(None, description="Meeting context")
    customer_pain_points: List[str] = Field(default_factory=list, description="Customer pain points")
    competitors: List[str] = Field(default_factory=list, description="Competitors")
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Discovery Call",
                "deal_stage": "Discovery",
                "meeting_context": "Initial call to understand customer needs",
                "customer_pain_points": ["Manual processes"],
                "competitors": ["Competitor A"]
            }
        }


class ScenarioUpdate(BaseModel):
    """Schema for updating a scenario."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    deal_stage: Optional[DealStage] = None
    meeting_context: Optional[str] = None
    customer_pain_points: Optional[List[str]] = None
    competitors: Optional[List[str]] = None
    content: Optional[ContentSection] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Updated Discovery Call",
                "meeting_context": "Updated context"
            }
        }


class PlaybookCreate(BaseModel):
    """Schema for creating a new playbook."""
    title: str = Field(..., min_length=1, max_length=200, description="Playbook title")
    description: Optional[str] = Field(None, description="Playbook description")
    target_persona: Optional[str] = Field(None, description="Target customer persona")
    industry: Optional[str] = Field(None, description="Target industry")
    product_line: Optional[str] = Field(None, description="Product line")
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Enterprise SaaS Sales Playbook",
                "description": "Comprehensive playbook for selling to enterprise customers",
                "target_persona": "CTO",
                "industry": "SaaS",
                "product_line": "Enterprise Security"
            }
        }


class PlaybookUpdate(BaseModel):
    """Schema for updating a playbook."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    target_persona: Optional[str] = None
    industry: Optional[str] = None
    product_line: Optional[str] = None
    status: Optional[PlaybookStatus] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Updated Playbook Title",
                "status": "published"
            }
        }


class PlaybookInDB(BaseModel):
    """Schema for playbook stored in MongoDB."""
    id: str = Field(default_factory=lambda: str(uuid4()), description="Unique playbook identifier")
    user_id: str = Field(..., description="ID of the user who owns this playbook")
    title: str = Field(..., description="Playbook title")
    description: Optional[str] = Field(None, description="Playbook description")
    target_persona: Optional[str] = Field(None, description="Target customer persona")
    industry: Optional[str] = Field(None, description="Target industry")
    product_line: Optional[str] = Field(None, description="Product line")
    status: PlaybookStatus = Field(default=PlaybookStatus.DRAFT, description="Playbook status")
    is_template: bool = Field(default=False, description="Whether this is a template")
    scenarios: List[Scenario] = Field(default_factory=list, description="List of scenarios")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "660e8400-e29b-41d4-a716-446655440001",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "Enterprise SaaS Sales Playbook",
                "description": "Comprehensive playbook for enterprise sales",
                "target_persona": "CTO",
                "industry": "SaaS",
                "product_line": "Enterprise Security",
                "status": "draft",
                "is_template": False,
                "scenarios": [],
                "created_at": "2026-02-20T20:00:00Z",
                "updated_at": "2026-02-20T20:00:00Z"
            }
        }


class PlaybookResponse(BaseModel):
    """Schema for playbook API response."""
    id: str
    user_id: str
    title: str
    description: Optional[str]
    target_persona: Optional[str]
    industry: Optional[str]
    product_line: Optional[str]
    status: PlaybookStatus
    is_template: bool
    scenarios: List[Scenario]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "660e8400-e29b-41d4-a716-446655440001",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "Enterprise SaaS Sales Playbook",
                "description": "Comprehensive playbook",
                "target_persona": "CTO",
                "industry": "SaaS",
                "product_line": "Enterprise Security",
                "status": "draft",
                "is_template": False,
                "scenarios": [],
                "created_at": "2026-02-20T20:00:00Z",
                "updated_at": "2026-02-20T20:00:00Z"
            }
        }


class PlaybookListResponse(BaseModel):
    """Schema for paginated playbook list response."""
    playbooks: List[PlaybookResponse]
    total: int
    limit: int
    offset: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "playbooks": [],
                "total": 0,
                "limit": 20,
                "offset": 0
            }
        }


class GeneratePlaybookRequest(BaseModel):
    """Schema for AI playbook generation request."""
    target_persona: Optional[str] = Field(None, description="Target customer persona")
    industry: Optional[str] = Field(None, description="Target industry")
    product_line: Optional[str] = Field(None, description="Product line")
    goals: List[str] = Field(default_factory=list, description="Business goals")
    
    class Config:
        json_schema_extra = {
            "example": {
                "target_persona": "CTO",
                "industry": "SaaS",
                "product_line": "Enterprise Security",
                "goals": ["Increase adoption", "Upsell premium features"]
            }
        }


class GenerateScenarioContentRequest(BaseModel):
    """Schema for AI scenario content generation request."""
    focus_areas: List[str] = Field(default_factory=list, description="Areas to focus on")
    additional_context: Optional[str] = Field(None, description="Additional context for generation")
    
    class Config:
        json_schema_extra = {
            "example": {
                "focus_areas": ["Pricing objections", "Technical integration"],
                "additional_context": "Customer is worried about implementation time"
            }
        }
