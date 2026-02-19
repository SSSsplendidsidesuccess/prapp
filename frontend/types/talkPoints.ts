/**
 * Talk Points TypeScript type definitions
 * For Sales Call Prep Platform
 */

export interface TalkPointContent {
  opening_hook: string;
  problem_statement: string;
  solution_overview: string;
  key_benefits: string;
  proof_points: string;
  objection_handling: string;
  call_to_action: string;
}

export interface TalkPoint {
  id: string;
  user_id: string;
  topic: string;
  customer_context?: string;
  deal_stage?: string;
  content: TalkPointContent;
  sources_used: number;
  created_at: string;
}

export interface TalkPointListResponse {
  talk_points: TalkPoint[];
  total: number;
  limit: number;
  skip: number;
}

export interface TalkPointGenerateRequest {
  topic: string;
  customer_context?: string;
  deal_stage?: string;
}

export interface TalkPointGenerateResponse {
  id: string;
  topic: string;
  content: TalkPointContent;
  sources_used: number;
  message: string;
}
