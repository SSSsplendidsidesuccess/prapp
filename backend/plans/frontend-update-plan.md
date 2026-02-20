# Frontend Update Plan: Profile & Sales Call Prep

## 1. Overview
This plan outlines the steps to update the frontend to align with the new "Profile" concept defined in `SITEMAP_AND_JOURNEYS.md`. The goal is to transform the Profile page into a central dashboard that adapts to the user's "activation state" (New vs. Activated) and guides them through the Sales Call Prep journey.

## 2. Key Objectives
-   **Central Dashboard:** Make `/profile` the main landing page after login.
-   **Activation State Logic:** Implement distinct views for "New" users (onboarding focus) and "Activated" users (performance focus).
-   **Real Data Integration:** Replace mock data with real data from the backend (User Profile, Sessions).
-   **Navigation:** Ensure smooth navigation to `Sales Setup`, `Talk Points`, and `Knowledge Base`.

## 3. Detailed Tasks

### Phase 1: Component Refactoring & Cleanup
*   [ ] **Extract Profile Components:** Move inline components from `app/profile/page.tsx` to dedicated files in `components/profile/` for better maintainability.
    *   `PreparationInputs.tsx`
    *   `ActivatedSummaryStrip.tsx`
    *   `ImprovementCard.tsx`
    *   `SessionSetupAccordion.tsx`
    *   `SessionList.tsx` (New component for the session list)
*   [ ] **Standardize Navigation:** Ensure the `TopBar` or a global layout provides access to `Talk Points` and `Knowledge Base`.

### Phase 2: State Management & Data Fetching
*   [ ] **Update `useProfile` Hook:** Ensure it correctly fetches the user's `activation_state` and other profile details from the backend (`GET /users/profile`).
*   [ ] **Integrate Real Session Data:**
    *   Update the `mockSessions` in `app/profile/page.tsx` to fetch real sessions from the backend using `sessionApi.getSessions()` (or similar).
    *   Display actual scores, dates, and types.
*   [ ] **Integrate "Next Improvements":**
    *   *Note:* The backend currently doesn't seem to return "Next Improvements" directly. For now, we might need to derive this from recent session evaluations or keep using a static set that rotates based on recent performance (as a placeholder until backend support is added). **Decision: Keep static/client-side logic for now.**

### Phase 3: "New" User Experience (Onboarding)
*   [ ] **Refine `PreparationInputs`:**
    *   Ensure the form correctly saves the "Preparation Type" and "Subtype" to the user's profile (or local state for the session start).
    *   The "Start preparing" action should ideally redirect to `/sales-setup` for a full setup OR directly create a session if it's a "Quick Start". The sitemap says: *Profile -> Start preparing -> Active Session*.
    *   *Correction based on Sitemap:* Journey A says "New User View -> PreparationInputs -> Start preparing -> Active Session". So it skips `/sales-setup` for the *very first* quick run.
    *   Ensure `handleStartSession` in `app/profile/page.tsx` correctly creates a session and redirects to `/session/[id]`.

### Phase 4: "Activated" User Experience (Dashboard)
*   [ ] **Implement `ActivatedSummaryStrip` Logic:**
    *   Calculate "Weekly Sessions" count from the real session list.
    *   Calculate "Avg Score" from the real session list.
    *   *Note:* "Training Focus" might need to be stored in the user profile or local storage if not supported by backend yet.
*   [ ] **Implement `SessionSetupAccordion`:**
    *   This serves as a "Quick Start" for repeat users. Ensure it pre-fills with the last used settings or the user's default preferences.

### Phase 5: Navigation & consistency
*   [ ] **Update `QuickAccessLinks`:** Ensure it aligns with the "TopBar" navigation items mentioned in the sitemap (`Talk Points`, `Knowledge Base`).
*   [ ] **Check Routes:** Verify that `/sales-setup`, `/talk-points`, and `/knowledge-base` exist and are accessible.

## 4. Dependencies
*   Backend `GET /sessions` endpoint (assumed to exist or needs verification).
*   Backend `GET /users/profile` (exists).

## 5. Next Steps
1.  Approve this plan.
2.  Switch to **Code Mode**.
3.  Execute the refactoring and integration tasks.
