# Product Requirements Document: Sales Call Prep App

## Executive Summary

*   **Product Vision:** Empower sales professionals to close more deals by providing an AI-driven practice environment that simulates realistic customer interactions and generates strategic talking points.
*   **Core Purpose:** To reduce sales anxiety and improve call outcomes through structured, private practice and instant feedback.
*   **Target Users:** B2B/B2C Sales Professionals who need to master complex product knowledge and handle difficult objections.
*   **Key Features (MVP):**
    *   **Knowledge Base:** Upload product documents (PDF, TXT) to train the AI context.
    *   **AI Mock Sessions:** Text-based roleplay chat with an AI simulating a specific customer persona.
    *   **Talk Point Generator:** AI-generated cheat sheets based on deal context and knowledge base.
    *   **Session Review:** Automated feedback on performance after each mock session.
*   **Complexity Assessment:** Moderate
    *   **State Management:** Local (Session state), Persistent (Chat history).
    *   **External Integrations:** 2 (OpenAI API, Vector Database).
    *   **Business Logic:** Moderate (Prompt engineering for personas, RAG retrieval logic).
*   **MVP Success Metrics:**
    *   Users complete at least 1 full mock session within the first week.
    *   Users rate AI realism > 3/5 stars.
    *   System handles concurrent chat sessions with < 3s latency per message.

---

## 1. Users & Personas

*   **Primary Persona: The Account Executive (Alex)**
    *   **Context:** Juggling 10+ active opportunities; often feels unprepared for specific technical questions or competitive objections.
    *   **Goals:** Close deals, impress prospects, minimize "I'll get back to you on that" moments.
    *   **Needs:** A safe space to practice pitch delivery and objection handling without risking a real prospect.

---

## 2. Functional Requirements (Core MVP)

### 2.1 User-Requested Features (Priority 0)

#### FR-001: Knowledge Base Management
*   **Description:** Users can upload documents that the AI uses as context for answering questions and simulating customers.
*   **Entity Type:** User-Generated Content
*   **User Benefit:** Ensures the AI knows *their* specific product and pricing, making practice relevant.
*   **Lifecycle Operations:**
    *   **Create:** Upload PDF, TXT, DOCX files (Max 10MB per file).
    *   **View:** List uploaded files with status (Indexed/Processing/Error).
    *   **Delete:** Remove file (and its embeddings) from the knowledge base.
    *   **List/Search:** View all uploaded documents.
*   **Acceptance Criteria:**
    *   - [ ] User can upload a valid PDF/TXT file.
    *   - [ ] System extracts text and indexes it for RAG.
    *   - [ ] User sees a success indicator when indexing is complete.
    *   - [ ] User can delete a document, removing it from RAG context.

#### FR-002: Mock Session Configuration
*   **Description:** Users configure the scenario before starting a practice chat.
*   **Entity Type:** Session Configuration
*   **User Benefit:** Tailors the practice to the specific deal stage and customer type they are facing.
*   **Lifecycle Operations:**
    *   **Create:** Start a new session by defining:
        *   **Customer Name/Industry**
        *   **Deal Stage:** (Discovery, Demo, Negotiation, Closing)
        *   **Persona Tone:** (Skeptical, Enthusiastic, Budget-Conscious)
    *   **View:** See past session configurations.
*   **Acceptance Criteria:**
    *   - [ ] User can select a Deal Stage from a predefined list.
    *   - [ ] User can input free-text Customer Context.
    *   - [ ] System initializes a chat session based on these inputs.

#### FR-003: AI Text Chat Simulation
*   **Description:** A text-based chat interface where the user converses with the AI (acting as the customer).
*   **Entity Type:** Communication/Session
*   **User Benefit:** Provides a realistic, low-pressure environment to practice handling objections and questions.
*   **Lifecycle Operations:**
    *   **Create:** Send a message to the AI.
    *   **View:** See the chat history in real-time.
    *   **Complete:** End the session manually to trigger feedback.
*   **Acceptance Criteria:**
    *   - [ ] AI stays in character based on FR-002 configuration.
    *   - [ ] AI uses Knowledge Base (FR-001) to challenge the user or ask relevant questions.
    *   - [ ] Chat history is preserved for the duration of the session.

