# PRODUCT REQUIREMENTS DOCUMENT

**Product Name:** Interview OS

**Product Vision:** Interview OS is a mobile-first, AI-powered preparation system that helps professionals prepare for high-stakes conversations—interviews, meetings, pitches, presentations, and difficult discussions. It enables users to practice realistic scenarios, receive actionable feedback, and continuously improve their communication skills through an adaptive, single-page experience that eliminates unnecessary complexity.

**Core Purpose:** Solves the problem of inadequate preparation for critical professional conversations by providing AI-guided practice sessions with personalized feedback, helping users think clearly, speak confidently, and respond effectively under pressure.

**Target Users:** Professionals preparing for high-stakes conversations: job seekers preparing for interviews, executives preparing for board meetings, salespeople rehearsing pitches, managers preparing for difficult conversations, and anyone facing important professional communication moments.

**Key MVP Features:**
- Adaptive User Profile (Configuration) - Single-page workspace that adapts based on user state
- Preparation Sessions (User-Generated) - AI-powered practice conversations with real-time interaction
- Performance Evaluation (System) - Multi-dimensional analysis with improvement recommendations
- Session History (System) - Track progress and trends across practice sessions
- CV Profile Management (Configuration) - Optional background context for personalized guidance

**Platform:** Web application (mobile-first responsive design, accessible via browser on all devices)

**Complexity Assessment:** Moderate
- State Management: Local storage with optional backend sync
- External Integrations: OpenAI API for AI conversation and evaluation (reduces complexity)
- Business Logic: Moderate - adaptive UI states, session flow management, evaluation algorithms

**MVP Success Criteria:**
- Users complete full preparation session end-to-end (setup → practice → evaluation)
- New users transition to Activated state after first evaluated session
- Adaptive User Profile displays correct blocks based on user state
- All session data persists locally across browser sessions
- Mobile-first interface functions smoothly on phones and tablets

---

## 1. USERS & PERSONAS

**Primary Persona:**
- **Name:** "Alex the Interview Candidate"
- **Context:** Mid-level professional preparing for behavioral interviews at target companies, anxious about articulating experience clearly under pressure, currently using scattered resources (YouTube videos, friends for mock interviews, generic prep guides)
- **Goals:** Practice realistic interview scenarios, receive specific feedback on answer quality, build confidence through repetition, improve storytelling and structure
- **Pain Points:** Generic advice doesn't apply to their specific situation, friends aren't available or don't give honest feedback, can't practice on-demand, unclear what to improve after each attempt

**Secondary Persona:**
- **Name:** "Jordan the Sales Leader"
- **Context:** Experienced sales professional preparing for high-stakes client pitches and negotiations, needs to rehearse objection handling and value articulation
- **Goals:** Refine pitch delivery, practice handling tough questions, maintain confidence under pressure
- **Pain Points:** Limited time for preparation, no safe space to practice without judgment, difficulty getting constructive feedback from peers

---

## 2. FUNCTIONAL REQUIREMENTS

### 2.1 Core MVP Features (Priority 0)

**FR-001: Adaptive User Profile Page**
- **Description:** Single-page workspace that adapts content blocks based on user state (New vs Activated) and selected preparation intent
- **Entity Type:** Configuration
- **Operations:** View, Edit profile sections, Update intent/context, Reset to defaults
- **Key Rules:** Page never redirects; all interactions happen inline with progressive disclosure. State transition occurs only after first evaluated session completion.
- **Acceptance:** Users see appropriate blocks for their state, can modify context inline, and experience smooth state transitions without page reloads

**FR-002: Preparation Session Management**
- **Description:** Time-boxed AI-powered practice conversations where users rehearse real scenarios and receive turn-based questions/responses
- **Entity Type:** User-Generated
- **Operations:** Create session, Conduct practice (turn-based interaction), Complete session, View session details, Archive old sessions
- **Key Rules:** Sessions inherit context from User Profile. Practice phase is turn-based with adaptive questions. Sessions must complete evaluation before marking as finished.
- **Acceptance:** Users start sessions with pre-filled context, interact with AI counterparty through multiple turns, and receive evaluation upon completion

