# Frontend Integration Plan
## Sales Call Prep Platform - Frontend Changes Required

**Document Version:** 1.0  
**Date:** 2026-02-19  
**Backend API Routes:** 34 endpoints ready  
**Target:** Next.js/React/TypeScript frontend

---

## Executive Summary

This document outlines all frontend changes required to integrate with the new Sales Call Prep backend. The backend has been successfully pivoted from Interview Prep to Sales Call Prep with complete RAG (Retrieval Augmented Generation) capabilities across 4 sprints (S0-S3).

**Key Changes:**
- 2 existing pages need updates
- 2 new pages need to be created
- 6 new components need to be built
- 4 new API service modules needed
- Sales-specific UI/UX enhancements throughout

---

## 1. Changes to Existing Pages

### 1.1 Profile Page (`app/profile/page.tsx`)

**Current State:** 927 lines, handles session setup for Interview prep  
**Status:** ⚠️ Needs Major Updates

#### Required Changes:

##### A. Add Sales-Specific Session Setup Fields

**Location:** Inside `SessionSetupAccordion` component (lines 370-439)

**New Fields to Add:**
```typescript
// Add to session setup form when preparation_type === "Sales"
interface SalesSessionFields {
  customer_name: string;        // Required
  customer_persona: string;     // Required (textarea)
  deal_stage: DealStage;       // Required (dropdown)
}

enum DealStage {
  PROSPECTING = "Prospecting",
  DISCOVERY = "Discovery",
  QUALIFICATION = "Qualification",
  PROPOSAL = "Proposal",
  NEGOTIATION = "Negotiation",
  CLOSING = "Closing",
  FOLLOW_UP = "Follow-up"
}
```

**UI Implementation:**
- Show these fields conditionally when `profile.preparationType === "Sales"`
- Add after existing "Meeting Details" section
- Use same Card styling as existing sections
- Customer Name: Text input (max 100 chars)
- Customer Persona: Textarea (max 500 chars, placeholder: "Describe the customer's role, pain points, and priorities...")
- Deal Stage: Dropdown select with 7 options

**API Integration:**
- Update `handleStartSession()` function (line 613)
- Include sales fields in session creation payload:
```typescript
const sessionPayload = {
  preparation_type: profile.preparationType,
  setup: {
    meeting_details: profile.meetingDetails,
    agenda: profile.agenda,
    tone: profile.tone,
    background_context: profile.backgroundContext,
    // Add sales-specific fields
    ...(profile.preparationType === "Sales" && {
      customer_name: profile.customerName,
      customer_persona: profile.customerPersona,
      deal_stage: profile.dealStage
    })
  }
};
```

##### B. Add Company Profile Section

**Location:** New section before "Preparation Inputs" (before line 158)

**Purpose:** Capture company/product information for RAG context

**Fields:**
```typescript
interface CompanyProfile {
  name: string;              // Company name
  description: string;       // Company description
  value_proposition: string; // Value proposition
  industry: string;          // Industry
}
```

**UI Implementation:**
- New collapsible Card section titled "Company Profile"
- Show for all users (not just Sales)
- 4 input fields with labels
- Save to user profile via PATCH `/api/v1/users/profile`
- Load on page mount from user profile

##### C. Add Knowledge Base Management Section

**Location:** New section after "Company Profile"

**Purpose:** Quick access to document management from profile page

**Features:**
- Display document count badge
- "Manage Knowledge Base" button → navigates to `/knowledge-base`
- Show last 3 uploaded documents with:
  - Document name
  - Upload date
  - Status badge (Processing/Indexed/Failed)
- "Upload Document" quick action button

**API Integration:**
- GET `/api/v1/documents?limit=3&skip=0` on page load
- Display loading skeleton while fetching

##### D. Add Talk Points Section

**Location:** New section after "Knowledge Base Management"

**Purpose:** Quick access to talk points generation

**Features:**
- "Generate Talk Points" button
- Show last 3 generated talk points with:
  - Topic
  - Generated date
  - Preview (first 50 chars)
- "View All Talk Points" button → navigates to `/talk-points`

**API Integration:**
- GET `/api/v1/talk-points?limit=3&skip=0` on page load
- POST `/api/v1/talk-points/generate` when clicking "Generate Talk Points"

