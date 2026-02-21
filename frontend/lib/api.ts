// Production-first API URL configuration
// Uses production URL by default, can be overridden with NEXT_PUBLIC_API_URL env var for local dev
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  || 'https://prapp-backend-docker.onrender.com/api/v1';

// Import types
import type {
  Document,
  DocumentListResponse,
  DocumentUploadResponse
} from '@/types/documents';
import type {
  TalkPoint,
  TalkPointListResponse,
  TalkPointGenerateRequest,
  TalkPointGenerateResponse
} from '@/types/talkPoints';
import type {
  CompanyProfile,
  DealStage
} from '@/types/sales';
import type {
  Playbook,
  PlaybookCreate,
  PlaybookUpdate,
  PlaybookListResponse,
  Scenario,
  ScenarioCreate,
  ScenarioUpdate,
  GeneratePlaybookRequest,
  GenerateScenarioContentRequest,
  GenerateScenarioContentResponse
} from '@/types/playbooks';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Make an authenticated API request
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = false, headers = {}, ...fetchOptions } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  // Add Authorization header if authentication is required
  if (requiresAuth) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      
      if (isJson) {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } else {
        errorMessage = await response.text() || errorMessage;
      }

      throw new ApiError(response.status, errorMessage);
    }

    // Return parsed JSON or null for empty responses
    if (isJson) {
      return await response.json();
    }

    return null as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new Error(
      error instanceof Error ? error.message : 'An unexpected error occurred'
    );
  }
}

/**
 * Authentication API calls
 */
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (email: string, password: string, name: string) =>
    apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
      requiresAuth: true,
    }),

  getCurrentUser: () =>
    apiRequest('/auth/me', {
      requiresAuth: true,
    }),

  forgotPassword: (email: string): Promise<{ message: string; reset_link: string }> =>
    apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, new_password: string): Promise<{ message: string }> =>
    apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password }),
    }),
};

/**
 * User API calls
 */
export const userApi = {
  getProfile: (userId: string) =>
    apiRequest(`/users/${userId}`, {
      requiresAuth: true,
    }),

  updateProfile: (userId: string, data: any) =>
    apiRequest(`/users/${userId}`, {
      method: 'PUT',
      requiresAuth: true,
      body: JSON.stringify(data),
    }),

  /**
   * Update user profile with company profile
   */
  updateProfileWithCompany: (data: {
    full_name?: string;
    company_profile?: CompanyProfile;
  }) =>
    apiRequest('/users/profile', {
      method: 'PATCH',
      requiresAuth: true,
      body: JSON.stringify(data),
    }),
};

/**
 * PRD API calls
 */
