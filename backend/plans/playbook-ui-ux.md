# Playbook UI/UX Flow & Component Design

## 1. User Journey

### A. Creating a New Playbook
1. **Entry**: User clicks "Create Playbook" on Dashboard.
2. **Wizard Step 1 (Basics)**: Input Name, Target Persona, Industry, Product Line.
3. **Wizard Step 2 (Structure)**: 
   - AI suggests a list of relevant Scenarios (e.g., "Intro Call", "Demo", "Negotiation").
   - User selects/deselects scenarios.
4. **Completion**: System creates the Playbook shell and redirects to the Editor.

### B. Building a Scenario
1. **Selection**: User selects "Discovery Call" scenario from the left sidebar.
2. **Context Setup**: User refines the "Meeting Context" and "Competitors" fields.
3. **Generation**: User clicks "Generate Content" for the whole scenario OR specific sections.
   - System shows a loading state ("Analyzing knowledge base...", "Drafting content...").
4. **Refinement**: User reviews the generated "Opening Strategy" and "Discovery Questions".
   - Edits text directly.
   - Regenerates specific sections with new instructions (e.g., "Make it more aggressive").
5. **Saving**: Auto-save or manual "Save Changes".

### C. Using a Playbook
1. **Library**: User browses playbooks.
2. **View Mode**: User opens a playbook in "Read Mode" (clean, document-like interface).
3. **Export**: User downloads as PDF for offline use.

## 2. Frontend Components (React/Next.js)

### Core Pages
- `app/playbooks/page.tsx`: Library view.
- `app/playbooks/new/page.tsx`: Creation wizard.
- `app/playbooks/[id]/page.tsx`: Main builder/editor interface.

### Key Components

#### `PlaybookLayout`
- **Props**: `playbook: Playbook`
- **Description**: Wrapper with sidebar navigation and header actions (Save, Export).

#### `ScenarioNavigator`
- **Props**: `scenarios: Scenario[]`, `activeId: string`
- **Description**: Sidebar list with drag-and-drop reordering.

#### `ScenarioEditor`
- **Props**: `scenario: Scenario`
- **Description**: Main form for a scenario. Contains sub-components for sections.

#### `ContentSectionEditor`
- **Props**: `section: ContentSection`, `onUpdate: (data) => void`
- **Description**: A composite component rendering editors for each field in `ContentSection`.
  - `RichTextEditor` for "Opening Strategy".
  - `ListEditor` for "Key Messages" and "Discovery Questions".
  - `ObjectionEditor` for "Objection Handling" (list of pair fields).

#### `AIGenerationPanel`
- **Props**: `context: any`, `onGenerate: (data) => void`
- **Description**: Floating or inline panel to trigger AI generation. Includes "Tone" and "Focus" inputs.

## 3. State Management
- Use `React Query` for fetching/caching playbooks.
- Use local state (or `Zustand`) for the active editing session to prevent constant re-fetching during typing.
- Optimistic updates for "Add/Remove Scenario".
