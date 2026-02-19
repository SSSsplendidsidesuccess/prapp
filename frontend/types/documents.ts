/**
 * Document and Knowledge Base TypeScript type definitions
 * For Sales Call Prep Platform
 */

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

export interface DocumentUploadResponse {
  id: string;
  filename: string;
  status: DocumentStatus;
  message: string;
}

export interface RAGContext {
  document_id: string;
  chunk_text: string;
  similarity_score: number;
  metadata: Record<string, any>;
}