**FR-003: Performance Evaluation System**
- **Description:** Multi-dimensional analysis of user responses across universal and context-specific criteria, generating actionable improvement recommendations
- **Entity Type:** System
- **Operations:** Generate evaluation, View evaluation results, View improvement recommendations, Export evaluation data
- **Key Rules:** Evaluations use non-judgmental language. Only top 2-3 improvement areas surfaced. Scores are relative (Needs work/Solid/Strong), never absolute grades.
- **Acceptance:** Users receive clear performance summary with 2-3 prioritized improvements and concrete practice suggestions after each session

**FR-004: Session History & Insights**
- **Description:** Chronological record of completed sessions with trend analysis and progress tracking
- **Entity Type:** System
- **Operations:** View history list, View session details, View trend analysis, Search/filter sessions, Export history data
- **Key Rules:** History only visible to Activated users. Stores session metadata and evaluation results. Tracks improvement trends per dimension over time.
- **Acceptance:** Activated users can review past sessions, see performance trends, and identify recurring improvement areas

**FR-005: CV Profile Management**
- **Description:** Optional professional background context that personalizes AI questions and suggestions
- **Entity Type:** Configuration
- **Operations:** Add CV (paste/upload), View structured profile, Edit profile, Delete CV data, Toggle redaction settings
- **Key Rules:** CV is optional and collapsed by default. Auto-redacts personal identifiers (name, email, phone, address). Stores structured profile only, not raw text unless user opts in.
- **Acceptance:** Users can add CV to improve personalization, system extracts relevant professional context while protecting privacy, and sessions reference CV stories when appropriate

**FR-006: User Authentication (Optional)**
- **Description:** Optional account creation for cross-device sync and data backup
- **Entity Type:** System/Configuration
- **Operations:** Register account, Login, View profile, Edit profile, Reset password, Logout, Sync local data
- **Key Rules:** Auth is optional and only offered after user becomes Activated. Default is local-only storage. Magic link preferred over password. Never blocks main flow.
- **Acceptance:** Users can use app without account, see "Save progress" option after activation, and sync local data to account when created

**FR-007: Meeting Context Configuration**
- **Description:** Inline context inputs that define preparation scenario details
- **Entity Type:** Configuration
- **Operations:** Select preparation type, Select meeting subtype, Edit context fields, Save context, Reset to defaults
- **Key Rules:** Context persists across sessions. All fields optional except preparation type. Changes apply immediately without page refresh.
- **Acceptance:** Users can quickly configure meeting context, see relevant subtype options based on type selection, and have context pre-filled in next session

---

## 3. USER WORKFLOWS

### 3.1 Primary Workflow: First Preparation Session (New User → Activated User)

**Trigger:** New user clicks "Start preparing" from Onboarding or User Profile
**Outcome:** User completes first evaluated session and transitions to Activated state

**Steps:**
1. User selects preparation type (Interview/Meeting/Pitch/Sales/Presentation/Other) from intent chips
2. System displays relevant meeting subtype options inline (e.g., Behavioral/Technical for Interview)
3. User selects subtype and optionally adds context (agenda, tone, role details, CV)
4. User clicks "Start preparing" → Session begins with AI acting as counterparty
5. AI asks contextually relevant questions, user responds in turn-based format, session continues for 5-10 turns
6. User ends session → System generates evaluation across multiple dimensions
7. System displays performance summary with 2-3 prioritized improvements and practice suggestions
8. System sets user state to "Activated" and unlocks history/improvements blocks on User Profile

### 3.2 Key Supporting Workflows

**Start Subsequent Session (Activated User):** User opens User Profile → reviews "Next Improvements" → adjusts context if needed → clicks "Start preparing" → session begins with inherited context

**Edit Meeting Context:** User expands context section on User Profile → modifies fields inline → changes auto-save → next session uses updated context

**Add CV for Personalization:** User clicks "Add CV to personalize answers" → pastes text or uploads file → system extracts structured profile with redacted PII → CV stories available in next session

**Review Session History:** User scrolls to History section on User Profile → sees list of past sessions with dates and types → clicks session to view details and evaluation

**Export Session Data:** User opens session details → clicks export → receives JSON/PDF with evaluation and transcript (sanitized)

**Create Optional Account:** Activated user sees "Save progress across devices" prompt → clicks → enters email → receives magic link → clicks link → local data syncs to account

---

