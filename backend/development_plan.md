# Project Blueprint: Sales Call Prep App (Pivot from Interview OS)

## 1. Executive Summary & Architecture
This project involves pivoting an existing Interview Prep application into a **Sales Call Preparation Platform**. The core value proposition is to provide sales professionals with a safe, AI-driven environment to practice pitches, handle objections, and generate strategic talking points using their own product knowledge (RAG).

### 1.1 Architectural Decisions
*   **Pattern:** Modular Monolith. The existing codebase is already structured this way (`app/api`, `app/services`, `app/models`). We will extend this pattern.
*   **Frontend:** Next.js (React) with Tailwind CSS and `shadcn/ui`.
*   **Backend:** Python FastAPI.
*   **Database:** MongoDB Atlas (NoSQL).
*   **AI/LLM:** OpenAI GPT-4o (via existing `OpenAIService`).
*   **Vector Search (RAG):** **ChromaDB** (Local/Server-side) or **MongoDB Atlas Vector Search** (if cluster supports it). For the MVP local development plan, we will use **ChromaDB** as it is lightweight, free, and easy to integrate into a Python environment without external service dependencies.

### 1.2 Technology Stack
*   **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui, Lucide React (icons).
*   **Backend:** Python 3.10+, FastAPI, Uvicorn, Pydantic.
*   **Database:** MongoDB (Motor async driver).
*   **Auth:** JWT (JSON Web Tokens) - Reuse existing `auth.py`.
*   **AI Processing:** OpenAI API (`gpt-4o`), `langchain` or raw OpenAI embeddings for RAG.
*   **File Handling:** `python-multipart` for uploads, local file storage (dev) / S3 (prod - deferred).

---

## 2. Module Architecture & Schema Updates

### 2.1 Core Modules
1.  **Users (Existing):** Manages authentication and profiles.
2.  **Documents (New):** Manages Knowledge Base file uploads, text extraction, and vector indexing.
3.  **Sessions (Enhanced):** Manages chat sessions.
    *   *Update:* Needs to support "Deal Stage", "Customer Context", and RAG retrieval.
4.  **TalkPoints (New):** Manages generation of cheat sheets.

### 2.2 Database Schema (MongoDB Collections)

#### `users` (Existing - No Major Changes)
*   `_id`: ObjectId
*   `email`: String
*   `hashed_password`: String
*   `company_profile`: Object (New)
    *   `name`: String
    *   `description`: String
    *   `value_proposition`: String

#### `documents` (New)
*   `_id`: ObjectId
*   `user_id`: ObjectId (Ref: users)
*   `filename`: String
*   `file_path`: String (Local path or S3 URL)
*   `content_type`: String (pdf, txt, etc.)
*   `status`: String ("processing", "indexed", "error")
*   `upload_date`: DateTime
*   `metadata`: Object (file size, page count)

#### `sessions` (Update)
*   `_id`: ObjectId
*   `user_id`: ObjectId
*   `type`: String ("Sales") - *Reuse `PreparationType`*
*   `config`: Object
    *   `customer_name`: String
    *   `customer_persona`: String (e.g., "Skeptical CFO")
    *   `deal_stage`: String ("Discovery", "Negotiation", etc.)
*   `transcript`: Array of Objects
    *   `role`: "user" | "ai"
    *   `content`: String
    *   `timestamp`: DateTime
    *   `retrieved_context_ids`: Array[ObjectId] (Ref: documents - *New for RAG tracing*)
*   `feedback`: Object
    *   `rating`: Integer (1-5)
    *   `strengths`: Array[String]
    *   `weaknesses`: Array[String]
    *   `suggestion`: String

#### `talk_points` (New)
*   `_id`: ObjectId
*   `user_id`: ObjectId
*   `target_audience`: String
*   `context`: String
*   `generated_content`: String (Markdown)
*   `created_at`: DateTime

---

## 3. API Interface Strategy (REST)

### 3.1 Knowledge Base API (`/api/v1/documents`)
*   `POST /upload`: Upload a file (PDF/TXT), extract text, and trigger indexing.
*   `GET /`: List all documents for the current user.
*   `DELETE /{doc_id}`: Delete a document and its embeddings.

### 3.2 Sales Session API (`/api/v1/sessions` - extending existing)
*   `POST /`: Create a new session with `deal_stage`, `customer_context`.
*   `POST /{session_id}/message`: Send a message. *Logic update:*
    1.  Convert message to vector.
    2.  Query `documents` vector store.
    3.  Inject top-k chunks into system prompt.
    4.  Generate AI response.
