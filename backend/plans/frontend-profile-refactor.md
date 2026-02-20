# Frontend Profile Page Refactor Plan

This plan details the steps to refactor the `app/profile/page.tsx` file and implement the "New" vs. "Activated" user journey as defined in `SITEMAP_AND_JOURNEYS.md`.

**Clarification on "Profile":** In this application, "Profile" refers to the **Preparation Profile** (Company/Product context & User Role), not generic account settings. The `/profile` page acts as the central dashboard for managing this context and launching sessions.

## 1. Component Extraction & Restructuring

The current `app/profile/page.tsx` is monolithic. We will break it down into smaller, reusable components located in `components/profile/`.

### New Component Structure (`components/profile/`)

| Component | Description |
|-----------|-------------|
| `PreparationInputs.tsx` | The form for selecting prep type, subtype, agenda, tone, and context. This is the core "Profile" input. Used in "New" state and within the accordion in "Activated" state. |
| `ActivatedSummaryStrip.tsx` | The top stats bar showing session count, average score, and current training focus. Only visible in "Activated" state. |
| `SessionList.tsx` | Displays the list of recent sessions. Replaces the inline "Recent sessions" map. Needs to handle empty states gracefully. |
| `ImprovementCard.tsx` | Displays individual improvement suggestions. |
| `SessionSetupAccordion.tsx` | Collapsible container for `PreparationInputs` in the "Activated" view. |
| `SessionModal.tsx` | The detailed view popup for a past session. |
| `ExampleModal.tsx` | The popup for showing improvement examples. |
| `TopBar.tsx` | The navigation header specific to the profile page. |

## 2. State Management & Logic

### User Activation State
- **Source**: The `useProfile` hook already provides `profile.activationState`.
- **Logic**:
  - If `activationState === 'new'`: Render `PreparationInputs` directly.
  - If `activationState === 'activated'`: Render `ActivatedSummaryStrip`, `ImprovementCard` list, `SessionList`, and the `SessionSetupAccordion`.
- **Transition**: The backend updates `activation_state` automatically after the first session is completed. The frontend needs to reflect this change (likely by refreshing the profile after session completion).

### Data Integration
- **Sessions**: Replace mock `mockSessions` with real data from the backend API (`GET /sessions`).
  - **Action**: Update `useProfile` or create a dedicated `useSessions` hook to fetch this data.
- **Improvements**: Currently hardcoded. We will keep them hardcoded for now (as per current implementation) but move them to a constant file or keep them in the parent component, preparing for future dynamic generation.

## 3. Implementation Steps

### Step 1: Create Component Files
Create the following files in `components/profile/` and move the corresponding code from `page.tsx`:
- `components/profile/TopBar.tsx`
- `components/profile/PreparationInputs.tsx`
- `components/profile/ActivatedSummaryStrip.tsx`
- `components/profile/SessionList.tsx` (Extract from "Recent sessions" section)
- `components/profile/ImprovementCard.tsx`
- `components/profile/SessionSetupAccordion.tsx`
- `components/profile/SessionModal.tsx`
- `components/profile/ExampleModal.tsx`

### Step 2: Refactor `app/profile/page.tsx`
- Import the new components.
- Simplify the main `ProfilePageContent` component to orchestrate the layout based on `isActivated`.
- Ensure all props are correctly passed (especially `updateProfile`, `profile` state, and event handlers).

### Step 3: Connect Real Session Data
- **Update Hook**: Ensure `useProfile` or a new hook fetches the user's actual session history.
- **Pass Data**: Pass the real sessions list to the `SessionList` component.
- **Stats Calculation**: Update `ActivatedSummaryStrip` to calculate stats (sessions this week, avg score) from the real session data instead of hardcoded values.

### Step 4: Verify "Start Session" Flow
- Ensure the "Start preparing" / "Start new session" button works in both views.
- Verify it calls `sessionApi.createSession` with the correct payload from `PreparationInputs`.
- Verify redirection to `/session/[id]`.

## 4. Proposed File Structure

```
frontend/
  app/
    profile/
      page.tsx          # Orchestrator
  components/
    profile/
      ActivatedSummaryStrip.tsx
      ExampleModal.tsx
      ImprovementCard.tsx
      PreparationInputs.tsx
      QuickAccessLinks.tsx # (Existing, check if needed)
      SessionList.tsx
      SessionModal.tsx
      SessionSetupAccordion.tsx
      TopBar.tsx
```

## 5. Mock vs. Real Data Plan

| Data Point | Source | Plan |
|------------|--------|------|
| **User Profile** | `useProfile` | Already connected. |
| **Sessions List** | `mockSessions` -> API | **Connect to API**. Fetch user's sessions. |
| **Stats (Strip)** | Hardcoded -> Derived | **Derive**. Calculate "Sessions this week" and "Avg Score" from the fetched sessions list. |
| **Improvements** | Hardcoded | **Keep Hardcoded**. Dynamic generation is a future scope item. |
| **Trend Dots** | Hardcoded | **Derive**. Generate sparkline data from the last 5 session scores. |