export const prdApi = {
  list: () =>
    apiRequest('/prds', {
      requiresAuth: true,
    }),

  get: (prdId: string) =>
    apiRequest(`/prds/${prdId}`, {
      requiresAuth: true,
    }),

  create: (data: any) =>
    apiRequest('/prds', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(data),
    }),

  update: (prdId: string, data: any) =>
    apiRequest(`/prds/${prdId}`, {
      method: 'PUT',
      requiresAuth: true,
      body: JSON.stringify(data),
    }),

  delete: (prdId: string) =>
    apiRequest(`/prds/${prdId}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),
};

// ============================================================================
// SESSION API TYPES
// ============================================================================

export type PreparationType = 'Interview' | 'Corporate' | 'Pitch' | 'Sales' | 'Presentation' | 'Other';
export type SessionStatus = 'setup' | 'in_progress' | 'completed' | 'archived';

export interface ChatMessage {
  role: 'ai' | 'user';
  message: string;
  timestamp: string;
  retrieved_context_ids?: string[];
}

export interface SessionCreate {
  preparation_type: PreparationType;
  meeting_subtype?: string;
  agenda?: string;
  tone?: string;
  role_context?: string;
}

export interface SessionResponse {
  session_id: string;
  user_id: string;
  preparation_type: PreparationType;
  meeting_subtype?: string;
  context_payload: {
    agenda?: string;
    tone?: string;
    role_context?: string;
  };
  transcript: ChatMessage[];
  status: SessionStatus;
  created_at: string;
  completed_at?: string;
}

export interface SessionListResponse {
  sessions: SessionResponse[];
  total: number;
  limit: number;
  offset: number;
}

export interface SendMessageRequest {
  message: string;
}

export interface SendMessageResponse {
  ai_response: string;
  turn_number: number;
}

export interface SessionUpdate {
  status?: SessionStatus;
}

// ============================================================================
// SESSION EVALUATION TYPES
// ============================================================================

export interface SessionEvaluationScores {
  clarity_structure: number;
  relevance_focus: number;
  confidence_delivery: number;
  language_quality: number;
  tone_alignment: number;
  engagement: number;
}

export interface ImprovementArea {
  dimension: string;
  current_level: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}

export interface SessionEvaluationResponse {
  evaluation_id: string;
  session_id: string;
  user_id: string;
  universal_scores: SessionEvaluationScores;
  context_scores?: Record<string, number>;
  improvement_areas: ImprovementArea[];
  practice_suggestions: string[];
  strengths: string[];
  overall_score: number;
  summary: string;
  created_at: string;
}

export interface EvaluateSessionRequest {
  force_reevaluate?: boolean;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface AnalyticsTrends {
  average_scores: SessionEvaluationScores;
  improvement_velocity: number;
  recurring_weaknesses: string[];
  score_progression: Array<{
    session_id: string;
    date: string;
    overall_score: number;
  }>;
  recent_trend: 'improving' | 'stable' | 'declining';
  total_sessions: number;
}

export interface ImprovementRecommendations {
  current_focus_areas: ImprovementArea[];
  practice_suggestions: string[];
  recurring_weaknesses: string[];
  last_evaluation_date?: string;
  message?: string;
}

// ============================================================================
// SESSION API CALLS
// ============================================================================

/**
 * Session API calls
 */
export const sessionApi = {
  /**
   * Create a new preparation session
   */
  createSession: (data: SessionCreate): Promise<SessionResponse> =>
    apiRequest('/sessions', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(data),
    }),

  /**
   * Get all sessions for the current user
   */
  getSessions: (params?: {
    status?: SessionStatus;
    limit?: number;
    offset?: number;
  }): Promise<SessionListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status_filter', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/sessions?${queryString}` : '/sessions';
    
    return apiRequest(endpoint, {
      requiresAuth: true,
    });
  },

  /**
   * Get a specific session by ID
   */
  getSession: (sessionId: string): Promise<SessionResponse> =>
    apiRequest(`/sessions/${sessionId}`, {
      requiresAuth: true,
    }),

  /**
   * Update a session's status
   */
  updateSession: (sessionId: string, data: SessionUpdate): Promise<SessionResponse> =>
    apiRequest(`/sessions/${sessionId}`, {
      method: 'PATCH',
      requiresAuth: true,
      body: JSON.stringify(data),
    }),

  /**
   * Delete a session (soft delete - archives it)
   */
  deleteSession: (sessionId: string): Promise<{ message: string; session_id: string }> =>
    apiRequest(`/sessions/${sessionId}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),

  /**
   * Send a message in a session and get AI response
   */
  sendMessage: (sessionId: string, message: string): Promise<SendMessageResponse> =>
    apiRequest(`/sessions/${sessionId}/messages`, {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({ message }),
    }),

  /**
   * Complete a session
   */
  completeSession: (sessionId: string): Promise<SessionResponse> =>
    apiRequest(`/sessions/${sessionId}/complete`, {
      method: 'POST',
      requiresAuth: true,
    }),

  /**
   * Evaluate a completed session
   */
  evaluateSession: (
    sessionId: string,
    data?: EvaluateSessionRequest
  ): Promise<SessionEvaluationResponse> =>
    apiRequest(`/sessions/${sessionId}/evaluate`, {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(data || {}),
    }),

  /**
   * Get evaluation results for a session
   */
  getEvaluation: (sessionId: string): Promise<SessionEvaluationResponse> =>
    apiRequest(`/sessions/${sessionId}/evaluation`, {
      requiresAuth: true,
    }),
};

// ============================================================================
// ANALYTICS API CALLS
// ============================================================================

/**
 * Analytics API calls
 */
export const analyticsApi = {
  /**
   * Get performance trends over time
   */
  getAnalyticsTrends: (): Promise<AnalyticsTrends> =>
    apiRequest('/analytics/trends', {
      requiresAuth: true,
    }),

  /**
   * Get current improvement recommendations
   */
  getImprovements: (): Promise<ImprovementRecommendations> =>
    apiRequest('/analytics/improvements', {
      requiresAuth: true,
    }),
};

// ============================================================================
// DOCUMENTS API (Knowledge Base)
// ============================================================================

/**
 * Documents API calls for Knowledge Base management
 */
export const documentsApi = {
  /**
   * Upload a document to the knowledge base
   */
  upload: async (file: File): Promise<DocumentUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.detail || `Upload failed with status ${response.status}`
      );
    }

    return response.json();
  },

  /**
   * List all documents for the current user
   */
  list: (params?: {
    limit?: number;
    skip?: number;
  }): Promise<DocumentListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/documents?${queryString}` : '/documents';
    
    return apiRequest(endpoint, {
      requiresAuth: true,
    });
  },

  /**
   * Get a specific document by ID
   */
  get: (documentId: string): Promise<Document> =>
    apiRequest(`/documents/${documentId}`, {
      requiresAuth: true,
    }),

  /**
   * Delete a document
   */
  delete: (documentId: string): Promise<{ message: string; document_id: string }> =>
    apiRequest(`/documents/${documentId}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),
};

// ============================================================================
// TALK POINTS API
// ============================================================================

/**
 * Talk Points API calls for sales preparation
 */
export const talkPointsApi = {
  /**
   * Generate talk points using RAG
   */
  generate: (data: TalkPointGenerateRequest): Promise<TalkPointGenerateResponse> =>
    apiRequest('/talk-points/generate', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(data),
    }),

  /**
   * List all talk points for the current user
   */
  list: (params?: {
    limit?: number;
    skip?: number;
  }): Promise<TalkPointListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/talk-points?${queryString}` : '/talk-points';
    
    return apiRequest(endpoint, {
      requiresAuth: true,
    });
  },

  /**
   * Get a specific talk point by ID
   */
  get: (talkPointId: string): Promise<TalkPoint> =>
    apiRequest(`/talk-points/${talkPointId}`, {
      requiresAuth: true,
    }),

  /**
   * Delete a talk point
   */
  delete: (talkPointId: string): Promise<{ message: string; talk_point_id: string }> =>
    apiRequest(`/talk-points/${talkPointId}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),
};

// ============================================================================
// PLAYBOOKS API
// ============================================================================

/**
 * Playbooks API calls for sales playbook management
 */
export const playbooksApi = {
  /**
   * Create a new playbook
   */
  create: (data: PlaybookCreate): Promise<Playbook> =>
    apiRequest('/playbooks', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(data),
    }),

  /**
   * List all playbooks for the current user
   */
  list: (params?: {
    limit?: number;
    offset?: number;
    status?: string;
    is_template?: boolean;
  }): Promise<PlaybookListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.is_template !== undefined) queryParams.append('is_template', params.is_template.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/playbooks?${queryString}` : '/playbooks';
    
    return apiRequest(endpoint, {
      requiresAuth: true,
    });
  },

  /**
   * Get a specific playbook by ID
   */
  get: (playbookId: string): Promise<Playbook> =>
    apiRequest(`/playbooks/${playbookId}`, {
      requiresAuth: true,
    }),

  /**
   * Update a playbook
   */
  update: (playbookId: string, data: PlaybookUpdate): Promise<Playbook> =>
    apiRequest(`/playbooks/${playbookId}`, {
      method: 'PUT',
      requiresAuth: true,
      body: JSON.stringify(data),
    }),

  /**
   * Delete a playbook
   */
  delete: (playbookId: string): Promise<{ message: string }> =>
    apiRequest(`/playbooks/${playbookId}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),

  /**
   * Add a scenario to a playbook
   */
  addScenario: (playbookId: string, data: ScenarioCreate): Promise<Scenario> =>
    apiRequest(`/playbooks/${playbookId}/scenarios`, {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(data),
    }),

  /**
   * Update a scenario in a playbook
   */
  updateScenario: (playbookId: string, scenarioId: string, data: ScenarioUpdate): Promise<Scenario> =>
    apiRequest(`/playbooks/${playbookId}/scenarios/${scenarioId}`, {
      method: 'PUT',
      requiresAuth: true,
      body: JSON.stringify(data),
    }),

  /**
   * Delete a scenario from a playbook
   */
  deleteScenario: (playbookId: string, scenarioId: string): Promise<{ message: string }> =>
    apiRequest(`/playbooks/${playbookId}/scenarios/${scenarioId}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),

  /**
   * Generate playbook structure using AI
   */
  generate: (data: GeneratePlaybookRequest): Promise<Playbook> =>
    apiRequest('/playbooks/generate-structure', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(data),
    }),

  /**
   * Generate scenario content using AI and RAG
   */
  generateScenarioContent: (
    playbookId: string,
    scenarioId: string,
    data: GenerateScenarioContentRequest
  ): Promise<GenerateScenarioContentResponse> =>
    apiRequest(`/playbooks/${playbookId}/scenarios/${scenarioId}/generate`, {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(data),
    }),

  /**
   * Save playbook as template
   */
  saveAsTemplate: (playbookId: string): Promise<Playbook> =>
    apiRequest(`/playbooks/${playbookId}/template`, {
      method: 'POST',
      requiresAuth: true,
    }),

  /**
   * List templates
   */
  listTemplates: (params?: {
    limit?: number;
    offset?: number;
  }): Promise<PlaybookListResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('is_template', 'true');
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const endpoint = `/playbooks?${queryParams.toString()}`;
    
    return apiRequest(endpoint, {
      requiresAuth: true,
    });
  },
};