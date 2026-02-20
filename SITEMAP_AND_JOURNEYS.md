# Prapp Sitemap and User Journeys

This document serves as the source of truth for the application structure, page purposes, and key user workflows for the Sales Call Prep platform (Prapp).

## 1. Sitemap Structure

### Public Pages
- **`/`**: Landing Page (Marketing)
- **`/login`**: User Authentication
- **`/signup`**: New User Registration
- **`/forgot-password`**: Password Recovery Request
- **`/reset-password`**: Password Reset Completion

### Protected Pages (App Core)
- **`/dashboard` (formerly `/profile`)**: Main User Dashboard - The central mission control for daily sales prep activities.
- **`/profile`**: User Settings - Account management, subscription, and sales persona configuration.
- **`/sales-setup`**: Session Configuration - Detailed setup for a new sales practice session.
- **`/session/[id]`**: Active Session Interface - The live roleplay interface and post-session evaluation.
- **`/talk-points`**: Battlecard Generator - Tool to generate and manage objection killers and talking points.
- **`/knowledge-base`**: Sales Enablement (RAG) - Interface to upload product specs, case studies, and competitor info.

---

## 2. Page Inventory & Components

### `/dashboard` (Main Hub)
**Purpose:** The "Mission Control" for the sales rep. Adapts based on the user's "activation state" to guide them from their first practice to daily habit formation.
**Architecture:** Modular component-based design with extracted components in `components/profile/`.
**Key Components:**
- **TopBar:** Navigation to `Talk Points`, `Knowledge Base`, and `Profile` (Settings).
- **Activation State Logic:**
    - **New User View:** Shows `SalesPrepQuickStart` (formerly PreparationInputs) to get them into a roleplay immediately.
        - **Inputs:** Deal Type (Discovery, Closing, Negotiation), Subtype, Tone, Agenda.
        - **Dynamic Text:** All placeholders adapt to selected sales scenario.
    - **Activated View:**
        - **`SalesPerformanceStrip`** (formerly ActivatedSummaryStrip): Dashboard showing "Deals Practiced", "Win Rate (Avg Score)", and "Current Training Focus" (e.g., Objection Handling).
        - **`CoachSuggestions`** (formerly ImprovementCard): AI-driven suggestions like "Practice Price Negotiation for Enterprise Deals".
        - **`QuickPrepAccordion`** (formerly SessionSetupAccordion): One-click access to start a new session.
- **Session List:** "Recent Practice Sessions" with deal types and scores.

### `/profile` (Settings)
**Purpose:** Configuration area for user account and persistent preferences.
**Key Components:**
- **Account Details:** Name, Email, Password reset.
- **Sales Persona Config:**
    - "My Role" (e.g., AE, SDR, CSM).
    - "My Industry" (e.g., SaaS, Pharma).
    - "Default Methodology" (e.g., MEDDIC, SPIN, Challenger).
- **Subscription Management:** Plan details and billing.

### `/sales-setup` (Deep Dive Setup)
**Purpose:** Advanced configuration for high-stakes deal preparation. More detailed than the dashboard quick start.
**Key Components:**
- **Deal Context Form:**
    - **Customer Name & Industry.**
    - **Deal Value & Stage.**
    - **Key Decision Makers** (Buyer Personas).
- **Battlecard Selector:** Option to load specific documents from Knowledge Base.
- **Scenario Builder:** "What's the hardest objection you expect?" input.

### `/session/[id]` (The Dojo)
**Purpose:** The core interactive roleplay experience and feedback loop.
**Key Components:**
- **Live Roleplay View:**
    - **AI Customer Persona:** Simulates the specific buyer (e.g., "Skeptical CFO").
    - **Live Feedback:** (Future) Real-time hints like "Slow down" or "Ask an open-ended question".
    - **RAG Citations:** "Referenced [Product Spec v2] for pricing answer".
- **Evaluation View (Post-Call):**
    - **Sales Scorecard:** Grades on Discovery, Empathy, Objection Handling, and Closing.
    - **Deal Probability:** AI estimation of deal success based on the practice.
    - **Action Plan:** "3 things to do in the real call".

### `/talk-points` (Battlecards)
**Purpose:** Rapid generation of "Cheat Sheets" for live calls.
**Key Components:**
- **Objection Killer Generator:** Input an objection ("Your price is too high"), get 3 data-backed responses.
- **Value Prop Generator:** Generate pitch points for specific buyer personas.
- **Saved Battlecards:** Library of previously generated points.

### `/knowledge-base` (Sales Enablement)
**Purpose:** The "Brain" of the sales assistant. Storage for company-specific knowledge.
**Key Components:**
- **Upload Zone:** Drag-and-drop for PDF/DOCX (Product Specs, Pricing Sheets, Competitor Analysis).
- **Document Manager:** List of active knowledge sources.
- **Processing Status:** Indicator of RAG indexing progress.

---

## 3. User Journeys

### Journey A: The "Morning Warm-up" (Daily Habit)
*Goal: Get into the "zone" before calls start.*
1.  **Login**: Rep logs in to `/dashboard`.
2.  **Quick Start**: Sees "Handle Objections" as current training focus.
3.  **One-Click Prep**: Clicks "Practice Now" on the suggestion card.
4.  **Micro-Session**: Does a 5-minute roleplay handling "We have no budget".
5.  **Feedback**: Gets a score of 85/100 and one tip ("Acknowledge before countering").
6.  **Done**: Returns to dashboard, streak counter increases.

### Journey B: The "Big Deal" Prep (Deep Dive)
*Goal: Prepare for a specific, high-stakes Enterprise closing call.*
1.  **Enablement**: Goes to `/knowledge-base`, uploads the specific client's RFP document.
2.  **Setup**: Navigates to `/sales-setup`.
3.  **Context**: Enters "Acme Corp", "Closing Stage", "Role: CTO (Technical & Skeptical)".
4.  **Simulation**:
    - AI acts as the CTO, drilling into technical security questions from the uploaded RFP.
    - Rep practices navigating these questions.
5.  **Review**: Post-session analysis highlights a weak answer on "Data Sovereignty".
6.  **Refine**: Rep generates specific `/talk-points` for "Data Sovereignty" to keep on screen during the real call.

### Journey C: New Rep Onboarding
*Goal: Assess baseline skills.*
1.  **Signup**: Rep creates account.
2.  **Dashboard (New)**: Lands on `/dashboard` (New State).
3.  **Assessment**: Prompted to "Take Baseline Assessment".
4.  **Scenario**: Runs through a standard "Discovery Call" scenario.
5.  **Placement**: System rates them as "Intermediate" and sets initial Training Focus to "Closing Techniques".
6.  **Activation**: Dashboard transforms to Activated state with personalized plan.