*   `POST /{session_id}/end`: End session and trigger feedback generation.

### 3.3 Talk Points API (`/api/v1/talk-points`)
*   `POST /generate`: Input context -> RAG Retrieval -> LLM Generation -> Return Markdown.
*   `GET /`: History of generated cheat sheets.

---

## 4. Sprint-by-Sprint Implementation Plan

### Backend Sprints (✅ COMPLETED)

### Sprint S0: Environment & Pivot Setup ✅
**Goal:** Clean up the existing codebase to focus on the new "Sales" domain and set up the RAG foundation.
**Status:** ✅ Completed - See `SPRINT_0_SUMMARY.md`

*   **Task 0.1: Clean & Refactor Models** ✅
    *   Updated `app/models/session.py`:
        *   Added `DealStage` enum with 7 sales stages
        *   Modified `SessionSetup` to include `deal_stage`, `customer_name`, and `customer_persona`
        *   Added `retrieved_context_ids` to `ChatMessage` for RAG tracking
    *   Updated `app/models/user.py`:
        *   Added `CompanyProfile` model with name, description, value_proposition, industry
        *   Added `company_profile` field to user models

*   **Task 0.2: RAG Dependencies & Setup** ✅
    *   Installed `langchain`, `chromadb`, `pypdf`, `python-docx`, `python-pptx`, `unstructured`
    *   Created `app/services/rag_service.py`:
        *   Implemented ChromaDB integration with OpenAI embeddings
        *   Implemented `add_document()`, `query()`, `delete_document()`, `get_document_count()`
        *   Multi-tenant architecture with user-specific collections
    *   Created `app/models/document.py` with complete document schemas

*   **Task 0.3: Dependencies Installation** ✅
    *   Updated `requirements.txt` with all RAG dependencies
    *   Installed and tested all packages successfully

### Sprint S1: Knowledge Base (RAG Core) ✅
**Goal:** Allow users to upload documents that the AI can "read" and use.
**Status:** ✅ Completed - See `SPRINT_1_SUMMARY.md`

*   **Task 1.1: Document Upload Backend** ✅
    *   Created `app/services/document_processor.py`:
        *   Text extraction for PDF, DOCX, PPTX, TXT formats
        *   Metadata extraction (page count, paragraph count, slide count)
    *   Implemented `POST /api/v1/documents/upload` endpoint with background processing
    *   Implemented file saving logic (local `uploads/` folder)

*   **Task 1.2: Vector Indexing** ✅
    *   Connected upload endpoint to `rag_service`
    *   Implemented background task for text extraction and chunking
    *   Store embeddings in ChromaDB with metadata

*   **Task 1.3: Document Management API** ✅
    *   Implemented `GET /api/v1/documents` (list with pagination)
    *   Implemented `GET /api/v1/documents/{id}` (get single document)
    *   Implemented `DELETE /api/v1/documents/{id}` (delete with cleanup)
    *   Registered documents router in `app/main.py`

### Sprint S2: AI Sales Simulation with RAG ✅
**Goal:** The core chat experience where the AI acts as a customer using the Knowledge Base.
**Status:** ✅ Completed - See `SPRINT_2_SUMMARY.md`

*   **Task 2.1: Session Configuration Backend** ✅
    *   Updated `POST /api/v1/sessions` to accept sales-specific fields
    *   Store `customer_name`, `customer_persona`, `deal_stage` in session context

*   **Task 2.2: RAG-Enhanced Chat Logic** ✅
    *   Updated `OpenAIService.generate_session_response()`:
        *   Added `retrieved_context` parameter
        *   Rewrote Sales system prompt for customer simulation
        *   Enhanced prompt construction with RAG context injection
    *   Updated `POST /api/v1/sessions/{id}/messages`:
        *   Integrated RAG service query (top 5 chunks)
        *   Pass retrieved context to OpenAI service
        *   Track `retrieved_context_ids` in AI messages

*   **Task 2.3: Context Tracking** ✅
    *   Implemented RAG context tracking in message history
    *   Store document IDs used for each AI response

### Sprint S3: Feedback & Talk Points ✅
**Goal:** Provide value *after* or *before* the call.
**Status:** ✅ Completed - See `SPRINT_3_SUMMARY.md`