---

### 1.2 Session Chat Page (`app/session/[id]/page.tsx`)

**Current State:** 435 lines, handles chat interface and evaluation display  
**Status:** ⚠️ Needs Moderate Updates

#### Required Changes:

##### A. Display RAG Context in Messages

**Location:** Message rendering section (lines 350-374)

**Purpose:** Show which documents were used to generate AI responses

**Implementation:**
```typescript
// Update ChatMessage interface
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  retrieved_context_ids?: string[]; // New field
}

// In message rendering
{msg.role === "assistant" && msg.retrieved_context_ids && msg.retrieved_context_ids.length > 0 && (
  <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
    <svg className="w-3 h-3" /* book icon */>
    <span>Used {msg.retrieved_context_ids.length} document(s) from knowledge base</span>
    <button 
      className="text-amber-400 hover:text-amber-300"
      onClick={() => setShowContextModal(msg.retrieved_context_ids)}
    >
      View sources
    </button>
  </div>
)}
```

**New Component Needed:**
- `ContextSourcesModal`: Display list of documents used
  - Fetch document details via GET `/api/v1/documents/{id}`
  - Show document name, relevant excerpt
  - Link to full document in knowledge base

##### B. Enhanced Evaluation Display for Sales

**Location:** Evaluation section (lines 266-303)

**Purpose:** Show sales-specific evaluation metrics

**Current Display:**
- Overall score
- Strengths (list)
- Improvement areas (list)

**New Display for Sales Sessions:**
```typescript
interface SalesEvaluation {
  // Existing fields
  overall_score: number;
  strengths: string[];
  improvement_areas: string[];
  
  // New sales-specific fields
  dimension_scores: {
    product_knowledge: number;
    customer_understanding: number;
    objection_handling: number;
    value_communication: number;
    question_quality: number;
    confidence_delivery: number;
  };
  
  sales_specific: {
    knowledge_base_usage: string;
    stage_appropriateness: string;
    personalization: string;
  };
}
```

**UI Implementation:**
- Add "Sales Performance Breakdown" section
- Display 6 dimension scores as progress bars with labels
- Add "Sales-Specific Insights" section with 3 text blocks
- Use amber color scheme for sales metrics
- Add tooltips explaining each dimension

##### C. Add Session Context Display

**Location:** Top of chat area (after session header)

**Purpose:** Show sales session context for reference during chat

**Display (for Sales sessions only):**
```typescript
<div className="bg-slate-900/50 border border-amber-400/20 rounded-lg p-4 mb-4">
  <div className="grid grid-cols-3 gap-4 text-sm">
    <div>
      <span className="text-slate-400">Customer:</span>
      <span className="text-white ml-2">{session.customer_name}</span>
    </div>
    <div>
      <span className="text-slate-400">Deal Stage:</span>
      <span className="text-amber-400 ml-2">{session.deal_stage}</span>
    </div>
    <div>
      <span className="text-slate-400">Documents:</span>
      <span className="text-white ml-2">{documentCount} available</span>
    </div>
  </div>
  <div className="mt-2">
    <span className="text-slate-400 text-xs">Customer Persona:</span>
    <p className="text-slate-300 text-sm mt-1">{session.customer_persona}</p>
  </div>
</div>
```

---

## 2. New Pages to Create

### 2.1 Knowledge Base Page (`app/knowledge-base/page.tsx`)

**Purpose:** Complete document management interface  
**Estimated Lines:** ~600 lines  
**Priority:** 🔴 High

#### Features:

##### A. Document Upload Section
- Drag-and-drop file upload zone
- Support: PDF, DOCX, PPTX, TXT
- Multiple file upload
- Upload progress indicators
- File size validation (max 10MB per file)

##### B. Document List
- Table view with columns:
  - Name (clickable to view)
  - Type (icon + extension)
  - Size
  - Upload Date
  - Status (badge: Processing/Indexed/Failed)
  - Actions (View, Delete)
- Pagination (20 per page)
- Search/filter by name
- Sort by date/name/size

##### C. Document Viewer Modal
- Display document metadata
- Show extracted text preview
- Display chunk count
- Show indexing status
- Delete confirmation