## 4. BUSINESS RULES

### 4.1 Entity Lifecycle Rules

**User Profile:**
- **Type:** Configuration
- **Creation:** Auto-created on first visit (local UUID generated)
- **Editing:** User can edit all context fields anytime; changes persist immediately
- **Deletion:** User can reset profile to defaults; account deletion removes all data if synced

**Preparation Session:**
- **Type:** User-Generated
- **Creation:** All users can create unlimited sessions
- **Editing:** Cannot edit completed sessions; can only view/archive
- **Deletion:** Soft delete (archived for 30 days) then permanent removal; user can export before deletion

**Performance Evaluation:**
- **Type:** System
- **Creation:** Auto-generated at session completion by AI evaluation engine
- **Editing:** Not allowed - immutable record for consistency
- **Deletion:** Deleted only when parent session is permanently deleted

**Session History:**
- **Type:** System
- **Creation:** Auto-populated as sessions complete
- **Editing:** Not allowed - read-only historical record
- **Deletion:** Individual sessions can be archived/deleted; entire history can be exported

**CV Profile:**
- **Type:** Configuration
- **Creation:** User can add anytime via paste/upload
- **Editing:** User can update structured profile fields or re-upload
- **Deletion:** User can delete CV data completely; system removes all derived stories

**User Account (Optional):**
- **Type:** System/Configuration
- **Creation:** User opts in after becoming Activated
- **Editing:** User can update email, password, sync preferences
- **Deletion:** Full account deletion removes all synced data; local data remains unless cleared

### 4.2 Data Validation Rules

**Preparation Session:**
- **Required Fields:** preparation_type, user_id, created_at
- **Field Constraints:** preparation_type must be one of: interview, meeting, pitch, sales, presentation, other; session must have at least 3 turn exchanges to be evaluable; meeting_subtype must match valid options for selected preparation_type

**Performance Evaluation:**
- **Required Fields:** session_id, universal_scores, improvement_areas, created_at
- **Field Constraints:** universal_scores must include: clarity_structure, relevance_focus, confidence_delivery, language_quality, tone_alignment; improvement_areas limited to 2-3 items maximum; scores must be: needs_work, solid, or strong

**CV Profile:**
- **Required Fields:** user_id, structured_json, updated_at
- **Field Constraints:** structured_json must exclude PII fields (name, email, phone, address) unless user explicitly opts in; story_bank must have at least 1 story to be useful; keywords array limited to 50 items

**User Account:**
- **Required Fields:** email, user_id, created_at
- **Field Constraints:** email must be valid format; password minimum 8 characters if used (magic link preferred); sync_status must be: disabled, pending, or enabled

### 4.3 Access & Process Rules
- Users can only view/edit their own sessions and profile data
- New users cannot see History or Next Improvements blocks until first session completes
- Sessions must complete evaluation generation before user state transitions to Activated
- CV data auto-redacts PII by default; raw text storage requires explicit opt-in
- Local storage is default; account sync is optional and never blocks core functionality
- Archived sessions remain accessible for 30 days before permanent deletion
- Evaluation scores are relative to user's own baseline, not absolute standards

---

## 5. DATA REQUIREMENTS

### 5.1 Core Entities

**User**
- **Type:** System/Configuration | **Storage:** localStorage (default) or Backend (if account created)
- **Key Fields:** user_id (UUID), activation_state (new/activated), created_at, last_active_at, sync_status (disabled/pending/enabled), preferences (tone, notification settings)
- **Relationships:** has many Sessions, has one CVProfile, has one ImprovementPlan, has one RollupMetrics
- **Lifecycle:** Auto-created on first visit, full CRUD on profile fields, optional account creation for sync, full deletion removes all related data

**Session**
- **Type:** User-Generated | **Storage:** localStorage (default) or Backend (if synced)
- **Key Fields:** id, user_id, preparation_type, meeting_subtype, context_payload (agenda, tone, role_context), transcript (turn-based Q&A array), status (in_progress/completed/archived), created_at, completed_at
- **Relationships:** belongs to User, has one Evaluation, references CVProfile stories (optional)
- **Lifecycle:** Create, View, Complete (triggers evaluation), Archive (soft delete), Export, Permanent delete after 30 days

