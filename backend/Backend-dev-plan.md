# BACKEND DEVELOPMENT PLAN

**Product:** Interview OS (prapp)  
**Backend Stack:** FastAPI (Python 3.13, async) + MongoDB Atlas + Motor + Pydantic v2  
**Frontend:** Next.js 15 (already built with dummy data)  
**Constraints:** No Docker, MongoDB Atlas only, single branch `main`, manual testing per task

---

## 1️⃣ EXECUTIVE SUMMARY

**What will be built:**
- FastAPI backend to replace frontend's localStorage with real database persistence
- RESTful API at `/api/v1/*` supporting user profiles, preparation sessions, AI-powered evaluations, and session history
- MongoDB Atlas integration for data storage using Motor (async) and Pydantic v2 models
- OpenAI API integration for AI conversation and performance evaluation
- JWT-based authentication (optional, post-activation only)

**Why:**
- Frontend currently uses localStorage with dummy data
- Users need cross-device sync and persistent data storage
- AI-powered features require backend processing (OpenAI API calls)
- Performance evaluations need server-side computation

**Key Constraints:**
- Python 3.13 + FastAPI (async)
- MongoDB Atlas only (no local instance)
- No Docker containers
- Manual testing after every task via frontend UI
- Single Git branch `main` only
- Per-task testing before sprint completion

**Sprint Structure:**
- **S0:** Environment setup + frontend connection
- **S1:** Basic auth (signup/login/logout)
- **S2:** User profile management
- **S3:** Session creation and management
- **S4:** AI conversation integration
- **S5:** Performance evaluation system
- **S6:** Session history and analytics

---

## 2️⃣ IN-SCOPE & SUCCESS CRITERIA

**In-Scope Features (Frontend-Visible):**
- User registration and authentication (optional, post-activation)
- User profile CRUD (preparation type, meeting details, CV/background)
- Session creation with context inheritance from profile
- AI-powered turn-based conversation during sessions
- Performance evaluation with multi-dimensional scoring
- Session history with filtering and search
- Training focus management
- Improvement recommendations
- Cross-device data sync (when authenticated)

**Success Criteria:**
- All frontend pages functional end-to-end with real backend data
- User can complete full preparation session flow (setup → practice → evaluation)
- New users transition to Activated state after first evaluated session
- All task-level manual tests pass via frontend UI
- Each sprint's code pushed to `main` after all tasks verified
- No localStorage dependency (except as fallback)

---

## 3️⃣ API DESIGN

**Base Path:** `/api/v1`

**Error Envelope:**
```json
{ "error": "Human-readable error message" }
```

**Common Headers:**
- `Authorization: Bearer <jwt_token>` (when authenticated)
- `Content-Type: application/json`

### Health & Status
- **GET** `/healthz`
  - Purpose: Health check with DB connectivity test
  - Response: `{ "status": "ok", "db_connected": true, "timestamp": "ISO8601" }`
  - Validation: None

### Authentication (Optional)
- **POST** `/api/v1/auth/signup`
  - Purpose: Create new user account (post-activation only)
  - Request: `{ "email": "string", "password": "string" }`
  - Response: `{ "user_id": "uuid", "email": "string", "token": "jwt" }`
  - Validation: Email format, password min 8 chars

- **POST** `/api/v1/auth/login`
  - Purpose: Authenticate existing user
  - Request: `{ "email": "string", "password": "string" }`
  - Response: `{ "user_id": "uuid", "email": "string", "token": "jwt" }`
  - Validation: Credentials match

- **POST** `/api/v1/auth/logout`
  - Purpose: Invalidate token (client-side token removal)
  - Request: None (token in header)
  - Response: `{ "message": "Logged out successfully" }`
  - Validation: Valid token

- **GET** `/api/v1/auth/me`
  - Purpose: Get current user info
  - Response: `{ "user_id": "uuid", "email": "string", "activation_state": "new|activated" }`
  - Validation: Valid token

### User Profile
- **GET** `/api/v1/profile`
  - Purpose: Retrieve user profile
  - Response: Full UserProfile object
  - Validation: Valid token (if authenticated) or local user_id

- **PUT** `/api/v1/profile`
  - Purpose: Update user profile fields
  - Request: Partial UserProfile object
  - Response: Updated UserProfile
  - Validation: Field types match schema

- **POST** `/api/v1/profile/cv`
  - Purpose: Upload and parse CV text
  - Request: `{ "cv_text": "string", "redact_pii": true }`
  - Response: `{ "structured_profile": {...}, "story_bank": [...] }`
  - Validation: Non-empty text

### Sessions
- **POST** `/api/v1/sessions`
  - Purpose: Create new preparation session
  - Request: `{ "preparation_type": "string", "meeting_subtype": "string", "context": {...} }`
  - Response: `{ "session_id": "uuid", "status": "in_progress", "created_at": "ISO8601" }`
  - Validation: Valid preparation_type

- **GET** `/api/v1/sessions/{session_id}`
  - Purpose: Get session details
  - Response: Full Session object with transcript
  - Validation: Session exists and belongs to user

- **GET** `/api/v1/sessions`
  - Purpose: List user's sessions
  - Query: `?status=completed&limit=10&offset=0`
  - Response: `{ "sessions": [...], "total": 42 }`
  - Validation: None (returns empty array if none)

- **POST** `/api/v1/sessions/{session_id}/messages`
  - Purpose: Add user message to session (triggers AI response)
  - Request: `{ "message": "string" }`
  - Response: `{ "ai_response": "string", "turn_number": 3 }`
  - Validation: Session in_progress, message non-empty