##### D. Empty State
- Illustration + message when no documents
- "Upload Your First Document" CTA

#### API Integration:

```typescript
// Upload
POST /api/v1/documents/upload
Content-Type: multipart/form-data
Body: { file: File }

// List
GET /api/v1/documents?limit=20&skip=0

// Get Single
GET /api/v1/documents/{id}

// Delete
DELETE /api/v1/documents/{id}
```

#### Components Needed:
1. `DocumentUploadZone` - Drag-and-drop upload
2. `DocumentTable` - List view with actions
3. `DocumentViewerModal` - Document details
4. `DocumentStatusBadge` - Status indicator
5. `DeleteConfirmationModal` - Delete confirmation

---

### 2.2 Talk Points Page (`app/talk-points/page.tsx`)

**Purpose:** Generate and manage sales talk points  
**Estimated Lines:** ~500 lines  
**Priority:** 🔴 High

#### Features:

##### A. Talk Points Generator
- Input section:
  - Topic (text input, required)
  - Customer Context (textarea, optional)
  - Deal Stage (dropdown, optional)
- "Generate Talk Points" button
- Loading state with progress indicator
- Generation takes 5-10 seconds

##### B. Generated Talk Points Display
- 7-section format:
  1. Opening Hook
  2. Problem Statement
  3. Solution Overview
  4. Key Benefits
  5. Proof Points
  6. Objection Handling
  7. Call to Action
- Each section in expandable card
- Copy to clipboard button per section
- Copy all button
- Export as PDF/DOCX button
- Save to history

##### C. Talk Points History
- List of previously generated talk points
- Card view with:
  - Topic
  - Generated date
  - Preview (first 100 chars)
  - Actions (View, Delete)
- Pagination (10 per page)
- Search by topic

##### D. Empty State
- Illustration + message when no talk points
- "Generate Your First Talk Points" CTA

#### API Integration:

```typescript
// Generate
POST /api/v1/talk-points/generate
Body: {
  topic: string;
  customer_context?: string;
  deal_stage?: string;
}

// List
GET /api/v1/talk-points?limit=10&skip=0

// Get Single
GET /api/v1/talk-points/{id}

// Delete
DELETE /api/v1/talk-points/{id}
```

#### Components Needed:
1. `TalkPointsGenerator` - Input form
2. `TalkPointsDisplay` - 7-section display
3. `TalkPointsCard` - History card view
4. `TalkPointsExporter` - Export functionality

---

## 3. New Components to Create

### 3.1 Shared Components (`app/components/`)

#### A. `DocumentUploadZone.tsx`
**Purpose:** Reusable drag-and-drop file upload  
**Props:**
```typescript
interface DocumentUploadZoneProps {
  onUpload: (files: File[]) => Promise<void>;
  acceptedTypes: string[];
  maxSize: number;
  multiple?: boolean;
}
```

#### B. `DocumentStatusBadge.tsx`
**Purpose:** Display document processing status  
**Props:**
```typescript
interface DocumentStatusBadgeProps {
  status: "processing" | "indexed" | "failed";
  size?: "sm" | "md" | "lg";
}
```

#### C. `ContextSourcesModal.tsx`
**Purpose:** Display RAG context sources  
**Props:**
```typescript
interface ContextSourcesModalProps {
  documentIds: string[];
  onClose: () => void;
}
```

#### D. `SalesSessionSetup.tsx`
**Purpose:** Sales-specific session setup fields  
**Props:**
```typescript
interface SalesSessionSetupProps {
  customerName: string;
  customerPersona: string;
  dealStage: DealStage;
  onChange: (field: string, value: string) => void;
}
```

#### E. `SalesEvaluationDisplay.tsx`
**Purpose:** Enhanced evaluation display for sales  
**Props:**
```typescript
interface SalesEvaluationDisplayProps {
  evaluation: SalesEvaluation;
}
```

#### F. `CompanyProfileForm.tsx`
**Purpose:** Company profile input form  
**Props:**
```typescript
interface CompanyProfileFormProps {
  profile: CompanyProfile;
  onChange: (profile: CompanyProfile) => void;
  onSave: () => Promise<void>;
}
```

---

## 4. API Service Modules

### 4.1 Create `lib/api/documents.ts`

