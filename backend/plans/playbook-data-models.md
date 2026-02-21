# Playbook Data Models

## Backend Models (Python/Pydantic)

```python
from enum import Enum
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from uuid import uuid4

class PlaybookStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class DealStage(str, Enum):
    PROSPECTING = "Prospecting"
    DISCOVERY = "Discovery"
    QUALIFICATION = "Qualification"
    PROPOSAL = "Proposal"
    NEGOTIATION = "Negotiation"
    CLOSING = "Closing"
    FOLLOW_UP = "Follow-up"

class ObjectionResponse(BaseModel):
    objection: str = Field(..., description="The potential objection from the customer")
    response: str = Field(..., description="suggested response or handling strategy")

class CompetitiveBattleCard(BaseModel):
    competitor_name: str
    our_advantage: str
    their_weakness: str
    key_differentiator: str

class ContentSection(BaseModel):
    opening_strategy: Optional[str] = Field(None, description="How to start the conversation")
    key_messages: List[str] = Field(default_factory=list, description="Main points to communicate")
    value_propositions: List[str] = Field(default_factory=list, description="Why choose us")
    proof_points: List[str] = Field(default_factory=list, description="Evidence/Case studies")
    discovery_questions: List[str] = Field(default_factory=list, description="Questions to ask")
    objection_handling: List[ObjectionResponse] = Field(default_factory=list)
    competitive_battle_cards: List[CompetitiveBattleCard] = Field(default_factory=list)
    next_steps: List[str] = Field(default_factory=list)

class Scenario(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    title: str = Field(..., description="Scenario Name e.g. 'Discovery Call'")
    deal_stage: DealStage
    meeting_context: Optional[str] = Field(None, description="Context of the meeting")
    customer_pain_points: List[str] = Field(default_factory=list)
    competitors: List[str] = Field(default_factory=list, description="Competitors to address")
    content: ContentSection = Field(default_factory=ContentSection)

class PlaybookCreate(BaseModel):
    title: str
    description: Optional[str] = None
    target_persona: Optional[str] = None
    industry: Optional[str] = None
    product_line: Optional[str] = None

class PlaybookUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_persona: Optional[str] = None
    industry: Optional[str] = None
    product_line: Optional[str] = None
    status: Optional[PlaybookStatus] = None

class PlaybookInDB(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str
    title: str
    description: Optional[str]
    target_persona: Optional[str]
    industry: Optional[str]
    product_line: Optional[str]
    status: PlaybookStatus = PlaybookStatus.DRAFT
    is_template: bool = False
    scenarios: List[Scenario] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class PlaybookResponse(PlaybookInDB):
    pass
```

## Frontend Types (TypeScript)

```typescript
export enum PlaybookStatus {
  Draft = "draft",
  Published = "published",
  Archived = "archived"
}

export enum DealStage {
  Prospecting = "Prospecting",
  Discovery = "Discovery",
  Qualification = "Qualification",
  Proposal = "Proposal",
  Negotiation = "Negotiation",
  Closing = "Closing",
  FollowUp = "Follow-up"
}

export interface ObjectionResponse {
  objection: string;
  response: string;
}

export interface CompetitiveBattleCard {
  competitor_name: string;
  our_advantage: string;
  their_weakness: string;
  key_differentiator: string;
}

export interface ContentSection {
  opening_strategy?: string;
  key_messages: string[];
  value_propositions: string[];
  proof_points: string[];
  discovery_questions: string[];
  objection_handling: ObjectionResponse[];
  competitive_battle_cards: CompetitiveBattleCard[];
  next_steps: string[];
}

export interface Scenario {
  id: string;
  title: string;
  deal_stage: DealStage;
  meeting_context?: string;
  customer_pain_points: string[];
  competitors: string[];
  content: ContentSection;
}

export interface Playbook {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_persona?: string;
  industry?: string;
  product_line?: string;
  status: PlaybookStatus;
  is_template: boolean;
  scenarios: Scenario[];
  created_at: string;
  updated_at: string;
}

export type PlaybookCreate = Pick<Playbook, 'title' | 'description' | 'target_persona' | 'industry' | 'product_line'>;
export type PlaybookUpdate = Partial<PlaybookCreate> & { status?: PlaybookStatus };
```