*   **Task 3.1: Talk Points Generator** ✅
    *   Created `app/api/talk_points.py` with 4 endpoints:
        *   `POST /api/v1/talk-points/generate` - RAG-powered generation
        *   `GET /api/v1/talk-points` - List with pagination
        *   `GET /api/v1/talk-points/{id}` - Get single talk point
        *   `DELETE /api/v1/talk-points/{id}` - Delete talk point
    *   Implemented RAG-powered generation (retrieves top 10 chunks)
    *   7-section format: Opening Hook, Problem Statement, Solution Overview, Key Benefits, Proof Points, Objection Handling, Call to Action
    *   Registered talk points router in `app/main.py`

*   **Task 3.2: Enhanced Session Feedback** ✅
    *   Updated `OpenAIService` evaluation system:
        *   Added 6 sales-specific dimensions: product_knowledge, customer_understanding, objection_handling, value_communication, question_quality, confidence_delivery
        *   Added sales_specific assessment: knowledge_base_usage, stage_appropriateness, personalization
        *   Enhanced evaluation prompt with sales criteria and deal stage context

**Backend Summary:**
- ✅ 34 API endpoints operational
- ✅ Complete RAG pipeline implemented
- ✅ Sales-specific evaluation system
- ✅ Multi-tenant architecture
- ✅ All sprints tested and documented

---

### Frontend Sprints (📋 PLANNED)

### Sprint F1: Core Sales Features (Week 1)
**Goal:** Update existing pages with sales-specific functionality
**Status:** 📋 Planned - See `FRONTEND_INTEGRATION_PLAN.md`

*   **Task F1.1: Profile Page - Sales Session Setup**
    *   Update `app/profile/page.tsx`:
        *   Add sales-specific fields: `customer_name`, `customer_persona`, `deal_stage`
        *   Conditional rendering when `preparation_type === "Sales"`
        *   Update `handleStartSession()` to include sales fields in payload
    *   Create `SalesSessionSetup.tsx` component

*   **Task F1.2: Profile Page - Company Profile**
    *   Add Company Profile section to `app/profile/page.tsx`
    *   Create `CompanyProfileForm.tsx` component
    *   Integrate with `PATCH /api/v1/users/profile` endpoint
    *   4 fields: name, description, value_proposition, industry

*   **Task F1.3: Session Page - RAG Context Display**
    *   Update `app/session/[id]/page.tsx`:
        *   Display `retrieved_context_ids` in AI messages
        *   Add "View sources" button for messages with RAG context
    *   Create `ContextSourcesModal.tsx` component
    *   Fetch document details via `GET /api/v1/documents/{id}`

*   **Task F1.4: Session Page - Sales Context Banner**
    *   Add session context display at top of chat
    *   Show: customer_name, deal_stage, document count, customer_persona
    *   Only display for Sales sessions

*   **Task F1.5: API Service Modules**
    *   Create `lib/api/documents.ts` (upload, list, get, delete)
    *   Create `lib/api/talkPoints.ts` (generate, list, get, delete)
    *   Update `lib/api/sessions.ts` (add sales fields)
    *   Update `lib/api/users.ts` (add company profile)

*   **Task F1.6: TypeScript Type Definitions**
    *   Create `types/sales.ts` (DealStage, CompanyProfile, SalesSessionSetup, SalesEvaluation)
    *   Create `types/documents.ts` (Document, DocumentStatus, DocumentListResponse)
    *   Create `types/talkPoints.ts` (TalkPoint, TalkPointListResponse)

### Sprint F2: Knowledge Base & Talk Points (Week 2)
**Goal:** Create new pages for document management and talk points generation
**Status:** 📋 Planned - See `FRONTEND_INTEGRATION_PLAN.md`

*   **Task F2.1: Knowledge Base Page**
    *   Create `app/knowledge-base/page.tsx` (~600 lines)
    *   Implement document upload with drag-and-drop
    *   Implement document list with pagination (20 per page)
    *   Implement document viewer modal
    *   Support: PDF, DOCX, PPTX, TXT files
    *   Empty state with CTA

*   **Task F2.2: Knowledge Base Components**
    *   Create `DocumentUploadZone.tsx` - Drag-and-drop upload
    *   Create `DocumentTable.tsx` - List view with actions
    *   Create `DocumentViewerModal.tsx` - Document details
    *   Create `DocumentStatusBadge.tsx` - Status indicator (Processing/Indexed/Failed)
    *   Create `DeleteConfirmationModal.tsx` - Delete confirmation