```typescript
export const documentsApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData
    });
    
    return response.json();
  },
  
  list: async (limit = 20, skip = 0) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/documents?limit=${limit}&skip=${skip}`,
      {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      }
    );
    
    return response.json();
  },
  
  get: async (id: string) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/documents/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      }
    );
    
    return response.json();
  },
  
  delete: async (id: string) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/documents/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      }
    );
    
    return response.json();
  }
};
```

### 4.2 Create `lib/api/talkPoints.ts`

```typescript
export const talkPointsApi = {
  generate: async (data: {
    topic: string;
    customer_context?: string;
    deal_stage?: string;
  }) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/talk-points/generate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );
    
    return response.json();
  },
  
  list: async (limit = 10, skip = 0) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/talk-points?limit=${limit}&skip=${skip}`,
      {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      }
    );
    
    return response.json();
  },
  
  get: async (id: string) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/talk-points/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      }
    );
    
    return response.json();
  },
  
  delete: async (id: string) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/talk-points/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      }
    );
    
    return response.json();
  }
};
```

### 4.3 Update `lib/api/sessions.ts`

**Add sales-specific fields to session creation:**

```typescript
// Update createSession function
export const createSession = async (data: {
  preparation_type: string;
  setup: {
    meeting_details: string;
    agenda: string;
    tone: string;
    background_context: string;
    // Add sales fields
    customer_name?: string;
    customer_persona?: string;
    deal_stage?: string;
  };
}) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  return response.json();
};
```

### 4.4 Update `lib/api/users.ts`

**Add company profile endpoints:**

```typescript
export const usersApi = {
  // ... existing methods
  
  updateProfile: async (data: {
    full_name?: string;
    company_profile?: {
      name: string;
      description: string;
      value_proposition: string;
      industry: string;
    };
  }) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    return response.json();
  }
};
```

---

## 5. TypeScript Type Definitions

### 5.1 Create `types/sales.ts`

```typescript
export enum DealStage {
  PROSPECTING = "Prospecting",
  DISCOVERY = "Discovery",
  QUALIFICATION = "Qualification",
  PROPOSAL = "Proposal",
  NEGOTIATION = "Negotiation",
  CLOSING = "Closing",
  FOLLOW_UP = "Follow-up"
}

export interface CompanyProfile {
  name: string;
  description: string;
  value_proposition: string;
  industry: string;
}

export interface SalesSessionSetup {
  customer_name: string;
  customer_persona: string;
  deal_stage: DealStage;
}

export interface SalesEvaluation {
  overall_score: number;
  strengths: string[];
  improvement_areas: string[];
  dimension_scores: {
    product_knowledge: number;
    customer_understanding: number;
    objection_handling: number;
    value_communication: number;
    question_quality: number;
    confidence_delivery: number;
  };
  sales_specific: {
    knowledge_base_usage: string;
    stage_appropriateness: string;
    personalization: string;
  };
}
```

### 5.2 Create `types/documents.ts`

```typescript
export enum DocumentStatus {
  PROCESSING = "processing",
  INDEXED = "indexed",
  FAILED = "failed"
}

export enum DocumentSource {
  UPLOAD = "upload",
  GOOGLE_DRIVE = "google_drive",
  SHAREPOINT = "sharepoint"
}

export interface Document {
  id: string;
  user_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  source: DocumentSource;
  status: DocumentStatus;
  chunk_count: number;
  metadata: Record<string, any>;
  uploaded_at: string;
  indexed_at?: string;
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
  limit: number;
  skip: number;
}
```

### 5.3 Create `types/talkPoints.ts`

```typescript
export interface TalkPoint {
  id: string;
  user_id: string;
  topic: string;
  customer_context?: string;
  deal_stage?: string;
  content: {
    opening_hook: string;
    problem_statement: string;
    solution_overview: string;
    key_benefits: string;
    proof_points: string;
    objection_handling: string;
    call_to_action: string;
  };
  sources_used: number;
  created_at: string;
}

export interface TalkPointListResponse {
  talk_points: TalkPoint[];
  total: number;
  limit: number;
  skip: number;
}
```

---

## 6. Navigation Updates

### 6.1 Update Navigation Menu

**Add new menu items:**