**Evaluation**
- **Type:** System | **Storage:** localStorage (default) or Backend (if synced)
- **Key Fields:** id, session_id, universal_scores (clarity_structure, relevance_focus, confidence_delivery, language_quality, tone_alignment), context_scores (varies by preparation_type), improvement_areas (array of 2-3 items), practice_suggestions, created_at
- **Relationships:** belongs to Session
- **Lifecycle:** Auto-generated at session completion, View only, Export, Immutable (no edits), Deleted with parent session

**ImprovementPlan**
- **Type:** System | **Storage:** localStorage (default) or Backend (if synced)
- **Key Fields:** user_id, focus_areas (array of current improvement priorities), updated_at, last_session_id
- **Relationships:** belongs to User, derived from latest Evaluation
- **Lifecycle:** Auto-created after first evaluation, Auto-updated after each new evaluation, View only, Reset when user starts fresh focus

**RollupMetrics**
- **Type:** System | **Storage:** localStorage (default) or Backend (if synced)
- **Key Fields:** user_id, dimension_trends (scores over time per evaluation dimension), last_score_summary, improvement_velocity, consistency_score, recurring_weaknesses, updated_at
- **Relationships:** belongs to User, aggregates data from all Evaluations
- **Lifecycle:** Auto-created after first evaluation, Auto-updated after each session, View only, Export, Deleted with user account

**CVProfile**
- **Type:** Configuration | **Storage:** localStorage (default) or Backend (if synced)
- **Key Fields:** user_id, structured_json (sanitized professional data), story_bank (array of STAR stories), keywords (skills/domains), cv_redaction_enabled (boolean), cv_storage_mode (local_structured_only/local_raw_opt_in/server_sync_opt_in), updated_at
- **Relationships:** belongs to User, referenced by Sessions
- **Lifecycle:** Optional creation via paste/upload, Edit structured fields, Delete completely, Auto-redacts PII on creation

**UserAccount (Optional)**
- **Type:** System/Configuration | **Storage:** Backend only
- **Key Fields:** account_id, user_id, email, password_hash (if not using magic link), sync_enabled (boolean), last_sync_at, created_at
- **Relationships:** links to User entity for sync
- **Lifecycle:** Optional creation after activation, Login/logout, Edit email/password, Full deletion removes account and synced data

### 5.2 Data Storage Strategy
- **Primary Storage:** localStorage/IndexedDB (5-10MB capacity per domain)
- **Capacity:** Sufficient for 50-100 sessions with full transcripts and evaluations
- **Persistence:** Data persists across browser sessions on same device
- **Sync Strategy:** Local-first by default; optional backend sync when user creates account
- **Audit Fields:** All entities include created_at, updated_at; Sessions and Evaluations include created_by (user_id)
- **Privacy:** PII auto-redacted from CV data; raw session transcripts stored locally only unless user opts into sync

---

## 6. INTEGRATION REQUIREMENTS

**OpenAI API:**
- **Purpose:** Powers AI conversation partner and performance evaluation engine
- **Type:** Frontend API calls (or backend proxy for API key security)
- **Data Exchange:** Sends session context + user responses; Receives AI questions/responses and evaluation analysis
- **Trigger:** Called during active session for each turn, and at session completion for evaluation generation
- **Error Handling:** Display user-friendly error message, allow session retry, save partial progress locally

---

## 7. VIEWS & NAVIGATION

### 7.1 Primary Views

**Onboarding Page** (`/`) - Public entry point with hero section, preparation type selection chips, "How it works" explanation, and primary CTA to start preparing

**User Profile Page** (`/profile`) - Single adaptive workspace that displays different content blocks based on user state (New vs Activated); includes intent selection, context inputs, session start CTA, and conditionally shows improvements/history

**Active Session View** (`/session/:id`) - Full-screen turn-based conversation interface with AI questions, user response input, optional inline hints, and session controls (pause, end)

**Session Review View** (`/session/:id/review`) - Displays performance summary, evaluation scores, improvement recommendations, and practice suggestions after session completion

**History View** (embedded in User Profile) - Scrollable list of past sessions with filters, search, and click-through to individual session reviews

**Settings** (`/settings`) - Profile management, CV upload/edit, privacy controls (redaction settings), data export, optional account creation, and logout

### 7.2 Navigation Structure