*   **Task F2.3: Talk Points Page**
    *   Create `app/talk-points/page.tsx` (~500 lines)
    *   Implement talk points generator form
    *   Implement 7-section display format
    *   Implement talk points history with pagination (10 per page)
    *   Empty state with CTA

*   **Task F2.4: Talk Points Components**
    *   Create `TalkPointsGenerator.tsx` - Input form
    *   Create `TalkPointsDisplay.tsx` - 7-section display with copy buttons
    *   Create `TalkPointsCard.tsx` - History card view
    *   Create `TalkPointsExporter.tsx` - Export functionality (PDF/DOCX)

*   **Task F2.5: Profile Page - Quick Access Sections**
    *   Add Knowledge Base section to `app/profile/page.tsx`
    *   Add Talk Points section to `app/profile/page.tsx`
    *   Display last 3 documents and talk points
    *   Quick action buttons

### Sprint F3: Enhanced Evaluation & Polish (Week 3)
**Goal:** Complete sales-specific evaluation display and polish UI/UX
**Status:** 📋 Planned - See `FRONTEND_INTEGRATION_PLAN.md`

*   **Task F3.1: Session Page - Sales Evaluation Display**
    *   Update evaluation section in `app/session/[id]/page.tsx`
    *   Create `SalesEvaluationDisplay.tsx` component
    *   Display 6 dimension scores as progress bars
    *   Display sales-specific insights (3 sections)
    *   Use amber color scheme for sales metrics

*   **Task F3.2: Navigation Updates**
    *   Update navigation menu with new items:
        *   "Knowledge Base" → `/knowledge-base`
        *   "Talk Points" → `/talk-points`
    *   Update mobile menu
    *   Add icons (Book, Lightbulb)

*   **Task F3.3: Error Handling & Loading States**
    *   Implement toast notifications for success/error
    *   Add loading skeletons for all async operations
    *   Add confirmation dialogs for destructive actions
    *   Implement retry logic for failed requests

*   **Task F3.4: Mobile Responsiveness**
    *   Test all pages on mobile breakpoints
    *   Implement bottom sheet modals for mobile
    *   Ensure touch-friendly button sizes (min 44px)
    *   Stack form fields vertically on mobile

*   **Task F3.5: Accessibility**
    *   Add ARIA labels for icon buttons
    *   Ensure keyboard navigation works
    *   Add focus indicators
    *   Test with screen reader
    *   Add alt text for images/icons

*   **Task F3.6: Performance Optimization**
    *   Implement code splitting for new pages
    *   Add SWR or React Query for data caching
    *   Implement pagination for all lists
    *   Debounce search inputs
    *   Show upload progress indicators

*   **Task F3.7: Testing & Documentation**
    *   Test all new features end-to-end
    *   Test error scenarios
    *   Update README with new features
    *   Create user guide for sales features
    *   Document API integration points

**Frontend Summary:**
- 📋 2 existing pages to update (Profile, Session)
- 📋 2 new pages to create (Knowledge Base, Talk Points)
- 📋 6 new components to build
- 📋 4 API service modules to create
- 📋 Estimated: 82 hours (~3 weeks with 1 developer)

---

## 5. Technical Risks & Mitigation
1.  **RAG Quality:** The AI might hallucinate or miss context.
    *   *Mitigation:* Use strict system prompts ("Only use provided context"). Implement "Sources" citation in the UI (show which document snippet was used).
2.  **Latency:** RAG + GPT-4 can be slow (5s+).
    *   *Mitigation:* Use optimistic UI updates. Implement streaming responses (Server-Sent Events) in a future sprint (Deferred).
3.  **File Parsing:** PDFs are notoriously hard to parse perfectly.
    *   *Mitigation:* Stick to text extraction libraries that are robust (like `pypdf` or `unstructured`). Warn users if a file is unreadable.

## 6. Migration / Pivot Strategy
Since this is a pivot from an existing app:
1.  **Database:** We will create *new* collections (`documents`, `talk_points`) rather than forcing old data into new shapes. Old `sessions` can remain but might be incompatible with the new UI.
2.  **Codebase:** We will keep the `auth` module as-is. We will heavily refactor `sessions.py` service logic but keep the API routing structure.
