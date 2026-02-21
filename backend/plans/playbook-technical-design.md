# Technical Design Document: Playbook Builder Feature

## 1. Executive Summary
The Playbook Builder is a strategic feature designed to help sales teams create, organize, and share comprehensive sales playbooks. It moves beyond tactical, one-off call preparation (`/talk-points`) to create reusable assets that guide sales strategy across multiple scenarios. This document outlines the technical architecture, data models, API design, and implementation plan for the feature.

## 2. Architecture Overview

### High-Level Architecture
The feature follows a standard client-server architecture with AI augmentation.

```mermaid
graph TD
    Client[Frontend (Next.js)] --> API[Backend API (FastAPI)]
    API --> DB[(MongoDB)]
    API --> AIService[AI Service Layer]
    AIService --> RAG[RAG Engine]
    AIService --> OpenAI[OpenAI API]
    RAG --> VectorDB[(Vector Store)]
```

### Key Components
-   **Frontend**: A React-based interface for managing and editing playbooks.
-   **Backend API**: RESTful endpoints for CRUD operations and AI generation triggers.
-   **AI Service Layer**: Orchestrates the generation of playbook structure and content using RAG context.
-   **Database**: MongoDB for storing playbook documents.

## 3. Data Models

### Backend Models (Python/Pydantic)
The core entities are `Playbook`, `Scenario`, and `ContentSection`.

```python
# See plans/playbook-data-models.md for full code
class Playbook(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str]
    target_persona: Optional[str]
    industry: Optional[str]
    product_line: Optional[str]
    status: PlaybookStatus
    scenarios: List[Scenario]
    created_at: datetime
    updated_at: datetime

class Scenario(BaseModel):
    id: str
    title: str
    deal_stage: DealStage
    meeting_context: Optional[str]
    customer_pain_points: List[str]
    competitors: List[str]
    content: ContentSection

class ContentSection(BaseModel):
    opening_strategy: Optional[str]
    key_messages: List[str]
    value_propositions: List[str]
    proof_points: List[str]
    discovery_questions: List[str]
    objection_handling: List[ObjectionResponse]
    competitive_battle_cards: List[CompetitiveBattleCard]
    next_steps: List[str]
```

## 4. API Specification

### Base URL: `/api/v1/playbooks`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List all playbooks (paginated) |
| POST | `/` | Create a new playbook |
| GET | `/{id}` | Get detailed playbook |
| PUT | `/{id}` | Update playbook metadata |
| DELETE | `/{id}` | Delete playbook |
| POST | `/{id}/scenarios` | Add a scenario |
| PUT | `/{id}/scenarios/{sid}` | Update a scenario |
| DELETE | `/{id}/scenarios/{sid}` | Remove a scenario |
| POST | `/generate-structure` | Generate playbook outline |
| POST | `/{id}/scenarios/{sid}/generate` | Generate scenario content using RAG |

## 5. User Interface Design

### User Journey
1.  **Dashboard**: User views library of playbooks.
2.  **Creation Wizard**: User inputs high-level goals (Persona, Industry). AI suggests Scenarios.
3.  **Builder Interface**: 
    -   **Navigation Tree**: Playbook > Scenarios > Sections.
    -   **Editor Pane**: Form-based editing for each section.
    -   **AI Assistant**: "Generate" buttons for sections.
4.  **Export**: User exports completed playbook as PDF.

### Key Components
-   `PlaybookLibrary`: Grid/List view.
-   `PlaybookWizard`: Multi-step form for initialization.
-   `ScenarioEditor`: Complex form managing the `ContentSection` fields.
-   `ContentBlock`: Reusable editor for specific content types (List, Text, Key-Value).

## 6. AI & RAG Strategy

### Generation Logic
The generation process is two-staged:
1.  **Structure Generation**: Uses high-level metadata (Persona, Industry) to suggest relevant Scenarios (e.g., "Discovery", "Negotiation").
    -   *No RAG required usually, just broad LLM knowledge.*
2.  **Content Generation**: Generates specific advice within a Scenario.
    -   *RAG is critical here.*
    -   **Context**: Playbook Metadata + Scenario Details + User Documents.
    -   **Process**: Retrieve relevant chunks -> Construct Prompt -> Generate JSON.

### Prompt Engineering
We enforce strict JSON output schemas to ensure the generated content maps directly to our `ContentSection` model, allowing for easy editing on the frontend.

## 7. Implementation Plan

### Phase 1: Foundation (Backend)
-   Create `Playbook` and `Scenario` Pydantic models.
-   Implement MongoDB collection and CRUD API endpoints.
-   Unit tests for data persistence.

### Phase 2: AI Services
-   Implement `PlaybookService` for orchestration.
-   Implement `generate_structure` using OpenAI.
-   Implement `generate_scenario_content` integrating `RagService`.

### Phase 3: Frontend - Core
-   Build `Playbook` type definitions.
-   Create `/playbooks` library page.
-   Create `/playbooks/new` wizard.

### Phase 4: Frontend - Builder
-   Build `/playbooks/[id]` editor page.
-   Implement `ScenarioEditor` components.
-   Connect "Generate" buttons to backend endpoints.

### Phase 5: Polish
-   Add loading states and error handling.
-   Implement PDF export.
-   UI refinement.