#### FR-004: Session Feedback & Review
*   **Description:** After ending a session, the AI analyzes the transcript and provides actionable feedback.
*   **Entity Type:** Evaluation Report
*   **User Benefit:** Provides immediate coaching to improve performance.
*   **Lifecycle Operations:**
    *   **Create:** System generates report automatically on session end.
    *   **View:** User views the report (Rating, Strengths, Weaknesses, Suggested Improvements).
*   **Acceptance Criteria:**
    *   - [ ] Report includes a 1-5 star rating.
    *   - [ ] Report identifies at least 1 strength and 1 weakness.
    *   - [ ] Feedback is saved and associated with the session history.

#### FR-005: Talk Point Generator
*   **Description:** AI generates a "Cheat Sheet" of talking points for a specific meeting scenario.
*   **Entity Type:** Content Generation
*   **User Benefit:** Quick preparation for users who don't have time for a full mock session.
*   **Lifecycle Operations:**
    *   **Create:** specific request based on Context + Knowledge Base.
    *   **View:** Display generated points.
    *   **Save/Copy:** User can copy text to clipboard.
*   **Acceptance Criteria:**
    *   - [ ] Generated points reference specific facts from the Knowledge Base.
    *   - [ ] Output is structured (e.g., "Key Value Props", "Likely Objections", "Discovery Questions").

### 2.2 Essential Market Features

#### FR-006: User Authentication
*   **Description:** Secure email/password signup and login.
*   **Entity Type:** System
*   **Lifecycle Operations:** Register, Login, Logout, Password Reset.

#### FR-007: Company Profile Settings
*   **Description:** A global setting where the user describes their own company/product once, used as a system prompt baseline.
*   **Entity Type:** User Profile
*   **Lifecycle Operations:** Update Company Name, Description, Value Proposition.

---

## 3. User Workflows

### 3.1 Workflow: The "Quick Practice" Loop
1.  **Trigger:** User has a sales call tomorrow with "Acme Corp" (skeptical buyer).
2.  **Setup:**
    *   User ensures latest product FAQ is uploaded to **Knowledge Base**.
    *   User navigates to **New Mock Session**.
    *   Enters context: "Acme Corp, CFO, worried about ROI. Stage: Negotiation."
3.  **Practice:**
    *   User enters Chat Interface.
    *   AI (as Acme CFO): "Your price is 20% higher than competitor X. Why?"
    *   User types response focusing on value.
    *   AI pushes back: "But I need ROI in 6 months."
    *   User responds with data.
    *   User clicks **"End Session"**.
4.  **Feedback:**
    *   System displays **Session Report**.
    *   Feedback: "Good handling of price objection, but you missed mentioning the efficiency gains from the case study."
5.  **Outcome:** User feels prepared for the specific "ROI" objection.

### 3.2 Workflow: "Cheat Sheet" Generation
1.  **Trigger:** User is 5 minutes away from a call.
2.  **Action:**
    *   User clicks **"Generate Talk Points"**.
    *   Selects context: "Intro Call, Healthcare Industry".
3.  **Result:**
    *   System displays list: "3 Key Pain Points in Healthcare", "2 Relevant Case Studies (from KB)", "5 Discovery Questions to Ask".
4.  **Outcome:** User has a structured agenda for the call.

### 3.5 Conversation Simulation (Mock Session)

**Context:** User selling "CloudCRM" to a skeptical IT Director.
*   **AI (IT Director):** "I've seen ten tools like this. We're happy with our spreadsheets. Why should I disrupt my team for this?"
*   **User:** "Spreadsheets are great for starting out, but they don't scale. Don't you worry about data integrity as you grow?"
*   **AI (IT Director):** "We handle it fine. The issue is cost and training time. I can't afford a 3-month implementation."
*   **User:** "That's a common concern. But CloudCRM actually implements in 2 weeks because we import your spreadsheets directly. Would that change your perspective?"
*   **AI (IT Director):** "Two weeks? That sounds optimistic. Do you have proof of that?"
*   *[System Note: RAG retrieves "Case Study - TechCorp Implementation" from KB]*