**Main Nav (Mobile):** Hamburger menu with: Profile, History (if Activated), Settings, Help
**Main Nav (Desktop):** Horizontal nav with: Profile, History (if Activated), Settings, User Menu (profile, logout if account exists)
**Default Landing:** Onboarding page for new visitors; User Profile for returning users
**Mobile:** Bottom navigation bar with Profile and Settings; hamburger for secondary items
**Session Mode:** Full-screen with minimal chrome; back button returns to Profile with save prompt

---

## 8. MVP SCOPE & CONSTRAINTS

### 8.1 MVP Success Definition

The MVP is successful when:
- ✅ New users can complete first preparation session end-to-end without friction
- ✅ User state transitions from New to Activated after first evaluated session
- ✅ Adaptive User Profile displays correct blocks for each state
- ✅ AI conversation feels realistic and contextually relevant
- ✅ Performance evaluations provide actionable, non-judgmental feedback
- ✅ Session history and improvements visible to Activated users
- ✅ Mobile-first interface works smoothly on phones and tablets
- ✅ Data persists locally across browser sessions
- ✅ Optional CV upload personalizes questions without exposing PII

### 8.2 In Scope for MVP

Core features included:
- FR-001: Adaptive User Profile Page
- FR-002: Preparation Session Management
- FR-003: Performance Evaluation System
- FR-004: Session History & Insights
- FR-005: CV Profile Management
- FR-006: User Authentication (Optional)
- FR-007: Meeting Context Configuration

All preparation types supported:
- Interview (with subtypes: Behavioral, Technical, Product Sense, System Design, Case Study, Executive, Culture Fit, Mock)
- Corporate Meeting (with subtypes: Stand-up, 1:1, Status Update, Quarterly Review, Board Meeting, Planning, Retro)
- Pitch (with subtypes: Startup, Product, Internal, Partnership)
- Sales (with subtypes: Discovery, Demo, Negotiation, Closing)
- Presentation (with subtypes: Conference, Workshop, Webinar, Training)
- Difficult Conversation / Other

### 8.3 Technical Constraints

- **Data Storage:** Browser localStorage/IndexedDB (5-10MB capacity) for default local-only mode; optional backend database for synced accounts
- **Concurrent Users:** Single-user sessions (no real-time collaboration)
- **Performance:** Page loads <2s on 3G, instant UI interactions, AI response time <3s per turn
- **Browser Support:** Chrome, Firefox, Safari, Edge (last 2 versions); iOS Safari and Android Chrome for mobile
- **Mobile:** Mobile-first responsive design; optimized for phones (320px+) and tablets (768px+)
- **Offline:** Basic offline support via localStorage; sessions can start offline but require connection for AI interaction
- **Session Length:** 5-10 turn exchanges per session (10-20 minutes typical duration)
- **AI Dependency:** Requires OpenAI API availability; graceful degradation if API unavailable

### 8.4 Known Limitations

**For MVP:**
- Browser storage limits total sessions to ~50-100 per user (with full transcripts)
- No multi-device sync unless user creates optional account
- No real-time collaboration or shared sessions
- AI evaluation quality depends on OpenAI API capabilities
- No offline AI interaction (requires internet connection during session)
- No video/audio recording (text-based interaction only)
- No calendar integration or scheduled reminders
- No team/organization features (individual use only)

**Future Enhancements:**
- V2 will add backend storage by default with larger capacity
- V2 will support audio/video practice modes
- V2 will add calendar integration and preparation reminders
- V2 will introduce team features (shared prep packs, peer review)
- V2 will add advanced analytics and long-term trend analysis

---

## 9. ASSUMPTIONS & DECISIONS

### 9.1 Platform Decisions
- **Type:** Web application (mobile-first, frontend-focused with optional backend for sync)
- **Storage:** localStorage/IndexedDB by default; optional backend database for synced accounts
- **Auth:** Local-only by default; optional email/magic-link authentication for cross-device sync
- **AI Provider:** OpenAI API for conversation and evaluation (can be proxied through backend for API key security)

### 9.2 Entity Lifecycle Decisions

**Preparation Session:** Full CRUD + Archive + Export
- **Reason:** User-generated content that users need full control over; archiving preserves history while allowing cleanup