- **POST** `/api/v1/sessions/{session_id}/complete`
  - Purpose: End session and trigger evaluation
  - Request: None
  - Response: `{ "session_id": "uuid", "status": "completed", "evaluation_id": "uuid" }`
  - Validation: Session has min 3 turns

### Evaluations
- **GET** `/api/v1/evaluations/{evaluation_id}`
  - Purpose: Get evaluation results
  - Response: Full Evaluation object with scores and improvements
  - Validation: Evaluation exists and belongs to user's session

- **GET** `/api/v1/sessions/{session_id}/evaluation`
  - Purpose: Get evaluation for specific session
  - Response: Full Evaluation object
  - Validation: Session completed and has evaluation

### Improvements & Focus
- **GET** `/api/v1/improvements`
  - Purpose: Get current improvement recommendations
  - Response: `{ "focus_areas": [...], "recommendations": [...] }`
  - Validation: User is activated

- **PUT** `/api/v1/profile/training-focus`
  - Purpose: Update training focus
  - Request: `{ "title": "string", "tags": [...], "agenda_template": "string" }`
  - Response: Updated profile with new focus
  - Validation: Valid focus structure

### Analytics
- **GET** `/api/v1/analytics/trends`
  - Purpose: Get performance trends over time
  - Response: `{ "dimension_trends": {...}, "improvement_velocity": 0.15 }`
  - Validation: User has completed sessions

---

## 4️⃣ DATA MODEL (MongoDB Atlas)

### Collection: `users`
**Fields:**
- `_id`: ObjectId (MongoDB default)
- `user_id`: String (UUID, indexed, unique)
- `email`: String (optional, indexed if present)
- `password_hash`: String (optional, Argon2)
- `activation_state`: String (enum: "new", "activated", default: "new")
- `created_at`: DateTime
- `last_active_at`: DateTime
- `preferences`: Object `{ tone: String, notification_settings: Object }`

**Embedded vs Referenced:**
- Profile data embedded in user document
- Sessions referenced by user_id

**Example Document:**
```json
{
  "_id": ObjectId("..."),
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "password_hash": "$argon2id$...",
  "activation_state": "activated",
  "created_at": "2026-02-11T20:00:00Z",
  "last_active_at": "2026-02-11T20:30:00Z",
  "preferences": {
    "tone": "Professional & Confident"
  }
}
```

### Collection: `profiles`
**Fields:**
- `_id`: ObjectId
- `user_id`: String (UUID, indexed)
- `preparation_type`: String (enum: Interview, Corporate, Pitch, Sales, Presentation, Other)
- `meeting_subtype`: String (optional)
- `agenda`: String (optional)
- `tone`: String (default: "Professional & Confident")
- `cv_text`: String (optional)
- `structured_cv`: Object (optional, PII redacted)
- `story_bank`: Array of Objects (optional)
- `training_focus`: Object `{ title: String, tags: Array, agenda_template: String }`
- `updated_at`: DateTime

**Example Document:**
```json
{
  "_id": ObjectId("..."),
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "preparation_type": "Interview",
  "meeting_subtype": "Behavioral",
  "agenda": "Practice STAR method responses",
  "tone": "Professional & Confident",
  "training_focus": {
    "title": "Structure (STAR)",
    "tags": ["Structure", "Behavioral"],
    "agenda_template": "Answer 2 behavioral questions using STAR..."
  },
  "updated_at": "2026-02-11T20:30:00Z"
}
```

### Collection: `sessions`
**Fields:**
- `_id`: ObjectId
- `session_id`: String (UUID, indexed, unique)
- `user_id`: String (UUID, indexed)
- `preparation_type`: String
- `meeting_subtype`: String (optional)
- `context_payload`: Object `{ agenda: String, tone: String, role_context: String }`
- `transcript`: Array of Objects `[{ role: "ai"|"user", message: String, timestamp: DateTime }]`
- `status`: String (enum: "in_progress", "completed", "archived")
- `created_at`: DateTime
- `completed_at`: DateTime (optional)

**Example Document:**
```json
{
  "_id": ObjectId("..."),
  "session_id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "preparation_type": "Interview",
  "meeting_subtype": "Behavioral",
  "context_payload": {
    "agenda": "Practice STAR method",
    "tone": "Professional & Confident"
  },
  "transcript": [
    {
      "role": "ai",
      "message": "Tell me about a time you led a project...",
      "timestamp": "2026-02-11T20:15:00Z"
    },
    {
      "role": "user",
      "message": "In my previous role...",
      "timestamp": "2026-02-11T20:16:00Z"
    }
  ],
  "status": "completed",
  "created_at": "2026-02-11T20:15:00Z",
  "completed_at": "2026-02-11T20:25:00Z"
}
```

### Collection: `evaluations`
**Fields:**
- `_id`: ObjectId
- `evaluation_id`: String (UUID, indexed, unique)
- `session_id`: String (UUID, indexed)
- `user_id`: String (UUID, indexed)
- `universal_scores`: Object `{ clarity_structure: String, relevance_focus: String, confidence_delivery: String, language_quality: String, tone_alignment: String }`
- `context_scores`: Object (varies by preparation_type)
- `improvement_areas`: Array of Strings (max 3)
- `practice_suggestions`: Array of Strings
- `overall_score`: Integer (0-100)
- `created_at`: DateTime

**Example Document:**
```json
{
  "_id": ObjectId("..."),
  "evaluation_id": "770e8400-e29b-41d4-a716-446655440002",
  "session_id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "universal_scores": {
    "clarity_structure": "solid",
    "relevance_focus": "strong",
    "confidence_delivery": "solid",
    "language_quality": "strong",
    "tone_alignment": "solid"
  },
  "improvement_areas": [
    "Use more specific metrics when describing achievements",
    "Pause briefly before answering complex questions"
  ],
  "practice_suggestions": [
    "Practice quantifying your impact with numbers",
    "Take 2-3 seconds to organize thoughts before responding"
  ],
  "overall_score": 78,
  "created_at": "2026-02-11T20:25:00Z"
}
```

