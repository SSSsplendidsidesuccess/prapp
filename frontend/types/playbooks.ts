/**
 * Playbook TypeScript type definitions
 * For Sales Call Prep Platform - Playbook Builder Feature
 */

export enum PlaybookStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived"
}

export enum DealStage {
  PROSPECTING = "Prospecting",
  DISCOVERY = "Discovery",
  QUALIFICATION = "Qualification",
  PROPOSAL = "Proposal",
  NEGOTIATION = "Negotiation",
  CLOSING = "Closing",
  FOLLOW_UP = "Follow-up"
}

export interface ObjectionResponse {
  objection: string;
  response: string;
}

export interface CompetitiveBattleCard {
  competitor_name: string;
  our_advantage: string;
  their_weakness: string;
  key_differentiator: string;
}

export interface ContentSection {
  opening_strategy?: string;
  key_messages: string[];
  value_propositions: string[];
  proof_points: string[];
  discovery_questions: string[];
  objection_handling: ObjectionResponse[];
  competitive_battle_cards: CompetitiveBattleCard[];
  next_steps: string[];
}

export interface Scenario {
  id: string;
  title: string;
  deal_stage: DealStage;
  meeting_context?: string;
  customer_pain_points: string[];
  competitors: string[];
  content: ContentSection;
}

export interface Playbook {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_persona?: string;
  industry?: string;
  product_line?: string;
  status: PlaybookStatus;
  is_template: boolean;
  scenarios: Scenario[];
  created_at: string;
  updated_at: string;
}

export interface PlaybookCreate {
  title: string;
  description?: string;
  target_persona?: string;
  industry?: string;
  product_line?: string;
}

export interface PlaybookUpdate {
  title?: string;
  description?: string;
  target_persona?: string;
  industry?: string;
  product_line?: string;
  status?: PlaybookStatus;
}

export interface PlaybookListResponse {
  playbooks: Playbook[];
  total: number;
  limit: number;
  offset: number;
}

export interface ScenarioCreate {
  title: string;
  deal_stage: DealStage;
  meeting_context?: string;
  customer_pain_points?: string[];
  competitors?: string[];
}

export interface ScenarioUpdate {
  title?: string;
  deal_stage?: DealStage;
  meeting_context?: string;
  customer_pain_points?: string[];
  competitors?: string[];
  content?: ContentSection;
}

export interface GeneratePlaybookRequest {
  target_persona: string;
  industry: string;
  product_line: string;
  goals?: string[];
}

export interface GenerateScenarioContentRequest {
  focus_areas?: string[];
  additional_context?: string;
}

export interface GenerateScenarioContentResponse {
  content: ContentSection;
  message: string;
}