**Performance Evaluation:** Create + View + Export only
- **Reason:** System-generated immutable record that maintains evaluation integrity and consistency over time

**Session History:** View + Export only
- **Reason:** System-aggregated data derived from sessions; users control via session management

**CV Profile:** Full CRUD + Privacy controls
- **Reason:** Configuration data that users must control completely, especially given privacy sensitivity

**User Account:** Full CRUD + Sync controls
- **Reason:** Optional configuration that users must manage independently from core functionality

### 9.3 Key Assumptions

1. **Users prefer low-friction entry over account creation**
   - Reasoning: Product idea emphasizes "zero unnecessary redirections" and reducing anxiety; requiring signup before value demonstration increases drop-off

2. **Single-page adaptive UI is superior to multi-page flows**
   - Reasoning: Product principle states "One adaptive User Profile page, two user states, zero unnecessary redirections"; mobile-first design benefits from reduced navigation

3. **Text-based interaction is sufficient for MVP**
   - Reasoning: Voice/video adds significant complexity; text allows focus on core evaluation logic and feedback quality; can add richer modes in V2

4. **Local storage capacity (5-10MB) is adequate for MVP**
   - Reasoning: 50-100 sessions with full transcripts fits within limits; users who need more will opt into account sync; early users unlikely to hit limits during MVP validation

5. **AI evaluation can provide actionable feedback without human review**
   - Reasoning: OpenAI's language models are capable of nuanced analysis; non-judgmental framing reduces risk of harmful feedback; user testing will validate quality

6. **CV personalization adds significant value despite privacy complexity**
   - Reasoning: Product idea emphasizes preparation quality; CV context enables much more relevant questions and suggestions; auto-redaction mitigates privacy concerns

### 9.4 Clarification Q&A Summary

**Q:** How do you envision the actual "preparation session" taking place?
**A:** Turn-based interaction where AI acts as counterparty (interviewer/client/stakeholder), asking contextually relevant questions and adapting based on user responses; session ends with multi-dimensional evaluation and improvement recommendations
**Decision:** Session entity includes turn-based transcript array; evaluation triggered at completion; session inherits context from User Profile to minimize setup friction

**Q:** Regarding the "Evaluation + improvement guidance," what specific criteria should the AI use to analyze the user's performance?
**A:** Universal criteria (clarity/structure, relevance/focus, confidence/delivery, language quality, tone alignment) plus context-specific criteria based on preparation type (e.g., evidence-based answers for interviews, objection handling for sales); output top 2-3 improvement areas with actionable recommendations
**Decision:** Evaluation entity includes universal_scores and context_scores fields; improvement_areas limited to 2-3 items; scoring uses relative scale (needs work/solid/strong) to avoid judgmental language

**Q:** To support the "Activated User" state and history tracking, should we implement a standard email/password authentication system from the start, or would you prefer a local-storage approach (no login required) for the MVP to reduce friction?
**A:** Prefer local-first approach (no login required) with optional auth only when user tries to preserve history across devices; keeps friction low while supporting Activated User loop
**Decision:** Default to localStorage with auto-generated UUID; add optional "Save & Sync" account (email/magic link) after user becomes Activated; never block main flow behind auth

**Q:** For the "CV paste or upload" feature, how should the system utilize this information during the preparation session?
**A:** Use CV to personalize questions, suggest relevant stories from CV, provide answer scaffolding, and check consistency; auto-redact PII by default; store structured profile only (not raw text unless user opts in)
**Decision:** CVProfile entity stores structured_json (sanitized) and story_bank; sessions reference CV stories when available; privacy-first handling with explicit redaction controls

---

## LANGUAGE & STYLE NOTES

This PRD uses accessible language appropriate for both technical and non-technical stakeholders:
- "AI conversation partner" instead of "NLP-based dialogue system"
- "Turn-based interaction" instead of "request-response protocol"
- "Performance evaluation" instead of "ML-based scoring algorithm"
- Focus on WHAT the system does (user can practice realistic scenarios) not HOW it works (OpenAI API integration with prompt engineering)

All requirements describe user-facing behaviors and outcomes, not implementation details. Technical decisions (React, database choice, API architecture) are intentionally excluded to give developers full freedom in HOW to build.

---

**PRD Complete - Ready for Development**