---

## 5️⃣ CONFIGURATION & ENV VARS

**Core Environment Variables:**
- `APP_ENV` — environment (development, production)
- `PORT` — HTTP port (default: 8000)
- `MONGODB_URI` — MongoDB Atlas connection string (required)
- `JWT_SECRET` — token signing key (required for auth)
- `JWT_EXPIRES_IN` — seconds before JWT expiry (default: 604800 = 7 days)
- `CORS_ORIGINS` — allowed frontend URL(s) (default: http://localhost:3000)
- `OPENAI_API_KEY` — OpenAI API key for AI features (required)
- `OPENAI_MODEL` — model name (default: gpt-4)

**Example `.env` file:**
```
APP_ENV=development
PORT=8000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/prapp?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=604800
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
```

---

## 6️⃣ BACKGROUND WORK

**Not Required for MVP:**
- All AI processing happens synchronously during API calls
- No background jobs or queues needed
- Session evaluation triggered immediately on completion
- Use FastAPI's `BackgroundTasks` only if response time exceeds 5 seconds

---

## 7️⃣ INTEGRATIONS

### OpenAI API Integration
**Purpose:** AI conversation partner and performance evaluation

**Flow:**
1. User sends message via `POST /api/v1/sessions/{session_id}/messages`
2. Backend constructs prompt with session context + user message
3. Call OpenAI Chat Completions API
4. Store AI response in session transcript
5. Return AI response to frontend

**Evaluation Flow:**
1. User completes session via `POST /api/v1/sessions/{session_id}/complete`
2. Backend constructs evaluation prompt with full transcript
3. Call OpenAI API with structured output format
4. Parse scores and improvement areas
5. Store evaluation in database
6. Update user activation_state if first session
7. Return evaluation to frontend

**Extra ENV Vars:**
- `OPENAI_API_KEY` — API key
- `OPENAI_MODEL` — model name (gpt-4 or gpt-3.5-turbo)

---

## 8️⃣ TESTING STRATEGY (Manual via Frontend)

**Validation Approach:**
- All testing done through frontend UI
- No automated tests required for MVP
- Every task includes Manual Test Step + User Test Prompt

**Task Testing Format:**
- **Manual Test Step:** Exact UI action + expected result
- **User Test Prompt:** Copy-paste instruction for testing

**Sprint Completion:**
- After all tasks in sprint pass → commit and push to `main`
- If any task fails → fix and retest before pushing
- No partial sprint pushes

---

## 🔟 DYNAMIC SPRINT PLAN & BACKLOG

---

## 🧱 S0 – ENVIRONMENT SETUP & FRONTEND CONNECTION

**Objectives:**
- Create FastAPI skeleton with `/api/v1` base path and `/healthz` endpoint
- Connect to MongoDB Atlas using `MONGODB_URI`
- `/healthz` performs DB ping and returns JSON status
- Enable CORS for frontend origin
- Initialize Git at root, set default branch to `main`, push to GitHub
- Create single `.gitignore` at root (ignore `__pycache__`, `.env`, `*.pyc`, `venv/`, `.venv/`)

**User Stories:**
- As a developer, I can verify backend is running and connected to MongoDB
- As a frontend developer, I can call backend APIs without CORS errors
- As a team, we have version control set up on GitHub

**Tasks:**

### Task S0.1: Initialize FastAPI Project Structure
- Create project root directory structure:
  - `app/` — main application code
  - `app/main.py` — FastAPI app entry point
  - `app/api/` — API routes
  - `app/models/` — Pydantic models
  - `app/db/` — database connection
  - `app/core/` — config and utilities
  - `requirements.txt` — Python dependencies
  - `.env.example` — example environment variables
  - `.gitignore` — Git ignore file
- Add dependencies to `requirements.txt`:
  - `fastapi==0.115.0`
  - `uvicorn[standard]==0.32.0`
  - `motor==3.6.0`
  - `pydantic==2.10.0`
  - `pydantic-settings==2.6.0`
  - `python-dotenv==1.0.1`
  - `python-jose[cryptography]==3.3.0`
  - `passlib[argon2]==1.7.4`
  - `openai==1.58.1`
- Create `.gitignore` with: `__pycache__/`, `*.pyc`, `.env`, `venv/`, `.venv/`, `.DS_Store`
- **Manual Test Step:** Run `pip install -r requirements.txt` → all packages install without errors
- **User Test Prompt:** "Install dependencies and confirm no errors appear."

### Task S0.2: Create Configuration Module
- Create `app/core/config.py` with Pydantic Settings:
  - `APP_ENV`, `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGINS`, `OPENAI_API_KEY`, `OPENAI_MODEL`
- Load from `.env` file using `python-dotenv`
- Create `.env.example` with placeholder values
- **Manual Test Step:** Create `.env` file → import config → print `config.MONGODB_URI` → shows correct value
- **User Test Prompt:** "Create .env file with your MongoDB URI and verify config loads correctly."

### Task S0.3: Setup MongoDB Connection
- Create `app/db/mongodb.py` with Motor async client
- Implement `connect_to_mongo()` and `close_mongo_connection()` functions
- Add connection to FastAPI startup/shutdown events
- Implement `ping_db()` function to test connectivity
- **Manual Test Step:** Start app → check logs → "Connected to MongoDB" message appears
- **User Test Prompt:** "Start the backend and confirm MongoDB connection in logs."

### Task S0.4: Create Health Check Endpoint
- Create `app/api/health.py` with `GET /healthz` endpoint
- Endpoint calls `ping_db()` and returns:
  ```json
  {
    "status": "ok",
    "db_connected": true,
    "timestamp": "2026-02-11T20:30:00Z"
  }
  ```
- **Manual Test Step:** Start backend → open browser → visit `http://localhost:8000/healthz` → see JSON response with `db_connected: true`
- **User Test Prompt:** "Visit http://localhost:8000/healthz and confirm you see a successful health check response."

### Task S0.5: Setup CORS and API Router
- Create `app/main.py` with FastAPI app instance
- Add CORS middleware with `CORS_ORIGINS` from config
- Mount `/api/v1` router
- Include health router at root level
- **Manual Test Step:** Start backend → open frontend → check browser console → no CORS errors when calling `/healthz`
- **User Test Prompt:** "Start both backend and frontend, then check browser console for CORS errors."

### Task S0.6: Initialize Git and Push to GitHub
- Run `git init` at project root
- Set default branch to `main`: `git branch -M main`
- Create initial commit with all files
- Create GitHub repository
- Add remote and push: `git remote add origin <url>` → `git push -u origin main`
- **Manual Test Step:** Visit GitHub repository → see all files committed
- **User Test Prompt:** "Check your GitHub repository and confirm all backend files are visible."

**Definition of Done:**
- Backend runs locally on port 8000
- `/healthz` returns 200 OK with DB connection status
- MongoDB Atlas connection successful
- CORS enabled for frontend origin
- Git repository initialized and pushed to GitHub `main` branch
- `.gitignore` properly excludes sensitive files

**Post-Sprint:**
- Commit all changes with message: "S0: Environment setup complete"
- Push to `main` branch

---

## 🧩 S1 – BASIC AUTH (SIGNUP / LOGIN / LOGOUT)

**Objectives:**
- Implement JWT-based signup, login, and logout
- Store users in MongoDB with Argon2 password hashing
- Protect one backend route + enable frontend auth flow
- Optional auth (users can use app without account)

**User Stories:**
- As a new user, I can create an account after becoming activated
- As a returning user, I can log in and access my synced data
- As a logged-in user, I can log out and clear my session

**Endpoints:**
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

**Tasks:**

### Task S1.1: Create User Model and Database Schema
- Create `app/models/user.py` with Pydantic models:
  - `UserCreate` (email, password)
  - `UserInDB` (user_id, email, password_hash, activation_state, created_at, last_active_at)
  - `UserResponse` (user_id, email, activation_state)
- Create MongoDB collection `users` with unique index on `user_id` and `email`
- **Manual Test Step:** Start backend → check MongoDB Atlas → `users` collection exists
- **User Test Prompt:** "Check your MongoDB Atlas dashboard and confirm the users collection was created."

### Task S1.2: Implement Password Hashing Utilities
- Create `app/core/security.py` with:
  - `hash_password(password: str) -> str` using Argon2
  - `verify_password(plain: str, hashed: str) -> bool`
- **Manual Test Step:** Write test script → hash password → verify correct password returns True, wrong password returns False
- **User Test Prompt:** "Run a test script to verify password hashing works correctly."

### Task S1.3: Implement JWT Token Generation
- Add to `app/core/security.py`:
  - `create_access_token(data: dict) -> str` using `python-jose`
  - `decode_access_token(token: str) -> dict`
- Use `JWT_SECRET` and `JWT_EXPIRES_IN` from config
- **Manual Test Step:** Generate token → decode token → verify payload matches
- **User Test Prompt:** "Test token generation and decoding to ensure they work correctly."

### Task S1.4: Create Signup Endpoint
- Create `app/api/auth.py` with `POST /api/v1/auth/signup`
- Validate email format and password length (min 8 chars)
- Check if email already exists → return error if duplicate
- Hash password with Argon2
- Generate UUID for `user_id`
- Store user in MongoDB `users` collection
- Generate JWT token
- Return `{ "user_id": "...", "email": "...", "token": "..." }`
- **Manual Test Step:** Use Postman/curl → POST to `/api/v1/auth/signup` with valid email/password → receive token in response
- **User Test Prompt:** "Use Postman or curl to create a new account and verify you receive a JWT token."

### Task S1.5: Create Login Endpoint
- Add `POST /api/v1/auth/login` to `app/api/auth.py`
- Find user by email in MongoDB
- Verify password using `verify_password()`
- If invalid → return 401 error
- If valid → generate new JWT token
- Update `last_active_at` timestamp
- Return `{ "user_id": "...", "email": "...", "token": "..." }`
- **Manual Test Step:** Use Postman/curl → POST to `/api/v1/auth/login` with correct credentials → receive token
- **User Test Prompt:** "Log in with your created account and confirm you receive a token."

### Task S1.6: Create Logout Endpoint
- Add `POST /api/v1/auth/logout` to `app/api/auth.py`
- Validate JWT token from Authorization header
- Return `{ "message": "Logged out successfully" }`
- Note: Actual token invalidation happens client-side
- **Manual Test Step:** Use Postman/curl → POST to `/api/v1/auth/logout` with valid token → receive success message
- **User Test Prompt:** "Call the logout endpoint with your token and confirm success message."

### Task S1.7: Create Get Current User Endpoint
- Add `GET /api/v1/auth/me` to `app/api/auth.py`
- Extract and validate JWT token from Authorization header
- Decode token to get `user_id`
- Fetch user from MongoDB
- Return `{ "user_id": "...", "email": "...", "activation_state": "..." }`
- **Manual Test Step:** Use Postman/curl → GET `/api/v1/auth/me` with valid token → receive user info
- **User Test Prompt:** "Call /api/v1/auth/me with your token and verify your user information is returned."

### Task S1.8: Create Auth Dependency for Protected Routes
- Create `app/core/dependencies.py` with `get_current_user()` dependency
- Extracts token from Authorization header
- Decodes and validates token
- Returns user_id for use in protected routes
- **Manual Test Step:** Create test protected route → call without token → receive 401 error → call with token → receive 200 OK
- **User Test Prompt:** "Test a protected route without a token (should fail) and with a token (should succeed)."

### Task S1.9: Update Frontend API URLs
- Document backend URLs for frontend to use:
  - Signup: `POST http://localhost:8000/api/v1/auth/signup`
  - Login: `POST http://localhost:8000/api/v1/auth/login`
  - Logout: `POST http://localhost:8000/api/v1/auth/logout`
  - Get User: `GET http://localhost:8000/api/v1/auth/me`
- **Manual Test Step:** Frontend developer updates API URLs → test signup flow in browser → account created successfully
- **User Test Prompt:** "Update frontend to use real backend URLs and test the signup flow in your browser."

**Definition of Done:**
- Users can sign up via frontend and receive JWT token
- Users can log in with correct credentials
- Users can log out (token cleared client-side)
- Protected routes require valid JWT token
- All auth endpoints tested via frontend UI

**Post-Sprint:**
- Commit with message: "S1: Basic authentication complete"
- Push to `main` branch

---

## 🧩 S2 – USER PROFILE MANAGEMENT

**Objectives:**
- Implement user profile CRUD operations
- Store profile data in MongoDB `profiles` collection
- Support preparation type, meeting details, tone, agenda, CV text
- Enable training focus management

**User Stories:**
- As a user, I can save my preparation preferences
- As a user, I can update my profile settings anytime
- As a user, I can add CV/background text for personalization
- As a user, I can set and change my training focus

**Endpoints:**
- `GET /api/v1/profile`
- `PUT /api/v1/profile`
- `POST /api/v1/profile/cv`
- `PUT /api/v1/profile/training-focus`

**Tasks:**

### Task S2.1: Create Profile Model
- Create `app/models/profile.py` with Pydantic models:
  - `ProfileCreate` (preparation_type, meeting_subtype, agenda, tone, cv_text, training_focus)
  - `ProfileInDB` (adds user_id, updated_at)
  - `ProfileResponse` (all fields for API response)
  - `TrainingFocus` (title, tags, agenda_template)
- **Manual Test Step:** Import models → create test instance → validate fields
- **User Test Prompt:** "Verify profile models are correctly defined."

### Task S2.2: Create Profile Endpoints Router
- Create `app/api/profile.py` with router
- Add to main app router at `/api/v1/profile`
- **Manual Test Step:** Start backend → check `/docs` → see profile endpoints listed
- **User Test Prompt:** "Visit http://localhost:8000/docs and confirm profile endpoints are visible."

### Task S2.3: Implement Get Profile Endpoint
- Add `GET /api/v1/profile` to `app/api/profile.py`
- Use `get_current_user` dependency (optional - support both auth and local)
- Fetch profile from MongoDB `profiles` collection by `user_id`
- If not found → return default profile structure
- Return full profile object
- **Manual Test Step:** Call endpoint with valid user → receive profile data (or defaults if new user)
- **User Test Prompt:** "Call GET /api/v1/profile and verify you receive profile data."

### Task S2.4: Implement Update Profile Endpoint
- Add `PUT /api/v1/profile` to `app/api/profile.py`
- Accept partial profile updates
- Validate preparation_type is valid enum value
- Update or create profile in MongoDB
- Set `updated_at` timestamp
- Return updated profile
- **Manual Test Step:** Call endpoint with updated preparation_type → fetch profile again → see changes persisted
- **User Test Prompt:** "Update your preparation type via API and verify the change is saved."

### Task S2.5: Implement CV Upload Endpoint
- Add `POST /api/v1/profile/cv` to `app/api/profile.py`
- Accept `{ "cv_text": "...", "redact_pii": true }`
- For MVP: store raw CV text in profile (PII redaction can be enhanced later)
- Return success message
- **Manual Test Step:** POST CV text → fetch profile → see cv_text stored
- **User Test Prompt:** "Upload CV text via API and confirm it's saved in your profile."

### Task S2.6: Implement Training Focus Update
- Add `PUT /api/v1/profile/training-focus` to `app/api/profile.py`
- Accept `{ "title": "...", "tags": [...], "agenda_template": "..." }`
- Update profile's training_focus field
- Update agenda field with agenda_template
- Return updated profile
- **Manual Test Step:** Update training focus → fetch profile → see focus and agenda updated
- **User Test Prompt:** "Set a training focus and verify both focus and agenda are updated."



### Task S2.7: Connect Frontend Profile Page
- Update frontend to call backend profile endpoints
- Replace localStorage profile with API calls
- Test profile page loads with backend data
- **Manual Test Step:** Open frontend profile page → see data loaded from backend → update preparation type → refresh page → changes persist
- **User Test Prompt:** "Open the profile page, make changes, and verify they persist after refresh."

**Definition of Done:**
- Profile CRUD operations work end-to-end via frontend
- Training focus updates both focus and agenda fields
- CV text can be uploaded and stored
- All profile changes persist in MongoDB

**Post-Sprint:**
- Commit with message: "S2: User profile management complete"
- Push to `main` branch

---

## 🧩 S3 – SESSION CREATION AND MANAGEMENT

**Objectives:**
- Implement session CRUD operations
- Store sessions in MongoDB with transcript array
- Support session status transitions (in_progress → completed → archived)
- Enable session listing with filtering

**User Stories:**
- As a user, I can create a new preparation session
- As a user, I can view my session details and transcript
- As a user, I can see a list of all my sessions
- As a user, I can complete or archive sessions

**Endpoints:**
- `POST /api/v1/sessions`
- `GET /api/v1/sessions/{session_id}`
- `GET /api/v1/sessions`
- `POST /api/v1/sessions/{session_id}/complete`
- `DELETE /api/v1/sessions/{session_id}`

**Tasks:**

### Task S3.1: Create Session Model
- Create `app/models/session.py` with Pydantic models:
  - `SessionCreate` (preparation_type, meeting_subtype, context_payload)
  - `SessionInDB` (adds session_id, user_id, transcript, status, created_at, completed_at)
  - `SessionResponse` (all fields for API response)
  - `TranscriptEntry` (role, message, timestamp)
- **Manual Test Step:** Import models → create test instance → validate fields
- **User Test Prompt:** "Verify session models are correctly defined."

### Task S3.2: Implement Create Session Endpoint
- Create `app/api/sessions.py` with router
- Add `POST /api/v1/sessions` endpoint
- Generate UUID for session_id
- Inherit context from user profile if not provided
- Store session in MongoDB `sessions` collection with status "in_progress"
- Return session object with session_id
- **Manual Test Step:** POST to create session → receive session_id → check MongoDB → session exists
- **User Test Prompt:** "Create a new session via API and verify it appears in the database."

### Task S3.3: Implement Get Session Endpoint
- Add `GET /api/v1/sessions/{session_id}` to `app/api/sessions.py`
- Validate user owns the session
- Fetch session from MongoDB
- Return full session object with transcript
- **Manual Test Step:** GET session by ID → receive full session details including transcript
- **User Test Prompt:** "Fetch a session by ID and verify all details are returned."

### Task S3.4: Implement List Sessions Endpoint
- Add `GET /api/v1/sessions` to `app/api/sessions.py`
- Support query params: `?status=completed&limit=10&offset=0`
- Filter sessions by user_id and optional status
- Return paginated list with total count
- **Manual Test Step:** GET sessions list → receive array of sessions → test filtering by status
- **User Test Prompt:** "List your sessions and test filtering by status (completed, in_progress)."

### Task S3.5: Implement Complete Session Endpoint
- Add `POST /api/v1/sessions/{session_id}/complete` to `app/api/sessions.py`
- Validate session has minimum 3 transcript entries
- Update session status to "completed"
- Set completed_at timestamp
- Return updated session
- Note: Evaluation generation will be added in S5
- **Manual Test Step:** Complete a session → check status changed to "completed" → completed_at timestamp set
- **User Test Prompt:** "Mark a session as complete and verify the status updates."

### Task S3.6: Implement Archive Session Endpoint
- Add `DELETE /api/v1/sessions/{session_id}` to `app/api/sessions.py`
- Update session status to "archived" (soft delete)
- Return success message
- **Manual Test Step:** Archive a session → fetch sessions list → archived session not in default list
- **User Test Prompt:** "Archive a session and confirm it no longer appears in your active sessions."

### Task S3.7: Connect Frontend Session Page
- Update frontend to call backend session endpoints
- Replace localStorage session with API calls
- Test session creation flow from profile page
- **Manual Test Step:** Click "Start preparing" on frontend → new session created in backend → session page loads with session_id
- **User Test Prompt:** "Start a new session from the profile page and verify it creates a backend session."

**Definition of Done:**
- Sessions can be created, viewed, listed, completed, and archived
- Session data persists in MongoDB
- Frontend session page works with backend
- Session status transitions work correctly

**Post-Sprint:**
- Commit with message: "S3: Session management complete"
- Push to `main` branch

---

## 🧩 S4 – AI CONVERSATION INTEGRATION

**Objectives:**
- Integrate OpenAI API for AI conversation partner
- Implement turn-based message exchange
- Store transcript in session
- Handle AI response generation with context

**User Stories:**
- As a user, I can send messages during a session and receive AI responses
- As a user, the AI asks contextually relevant questions based on my preparation type
- As a user, the conversation feels natural and adaptive

**Endpoints:**
- `POST /api/v1/sessions/{session_id}/messages`

**Tasks:**

### Task S4.1: Create OpenAI Service Module
- Create `app/services/openai_service.py`
- Implement `OpenAIService` class with:
  - `generate_ai_response(session_context, user_message, transcript_history) -> str`
  - `construct_conversation_prompt(session_context, transcript) -> list[dict]`
- Use `OPENAI_API_KEY` and `OPENAI_MODEL` from config
- **Manual Test Step:** Call service with test message → receive AI response
- **User Test Prompt:** "Test OpenAI service with a sample message and verify response generation."

### Task S4.2: Implement Conversation Prompt Engineering
- Create system prompt template based on preparation_type
- Include session context (agenda, tone, role) in prompt
- Format transcript history for context window
- Handle different preparation types (Interview, Sales, Pitch, etc.)
- **Manual Test Step:** Generate prompt for Interview type → verify it includes behavioral question guidance
- **User Test Prompt:** "Test prompt generation for different preparation types."

### Task S4.3: Implement Send Message Endpoint
- Add `POST /api/v1/sessions/{session_id}/messages` to `app/api/sessions.py`
- Accept `{ "message": "user message text" }`
- Validate session is in_progress
- Fetch session and transcript from MongoDB
- Add user message to transcript
- Call OpenAI service to generate AI response
- Add AI response to transcript
- Update session in MongoDB
- Return `{ "ai_response": "...", "turn_number": 3 }`
- **Manual Test Step:** POST user message → receive AI response → check MongoDB → transcript updated with both messages
- **User Test Prompt:** "Send a message in an active session and verify you receive an AI response."

### Task S4.4: Add Error Handling for OpenAI API
- Handle OpenAI API errors gracefully
- Return user-friendly error messages
- Log errors for debugging
- Implement retry logic for transient failures
- **Manual Test Step:** Simulate API error → receive clear error message → session not corrupted
- **User Test Prompt:** "Test error handling by temporarily using invalid API key."

### Task S4.5: Optimize Conversation Context Window
- Limit transcript history sent to OpenAI (last 10 turns)
- Summarize earlier conversation if needed
- Manage token usage efficiently
- **Manual Test Step:** Create session with 15+ turns → verify only recent turns sent to API
- **User Test Prompt:** "Test a long conversation and verify it doesn't exceed token limits."

### Task S4.6: Connect Frontend Session Interface
- Update frontend session page to call message endpoint
- Display AI responses in real-time
- Handle loading states during AI generation
- **Manual Test Step:** Open session page → type message → click send → see AI response appear
- **User Test Prompt:** "Have a conversation in the session page and verify AI responses appear correctly."

**Definition of Done:**
- Users can send messages and receive AI responses
- Transcript updates in real-time
- AI responses are contextually relevant
- Error handling works gracefully
- Frontend session interface fully functional

**Post-Sprint:**
- Commit with message: "S4: AI conversation integration complete"
- Push to `main` branch

---

## 🧩 S5 – PERFORMANCE EVALUATION SYSTEM

**Objectives:**
- Implement AI-powered performance evaluation
- Generate multi-dimensional scores
- Provide actionable improvement recommendations
- Update user activation state after first evaluation

**User Stories:**
- As a user, I receive detailed feedback after completing a session
- As a user, I see specific areas to improve with practice suggestions
- As a new user, I become activated after my first evaluated session

**Endpoints:**
- `GET /api/v1/evaluations/{evaluation_id}`
- `GET /api/v1/sessions/{session_id}/evaluation`

**Tasks:**

### Task S5.1: Create Evaluation Model
- Create `app/models/evaluation.py` with Pydantic models:
  - `EvaluationInDB` (evaluation_id, session_id, user_id, universal_scores, context_scores, improvement_areas, practice_suggestions, overall_score, created_at)
  - `EvaluationResponse` (all fields for API response)
  - `UniversalScores` (clarity_structure, relevance_focus, confidence_delivery, language_quality, tone_alignment)
- **Manual Test Step:** Import models → create test instance → validate fields
- **User Test Prompt:** "Verify evaluation models are correctly defined."

### Task S5.2: Create Evaluation Service
- Create `app/services/evaluation_service.py`
- Implement `EvaluationService` class with:
  - `generate_evaluation(session) -> Evaluation`
  - `construct_evaluation_prompt(session) -> str`
  - `parse_evaluation_response(ai_response) -> dict`
- Use OpenAI API with structured output
- **Manual Test Step:** Call service with test session → receive structured evaluation
- **User Test Prompt:** "Test evaluation generation with a sample session."

### Task S5.3: Implement Evaluation Prompt Engineering
- Create evaluation prompt template
- Include full transcript and session context
- Request scores for universal dimensions
- Request 2-3 improvement areas with practice suggestions
- Use non-judgmental language
- **Manual Test Step:** Generate evaluation prompt → verify it requests all required fields
- **User Test Prompt:** "Review evaluation prompt template for completeness."

### Task S5.4: Enhance Complete Session Endpoint
- Update `POST /api/v1/sessions/{session_id}/complete` in `app/api/sessions.py`
- After marking session complete, call evaluation service
- Store evaluation in MongoDB `evaluations` collection
- Check if this is user's first completed session
- If first session → update user activation_state to "activated"
- Return session with evaluation_id
- **Manual Test Step:** Complete session → evaluation auto-generated → check MongoDB → evaluation exists → user activation_state updated if first session
- **User Test Prompt:** "Complete your first session and verify you become an activated user."

### Task S5.5: Implement Get Evaluation Endpoints
- Add `GET /api/v1/evaluations/{evaluation_id}` to new `app/api/evaluations.py`
- Add `GET /api/v1/sessions/{session_id}/evaluation`
- Validate user owns the evaluation
- Return full evaluation object
- **Manual Test Step:** GET evaluation by ID → receive scores and improvement areas
- **User Test Prompt:** "Fetch an evaluation and verify all scores and recommendations are present."

### Task S5.6: Create Improvement Plan Service
- Create `app/services/improvement_service.py`
- Implement logic to update user's improvement plan after each evaluation
- Store in MongoDB `improvement_plans` collection
- Track focus areas and priorities
- **Manual Test Step:** Complete session → check improvement plan updated with new focus areas
- **User Test Prompt:** "Complete a session and verify your improvement plan updates."

### Task S5.7: Connect Frontend Session Review
- Update frontend to fetch evaluation after session completion
- Display scores, strengths, and improvement areas
- Show practice suggestions
- **Manual Test Step:** Complete session on frontend → see evaluation results displayed → scores and improvements visible
- **User Test Prompt:** "Complete a session and verify the evaluation results appear correctly."

**Definition of Done:**
- Evaluations auto-generate when sessions complete
- Multi-dimensional scoring works correctly
- Improvement recommendations are actionable
- User activation state transitions after first session
- Frontend displays evaluation results

**Post-Sprint:**
- Commit with message: "S5: Performance evaluation system complete"
- Push to `main` branch

---

## 🧩 S6 – SESSION HISTORY AND ANALYTICS

**Objectives:**
- Implement session history with trends
- Calculate performance metrics over time
- Display improvement velocity and recurring patterns
- Support filtering and search

**User Stories:**
- As an activated user, I can view my session history
- As an activated user, I can see my performance trends over time
- As an activated user, I can identify recurring improvement areas
- As an activated user, I can track my progress

**Endpoints:**
- `GET /api/v1/history`
- `GET /api/v1/improvements`
- `GET /api/v1/analytics/trends`

**Tasks:**

### Task S6.1: Create Analytics Service
- Create `app/services/analytics_service.py`
- Implement `AnalyticsService` class with:
  - `calculate_trends(user_id) -> dict`
  - `calculate_improvement_velocity(evaluations) -> float`
  - `identify_recurring_weaknesses(evaluations) -> list[str]`
- **Manual Test Step:** Call service with test user → receive trend data
- **User Test Prompt:** "Test analytics calculation with sample data."

### Task S6.2: Implement History Endpoint
- Create `app/api/history.py` with router
- Add `GET /api/v1/history` endpoint
- Fetch all completed sessions for user
- Include evaluation summaries
- Calculate aggregate metrics (total sessions, avg score)
- Support pagination with limit/offset
- **Manual Test Step:** GET history → receive list of sessions with scores → pagination works
- **User Test Prompt:** "View your session history and verify all completed sessions appear."

### Task S6.3: Implement Improvements Endpoint
- Add `GET /api/v1/improvements` to `app/api/history.py`
- Fetch user's current improvement plan
- Return focus areas with priorities
- Include recommendations from latest evaluation
- **Manual Test Step:** GET improvements → receive current focus areas and recommendations
- **User Test Prompt:** "Fetch your improvement recommendations and verify they match your latest evaluation."

### Task S6.4: Implement Trends Endpoint
- Add `GET /api/v1/analytics/trends` to `app/api/history.py`
- Calculate dimension trends over time
- Compute improvement velocity
- Identify recurring weaknesses
- Return trend data for visualization
- **Manual Test Step:** GET trends → receive dimension scores over time → improvement velocity calculated
- **User Test Prompt:** "View your performance trends and verify the data makes sense."

### Task S6.5: Create Rollup Metrics Collection
- Implement background update of `rollup_metrics` collection
- Update after each evaluation
- Store pre-calculated metrics for fast retrieval
- **Manual Test Step:** Complete session → check rollup_metrics updated
- **User Test Prompt:** "Complete a session and verify metrics update in the database."

### Task S6.6: Connect Frontend Profile Page (Activated State)
- Update frontend profile page to show history for activated users
- Display recent sessions with scores
- Show improvement recommendations
- Display progress metrics (sessions this week, avg score, trend)
- **Manual Test Step:** Open profile page as activated user → see recent sessions → see improvement cards → see progress metrics
- **User Test Prompt:** "View your profile as an activated user and verify all sections display correctly."

### Task S6.7: Implement Session Search and Filtering
- Add search/filter support to history endpoint
- Filter by preparation_type, date range, score range
- Sort by date, score, or type
- **Manual Test Step:** GET history with filters → receive filtered results
- **User Test Prompt:** "Filter your session history by type and date range."

**Definition of Done:**
- Session history displays all completed sessions
- Performance trends calculated correctly
- Improvement recommendations visible
- Frontend profile page shows activated user state
- Filtering and search work correctly

**Post-Sprint:**
- Commit with message: "S6: Session history and analytics complete"
- Push to `main` branch

---

## ✅ FINAL CHECKLIST

**Before Deployment:**
- [ ] All sprints completed and tested
- [ ] All manual tests passed via frontend UI
- [ ] MongoDB Atlas connection stable
- [ ] Environment variables documented
- [ ] `.gitignore` excludes sensitive files
- [ ] All code pushed to `main` branch
- [ ] README.md created with setup instructions
- [ ] API documentation available at `/docs`

**Post-MVP Enhancements (Future):**
- CV parsing with PII redaction
- Magic link authentication
- WebSocket for real-time AI responses
- Audio/video session recording
- Advanced analytics dashboard
- Team/organization features
- Calendar integration

---

## 📚 APPENDIX: FRONTEND-BACKEND MAPPING

### Landing Page (`/`)
- **Backend:** None (static content)
- **Status:** No changes needed

### Profile Page (`/profile`)
- **Backend Endpoints:**
  - `GET /api/v1/profile` — Load profile
  - `PUT /api/v1/profile` — Update profile
  - `PUT /api/v1/profile/training-focus` — Update focus
  - `GET /api/v1/sessions?status=completed&limit=3` — Recent sessions
  - `GET /api/v1/improvements` — Improvement recommendations
  - `GET /api/v1/analytics/trends` — Progress metrics
- **Frontend Changes:**
  - Replace `useProfile` hook localStorage calls with API calls
  - Add loading states for API requests
  - Handle authentication (optional)

### Session Page (`/session/[id]`)
- **Backend Endpoints:**
  - `POST /api/v1/sessions` — Create session
  - `GET /api/v1/sessions/{id}` — Load session
  - `POST /api/v1/sessions/{id}/messages` — Send message
  - `POST /api/v1/sessions/{id}/complete` — Complete session
- **Frontend Changes:**
  - Replace demo session with real API calls
  - Add message sending functionality
  - Display AI responses in real-time
  - Handle session completion flow

### Session Review (Modal in Profile)
- **Backend Endpoints:**
  - `GET /api/v1/sessions/{id}/evaluation` — Load evaluation
- **Frontend Changes:**
  - Fetch evaluation after session completion
  - Display scores and improvements
  - Handle "Practice focus" button to update training focus

---

**END OF BACKEND DEVELOPMENT PLAN**