```typescript
const navigationItems = [
  { name: "Profile", href: "/profile", icon: UserIcon },
  { name: "Knowledge Base", href: "/knowledge-base", icon: BookIcon }, // NEW
  { name: "Talk Points", href: "/talk-points", icon: LightbulbIcon }, // NEW
  { name: "Sessions", href: "/sessions", icon: ChatIcon },
  { name: "Analytics", href: "/analytics", icon: ChartIcon }
];
```

**Update mobile menu** (if applicable)

---

## 7. Environment Variables

### 7.1 Update `.env.local`

```bash
# Existing
NEXT_PUBLIC_API_URL=http://localhost:8000

# Add if needed
NEXT_PUBLIC_MAX_FILE_SIZE=10485760  # 10MB in bytes
NEXT_PUBLIC_ALLOWED_FILE_TYPES=.pdf,.docx,.pptx,.txt
```

---

## 8. Implementation Priority

### Phase 1: Core Sales Features (Week 1)
1. ✅ Update Profile Page - Sales session setup fields
2. ✅ Update Session Page - RAG context display
3. ✅ Create API service modules (documents, talkPoints)
4. ✅ Create TypeScript type definitions

### Phase 2: Knowledge Base (Week 2)
5. ✅ Create Knowledge Base page
6. ✅ Create DocumentUploadZone component
7. ✅ Create DocumentTable component
8. ✅ Create DocumentViewerModal component

### Phase 3: Talk Points (Week 2)
9. ✅ Create Talk Points page
10. ✅ Create TalkPointsGenerator component
11. ✅ Create TalkPointsDisplay component
12. ✅ Create TalkPointsExporter component

### Phase 4: Enhanced Evaluation (Week 3)
13. ✅ Update Session Page - Sales evaluation display
14. ✅ Create SalesEvaluationDisplay component
15. ✅ Create ContextSourcesModal component

### Phase 5: Company Profile (Week 3)
16. ✅ Update Profile Page - Company profile section
17. ✅ Create CompanyProfileForm component
18. ✅ Update navigation menu

---

## 9. Testing Checklist

### 9.1 Profile Page
- [ ] Sales session setup fields appear when "Sales" is selected
- [ ] Company profile saves correctly
- [ ] Knowledge base section displays document count
- [ ] Talk points section displays recent talk points
- [ ] Session creation includes sales fields in payload

### 9.2 Session Page
- [ ] RAG context displays for AI messages
- [ ] Context sources modal shows document details
- [ ] Sales evaluation displays all 6 dimensions
- [ ] Sales-specific insights display correctly
- [ ] Session context banner shows for Sales sessions

### 9.3 Knowledge Base Page
- [ ] File upload works for all supported types
- [ ] Document list displays with correct status
- [ ] Document viewer shows metadata and preview
- [ ] Document deletion works with confirmation
- [ ] Pagination works correctly

### 9.4 Talk Points Page
- [ ] Talk points generation works
- [ ] All 7 sections display correctly
- [ ] Copy to clipboard works per section
- [ ] Export functionality works
- [ ] Talk points history displays correctly

---

## 10. Design Considerations

### 10.1 Color Scheme
- **Sales Features:** Amber/Gold accent (`amber-400`, `amber-500`)
- **Knowledge Base:** Blue accent (`blue-400`, `blue-500`)
- **Talk Points:** Purple accent (`purple-400`, `purple-500`)
- **Background:** Slate dark theme (existing)

### 10.2 Icons
- **Knowledge Base:** Book, Document, Upload icons
- **Talk Points:** Lightbulb, Sparkles, List icons
- **Sales:** Briefcase, Target, TrendingUp icons
- **RAG Context:** Link, Chain, Source icons

### 10.3 Animations
- Use Framer Motion (already in project)
- Fade in for new sections
- Slide up for modals
- Progress indicators for uploads/generation

---

## 11. Accessibility

### 11.1 Requirements
- All interactive elements keyboard accessible
- ARIA labels for icon buttons
- Focus indicators visible
- Screen reader announcements for status changes
- Alt text for all images/icons

### 11.2 Form Validation
- Clear error messages
- Inline validation
- Required field indicators
- Success confirmations

---

## 12. Mobile Responsiveness

