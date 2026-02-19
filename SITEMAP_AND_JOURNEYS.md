# Prapp Sitemap and User Journeys

This document serves as the source of truth for the application structure, page purposes, and key user workflows for the Sales Call Prep platform (Prapp).

## 1. Sitemap Structure

### Public Pages
- **`/`**: Landing Page
- **`/login`**: User Authentication
- **`/signup`**: New User Registration
- **`/forgot-password`**: Password Recovery Request
- **`/reset-password`**: Password Reset Completion

### Protected Pages (App Core)
- **`/profile`**: User Dashboard (Home) - The central hub for user activity.
- **`/sales-setup`**: Session Configuration - Setup for a new sales practice session.
- **`/session/[id]`**: Active Session Interface - The live chat interface and post-session evaluation.
- **`/talk-points`**: AI Talk Points Generator - Tool to generate and manage sales talking points.
- **`/knowledge-base`**: Document Management (RAG) - Interface to upload and manage reference documents.

---

## 2. Page Inventory & Components

### `/profile` (Dashboard)
**Purpose:** The central landing page for authenticated users. It adapts based on the user's "activation state" (New vs. Activated) to guide them through their journey.
**Key Components:**
- **TopBar:** Navigation to other core features (`Talk Points`, `Knowledge Base`).
- **Activation State Logic:**
    - **New User View:** Shows `PreparationInputs` to guide the user to their first session.
    - **Activated View:** Shows `ActivatedSummaryStrip` (stats), `ImprovementCard` (suggested actions), and `SessionSetupAccordion` (quick start).
- **Session List:** Displays recent practice sessions with scores and types.
- **Quick Actions:** "Start preparing" / "Start new session" CTA.

### `/sales-setup`
**Purpose:** A dedicated configuration page for setting up a detailed sales practice session. This is likely the destination for a more comprehensive setup flow than the quick start on the profile.
**Key Components:**
- **CompanyProfileForm:** Input for company name, description, value proposition, and industry.
- **SalesSessionSetup:** Inputs for Customer Name, Persona, Deal Stage.
- **Optional Context:** Fields for Meeting Agenda, Tone, and Background Context.
- **Start Button:** Triggers session creation and redirects to `/session/[id]`.

### `/session/[id]`
**Purpose:** The core interactive experience. Handles both the live AI roleplay session and the post-session performance evaluation.
**Key Components:**
- **Live Session View:**
    - **Chat Interface:** Real-time messaging with the AI.
    - **Session Timer:** Tracks duration.
    - **Context Banner:** Displays active session parameters (Customer, Deal Stage).
    - **RAG Citations:** AI messages show "Used X documents" with a clickable source viewer (`ContextSourcesModal`).
    - **Control Bar:** Input field, "End Session" button.
- **Evaluation View (Post-Session):**
    - **Score Display:** Overall score and dimension breakdown.
    - **SalesEvaluationDisplay:** Detailed breakdown of sales-specific metrics.
    - **Strengths & Improvements:** actionable feedback.
    - **Return to Profile CTA.**

### `/talk-points`
**Purpose:** A tool for users to generate specific talking points based on their uploaded knowledge base, helping them prepare for specific sales scenarios.
**Key Components:**
- **Generator/Display Toggle:** Switches between the creation form and the result view.
- **TalkPointsGenerator:** Form to request new points (Topic, Audience, Goal).
- **TalkPointsDisplay:** Renders the generated points with citations.
- **History Sidebar:** List of previously generated talk points with delete functionality.

### `/knowledge-base`
**Purpose:** Management interface for the Retrieval-Augmented Generation (RAG) system. Users upload documents that the AI uses to ground its responses.
**Key Components:**
- **DocumentUploadZone:** Drag-and-drop area for uploading files (PDF, DOCX, TXT).
- **DocumentTable:** List of uploaded files with status and delete actions.
- **DocumentViewerModal:** Preview functionality for uploaded documents.
- **Status Indicators:** Shows total document count and processing status.

---

## 3. User Journeys

### Journey A: New User Onboarding
*Goal: Get the user to their first "Aha!" moment (completing a session) as quickly as possible.*

1.  **Landing (`/`)**: User explores value prop and clicks "Get Started".
2.  **Signup (`/signup`)**: User creates an account.
3.  **Profile - New State (`/profile`)**:
    *   User lands on the dashboard in the "New" state.
    *   They see the **PreparationInputs** form immediately.
    *   They select a "Preparation Type" (e.g., Sales) and "Subtype".
    *   They click **"Start preparing"**.
4.  **Active Session (`/session/[id]`)**:
    *   User enters the chat interface.
    *   AI initiates the roleplay based on the selected type.
    *   User exchanges at least 3 messages.
    *   User clicks **"End Session"**.
5.  **Evaluation (`/session/[id]`)**:
    *   System generates feedback.
    *   User reviews their score and insights.
    *   User clicks **"Return to Profile"**.
6.  **Profile - Activated State (`/profile`)**:
    *   User returns to the dashboard.
    *   The view has transformed to the "Activated" state, showing their first session stats and "Next improvements".

### Journey B: The "Power User" Prep (RAG-Enhanced)
*Goal: Prepare for a specific, high-stakes sales call using company materials.*

1.  **Knowledge Base (`/knowledge-base`)**:
    *   User navigates to Knowledge Base from the Top Bar.
    *   User uploads a product spec sheet and a case study.
    *   User confirms documents are processed.
2.  **Sales Setup (`/sales-setup`)**:
    *   User navigates to Sales Setup.
    *   User fills out the **Company Profile** (or it loads from saved).
    *   User defines the **Customer Persona** (e.g., "Skeptical CTO").
    *   User sets **Deal Stage** to "Discovery".
    *   User clicks **"Start Sales Practice"**.
3.  **Active Session (`/session/[id]`)**:
    *   AI starts the conversation, referencing the uploaded product spec in its questions or objections.
    *   User notices the "Used 2 documents" citation in the AI's response.
    *   User practices handling objections based on the case study data.

### Journey C: Talk Points Generation
*Goal: Quick generation of cheat sheets before a call.*

1.  **Talk Points (`/talk-points`)**:
    *   User navigates to Talk Points.
    *   User clicks **"Generate New"**.
    *   User enters Topic: "Pricing objection handling for Enterprise plan".
    *   System generates a list of key points using the Knowledge Base.
2.  **Review & Refine**:
    *   User reviews the generated points.
    *   User clicks a citation to verify the source document.
    *   User keeps this tab open during their real call (or the practice session).