---

## 4. Business Rules

*   **Data Privacy:** Users can only view/query documents they uploaded themselves. No cross-user data sharing in MVP.
*   **Session Limits:**
    *   Chat Session length: Max 50 messages (to control API costs).
    *   File Upload size: Max 10MB per file.
    *   File Count: Max 10 files per user (MVP).
*   **Feedback Logic:** Feedback must be generated immediately after session termination; cannot be retrieved if generation fails (MVP simplification).
*   **Deletion:** Deleting a file from Knowledge Base immediately removes it from future RAG queries.

---

## 5. Data Requirements

*   **User:** `id`, `email`, `password_hash`, `company_name`, `company_description`
*   **Document:** `id`, `user_id`, `filename`, `s3_url`, `status` (indexed/pending), `upload_date`
*   **Session:** `id`, `user_id`, `created_at`, `customer_context`, `deal_stage`, `transcript` (JSON), `feedback_score`, `feedback_text`
*   **TalkPoints:** `id`, `user_id`, `created_at`, `context`, `generated_content` (Text)

---

## 6. Integration Requirements

*   **OpenAI API:**
    *   **Purpose:** Chat completion (GPT-4o or similar) for persona simulation and feedback generation.
    *   **Data Exchange:** Send prompt + retrieved context; Receive text response.
*   **Vector Database (e.g., Pinecone/Chroma):**
    *   **Purpose:** Store document embeddings for RAG.
    *   **Data Exchange:** Store vectors on upload; Query vectors during chat.
*   **File Storage (e.g., AWS S3 / Supabase Storage):**
    *   **Purpose:** Store original uploaded files.

---

## 7. Functional Views

1.  **Dashboard:** Recent sessions list, quick start buttons ("New Session", "Talk Points").
2.  **Knowledge Base:** List of files, "Upload" button, Delete action.
3.  **Session Setup:** Form to input customer details and stage.
4.  **Active Session (Chat):** Chat interface (bubbles), "End Session" button.
5.  **Session Review:** Read-only view of transcript + Feedback panel.
6.  **Talk Points View:** Text display of generated points with "Copy" button.
7.  **Settings:** Company profile form.

---

## 8. MVP Scope & Deferred Features

### 8.1 In Scope for MVP (Core Flow)
*   User Auth & Profile
*   Document Upload (PDF/TXT) & RAG Indexing
*   Text-based AI Mock Chat
*   Talk Points Generation
*   Session Review (Feedback)

### 8.2 Deferred Features (Post-MVP Roadmap)

| Feature ID | Feature Name | Reason for Deferral |
| :--- | :--- | :--- |
| **DF-001** | **Voice-to-Voice Interaction** | High technical complexity (latency, browser audio) for a 2-week sprint. Text chat validates the "coaching" value first. |
| **DF-002** | **Google Drive / SharePoint Integration** | OAuth and API complexity is high. File upload is a sufficient workaround for MVP. |
| **DF-003** | **Mobile Native App** | Web app is responsive and sufficient for validation. |
| **DF-004** | **Team Collaboration / Admin** | MVP focuses on individual contributor value. "Teams" adds complex permission logic. |
| **DF-005** | **Custom Sales Stages** | Hardcoding standard B2B stages covers 80% of use cases and simplifies DB schema. |
| **DF-006** | **Audio Recording / Transcription** | Analyzing user audio adds cost and complexity (STT). Text is faster to build. |

---

## 9. Assumptions & Decisions

*   **Assumption:** Users have their sales materials in PDF/DOC format or can easily export them.
*   **Assumption:** Text-based practice is valuable enough to validate the concept before investing in voice.
*   **Decision:** We will use a "Standard B2B Sales Cycle" (Prospecting -> Discovery -> Demo -> Proposal -> Negotiation -> Close) as the fixed option list for MVP.
*   **Decision:** No "Free Tier" limitations logic (e.g., credit counting) will be built for the *code* of the MVP, though it might be policy. (Keep code simple).

PRD Complete - Ready for architect and UI/UX agents