### 12.1 Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### 12.2 Mobile Adaptations
- Stack form fields vertically
- Collapsible sections for mobile
- Bottom sheet modals instead of centered
- Touch-friendly button sizes (min 44px)

---

## 13. Performance Optimization

### 13.1 Code Splitting
- Lazy load Knowledge Base page
- Lazy load Talk Points page
- Lazy load heavy components (DocumentViewer, TalkPointsDisplay)

### 13.2 Data Fetching
- Use SWR or React Query for caching
- Implement pagination for all lists
- Debounce search inputs
- Show loading skeletons

### 13.3 File Upload
- Show upload progress
- Validate file size before upload
- Compress large files if possible
- Handle upload errors gracefully

---

## 14. Error Handling

### 14.1 API Errors
- Network errors: Show retry button
- 401 Unauthorized: Redirect to login
- 403 Forbidden: Show permission error
- 404 Not Found: Show not found message
- 500 Server Error: Show generic error + support contact

### 14.2 User Feedback
- Toast notifications for success/error
- Loading states for all async operations
- Confirmation dialogs for destructive actions
- Clear error messages with actionable steps

---

## 15. Backend API Endpoints Reference

### 15.1 Documents API
```
POST   /api/v1/documents/upload
GET    /api/v1/documents
GET    /api/v1/documents/{id}
DELETE /api/v1/documents/{id}
```

### 15.2 Talk Points API
```
POST   /api/v1/talk-points/generate
GET    /api/v1/talk-points
GET    /api/v1/talk-points/{id}
DELETE /api/v1/talk-points/{id}
```

### 15.3 Sessions API (Updated)
```
POST   /api/v1/sessions              # Now accepts sales fields
POST   /api/v1/sessions/{id}/messages # Returns retrieved_context_ids
POST   /api/v1/sessions/{id}/evaluate # Returns sales-specific evaluation
```

### 15.4 Users API (Updated)
```
PATCH  /api/v1/users/profile         # Now accepts company_profile
```

---

## 16. Next Steps

1. **Review this plan** with the team
2. **Create GitHub issues** for each component/page
3. **Set up project board** with phases
4. **Assign tasks** to frontend developers
5. **Schedule daily standups** during implementation
6. **Plan integration testing** after Phase 1

---

## Appendix A: File Structure

```
frontend/
├── app/
│   ├── profile/
│   │   └── page.tsx                    # UPDATE
│   ├── session/
│   │   └── [id]/
│   │       └── page.tsx                # UPDATE
│   ├── knowledge-base/
│   │   └── page.tsx                    # NEW
│   ├── talk-points/
│   │   └── page.tsx                    # NEW
│   └── components/
│       ├── DocumentUploadZone.tsx      # NEW
│       ├── DocumentStatusBadge.tsx     # NEW
│       ├── ContextSourcesModal.tsx     # NEW
│       ├── SalesSessionSetup.tsx       # NEW
│       ├── SalesEvaluationDisplay.tsx  # NEW
│       └── CompanyProfileForm.tsx      # NEW
├── lib/
│   └── api/
│       ├── documents.ts                # NEW
│       ├── talkPoints.ts               # NEW
│       ├── sessions.ts                 # UPDATE
│       └── users.ts                    # UPDATE
└── types/
    ├── sales.ts                        # NEW
    ├── documents.ts                    # NEW
    └── talkPoints.ts                   # NEW
```

---

## Appendix B: Estimated Effort

| Task | Estimated Hours | Priority |
|------|----------------|----------|
| Profile Page Updates | 8h | High |
| Session Page Updates | 6h | High |
| Knowledge Base Page | 16h | High |
| Talk Points Page | 12h | High |
| API Service Modules | 4h | High |
| Type Definitions | 2h | High |
| Shared Components | 12h | Medium |
| Navigation Updates | 2h | Medium |
| Testing | 16h | High |
| Documentation | 4h | Medium |
| **Total** | **82h** | |

**Estimated Timeline:** 3 weeks with 1 full-time frontend developer

---

## Document Control

**Author:** Backend Development Team  
**Reviewers:** Frontend Team, Product Manager  
**Last Updated:** 2026-02-19  
**Version:** 1.0  
**Status:** Ready for Implementation

---

**End of Document**
