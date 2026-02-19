/**
 * Sales-specific TypeScript type definitions
 * For Sales Call Prep Platform
 */

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

export interface SalesEvaluationDimensionScores {
  product_knowledge: number;
  customer_understanding: number;
  objection_handling: number;
  value_communication: number;
  question_quality: number;
  confidence_delivery: number;
}

export interface SalesSpecificAssessment {
  knowledge_base_usage: string;
  stage_appropriateness: string;
  personalization: string;
}

export interface SalesEvaluation {
  overall_score: number;
  strengths: string[];
  improvement_areas: string[];
  dimension_scores: SalesEvaluationDimensionScores;
  sales_specific: SalesSpecificAssessment;
}

// Extended session types for sales
export interface SalesSessionContext {
  customer_name: string;
  customer_persona: string;
  deal_stage: DealStage;
  agenda?: string;
  tone?: string;
  background_context?: string;
}

export interface SalesSessionCreate {
  preparation_type: "Sales";
  setup: SalesSessionContext;
}

export interface SalesSessionResponse {
  session_id: string;
  user_id: string;
  preparation_type: "Sales";
  context_payload: SalesSessionContext;
  transcript: Array<{
    role: "ai" | "user";
    message: string;
    timestamp: string;
    retrieved_context_ids?: string[];
  }>;
  status: "setup" | "in_progress" | "completed" | "archived";
  created_at: string;
  completed_at?: string;
}
